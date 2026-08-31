'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { CredentialDto } from '@dojo-hub/shared';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { levelLine, subjectLine } from './certificate-subject';

/** Horizontal wordmark — carries the Dojo Hub name, so no separate text heading is drawn. */
const LOGO_SRC = '/dojohub-wordmark.jpeg';
/** The certificate's paper colour. The wordmark ships on an off-white field, which is
 *  keyed out and re-flattened onto this so it blends into the page. */
const PAPER = { hex: '#fdfcfa', rgb: [253, 252, 250] as const };

/** Cursive stack for the signature line — falls back gracefully on Windows/macOS/Linux. */
/**
 * Who a course certificate is awarded by. Course certificates carry no evaluator or admin
 * signature because nobody reviews them — the awarding authority is the organisation, so
 * the CEO signs on its behalf.
 *
 * `image` is optional: if the file is absent the drawn signature falls back to the name
 * rendered in a script face, so a missing asset never blocks a certificate.
 */
export const AWARDING_SIGNATORY = {
  name: 'David Tusubira Sunday',
  role: 'CEO, Director - Dojo Hub',
  image: '/signature-ceo.png',
} as const;

const SIGNATURE_FONT = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';

/**
 * Centres letter-spaced text in the PDF.
 *
 * jsPDF's `align: 'center'` measures the string without the per-character spacing it is
 * about to add, so anything drawn with `charSpace` renders wider than the width used to
 * position it and ends up pushed right of centre — by half the total added spacing. The
 * wider the tracking, the further it drifts, which is why the title lines did not sit
 * over each other. Measuring the real width and placing it left-aligned avoids the whole
 * problem.
 */
function centredText(
  doc: jsPDF,
  text: string,
  centreX: number,
  y: number,
  charSpace = 0,
) {
  const width = doc.getTextWidth(text) + charSpace * Math.max(0, text.length - 1);
  doc.text(text, centreX - width / 2, y, { charSpace });
}

/** "1 September 2026" — unambiguous across locales, unlike 01/09/2026. */
function formatIssueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function authenticationId(credential: CredentialDto): string {
  return `DH-${credential.id.slice(0, 8).toUpperCase()}-${credential.hash.slice(0, 8).toUpperCase()}`;
}

type LoadedLogo = { dataUrl: string; width: number; height: number };
type LoadedImage = LoadedLogo;

/**
 * Reads a static image into a data URL so jsPDF can embed it. Rejects on a missing or
 * unreadable file, which callers treat as "draw the fallback instead" rather than an error.
 */
function loadImage(src: string): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('No 2D context'));
      ctx.drawImage(img, 0, 0);
      resolve({
        dataUrl: canvas.toDataURL('image/png'),
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error(`Could not load ${src}`));
    img.src = src;
  });
}

/**
 * jsPDF embeds PNG pixel data uncompressed, so the full-size logo would add megabytes to
 * every certificate. Downscale to 700px first — at a 70mm print width that is still
 * ~250 DPI, comfortably above print requirements for a wordmark.
 */
const LOGO_PDF_WIDTH_PX = 700;

/** Pixels at least this bright on every channel count as the wordmark's backdrop. */
const BACKDROP_THRESHOLD = 232;

/** Bounding box of everything that is not backdrop, so the logo can be cropped to its mark. */
function inkBounds(frame: ImageData, width: number, height: number) {
  const px = frame.data;
  let minX = width;
  let maxX = -1;
  let minY = height;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const isInk =
        px[i] < BACKDROP_THRESHOLD ||
        px[i + 1] < BACKDROP_THRESHOLD ||
        px[i + 2] < BACKDROP_THRESHOLD;
      if (!isInk) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return maxX < 0 ? null : { minX, maxX, minY, maxY };
}

/**
 * Loads the wordmark, downscales it, and repaints its off-white backdrop to the
 * certificate's paper colour — the source is a JPEG (no alpha), so without this it
 * would sit on the page as a visible grey rectangle.
 */
function loadLogo(): Promise<LoadedLogo> {
  return new Promise<LoadedLogo>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, LOGO_PDF_WIDTH_PX / img.naturalWidth);
      const width = Math.round(img.naturalWidth * scale);
      const height = Math.round(img.naturalHeight * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('canvas 2d context unavailable'));
        return;
      }
      ctx.fillStyle = PAPER.hex;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const frame = ctx.getImageData(0, 0, width, height);
      const px = frame.data;
      const [pr, pg, pb] = PAPER.rgb;
      for (let i = 0; i < px.length; i += 4) {
        if (px[i] >= BACKDROP_THRESHOLD && px[i + 1] >= BACKDROP_THRESHOLD && px[i + 2] >= BACKDROP_THRESHOLD) {
          px[i] = pr;
          px[i + 1] = pg;
          px[i + 2] = pb;
        }
      }
      ctx.putImageData(frame, 0, 0);

      // The wordmark ships with wide empty margins baked in — roughly 18% of its width
      // and 25% of its height on each side. Placed as-is it centres correctly but draws
      // small, floating in its own padding. Cropping to the ink means the mark fills the
      // space it is given and is centred on the artwork rather than on the canvas.
      const bounds = inkBounds(frame, width, height);
      if (bounds) {
        const cropW = bounds.maxX - bounds.minX + 1;
        const cropH = bounds.maxY - bounds.minY + 1;
        const cropped = document.createElement('canvas');
        cropped.width = cropW;
        cropped.height = cropH;
        const cctx = cropped.getContext('2d');
        if (cctx) {
          cctx.fillStyle = PAPER.hex;
          cctx.fillRect(0, 0, cropW, cropH);
          cctx.drawImage(canvas, bounds.minX, bounds.minY, cropW, cropH, 0, 0, cropW, cropH);
          resolve({ dataUrl: cropped.toDataURL('image/png'), width: cropW, height: cropH });
          return;
        }
      }

      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = () => reject(new Error('logo failed to load'));
    img.src = LOGO_SRC;
  });
}

export function CertificateModal({
  credential,
  onClose,
  embedded = false,
}: {
  credential: CredentialDto;
  /** Omitted when embedded — there is no modal to close. */
  onClose?: () => void;
  /** Renders the certificate and its actions without the modal chrome, for the public
   *  verification page, which anyone can open on any device without signing in. */
  embedded?: boolean;
}) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [logo, setLogo] = useState<LoadedLogo | null>(null);
  const [signatureOk, setSignatureOk] = useState(true);
  const [signature, setSignature] = useState<LoadedImage | null>(null);

  useEffect(() => {
    QRCode.toDataURL(credential.verifyUrl, { margin: 1, width: 240 }).then(setQrDataUrl);
  }, [credential.verifyUrl]);

  useEffect(() => {
    // A missing logo must not block issuing the certificate — the PDF just omits it.
    loadLogo()
      .then(setLogo)
      .catch(() => setLogo(null));
  }, []);

  useEffect(() => {
    // Same tolerance for the signature: absent asset falls back to the script-face name.
    loadImage(AWARDING_SIGNATORY.image)
      .then(setSignature)
      .catch(() => setSignature(null));
  }, []);

  const issuedOn = formatIssueDate(credential.issuedAt);
  const authId = authenticationId(credential);
  // A course certificate is awarded by the organisation, not by a reviewer — nobody
  // graded it. Falling through to the signed names left "Awarded by" blank on every
  // course certificate, since those carry neither signature.
  const signatoryName =
    credential.adminSignatureName ?? credential.evaluatorSignatureName ?? AWARDING_SIGNATORY.name;
  const signatoryRole = credential.adminSignatureName
    ? 'Director, Dojo Hub (SMC)'
    : credential.evaluatorSignatureName
      ? 'Lead Evaluator'
      : AWARDING_SIGNATORY.role;

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const mid = w / 2;

    // Cream field: prints cleanly and costs far less ink than a dark fill.
    doc.setFillColor(PAPER.rgb[0], PAPER.rgb[1], PAPER.rgb[2]);
    doc.rect(0, 0, w, h, 'F');

    // Soft crimson washes bleeding in from opposite corners, matching the on-screen
    // certificate. Drawn as stacked translucent discs because jsPDF has no gradient
    // primitive; each ring is faint enough that the edge reads as a fade, not a circle.
    const wash = (cx: number, cy: number, maxR: number, alpha: number) => {
      for (let i = 6; i >= 1; i--) {
        doc.saveGraphicsState();
        // @ts-expect-error -- GState is present at runtime; jsPDF's types omit it.
        doc.setGState(new doc.GState({ opacity: alpha * (1 - i / 7) }));
        doc.setFillColor(210, 15, 40);
        doc.circle(cx, cy, (maxR * i) / 6, 'F');
        doc.restoreGraphicsState();
      }
    };
    wash(6, 6, 62, 0.5);
    wash(w - 4, h - 2, 74, 0.42);

    // A single hairline frame — restraint reads as formal; heavy borders read as a coupon.
    doc.setDrawColor(210, 15, 40);
    doc.setLineWidth(0.35);
    doc.rect(10, 10, w - 20, h - 20);

    // The wordmark carries the Dojo Hub name, so no separate text heading is drawn.
    if (logo) {
      const logoW = 72;
      const logoH = (logo.height / logo.width) * logoW;
      doc.addImage(logo.dataUrl, 'PNG', mid - logoW / 2, 20, logoW, logoH);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(34);
    doc.setTextColor(5, 7, 12);
    centredText(doc, 'CERTIFICATE', mid, 62, 1.2);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(210, 15, 40);
    centredText(doc, 'OF COMPLETION', mid, 72, 2.6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 128, 144);
    doc.text('HAS BEEN AWARDED TO', mid, 82, { align: 'center' });

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(30);
    doc.setTextColor(210, 15, 40);
    doc.text(credential.studentName, mid, 97, { align: 'center' });

    doc.setDrawColor(210, 214, 222);
    doc.setLineWidth(0.3);
    doc.line(mid - 65, 102, mid + 65, 102);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 148, 162);
    const level = levelLine(credential);
    if (level) centredText(doc, level.toUpperCase(), mid, 108, 0.6);

    doc.setFontSize(9);
    doc.setTextColor(90, 98, 114);
    doc.text('for successfully completing', mid, 120, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(21);
    doc.setTextColor(30, 37, 51);
    doc.text(subjectLine(credential), mid, 132, { align: 'center' });

    // --- Footer row: date (left) · QR (centre) · signature (right) ---
    // Vertical rhythm is deliberately spaced so the signatory's role clears the
    // provenance rule below it — it used to collide and read as cut off.
    const ruleY = 168;
    const labelY = 173;
    const nameY = 177.5;

    doc.setDrawColor(30, 37, 51);
    doc.setLineWidth(0.4);
    doc.line(32, ruleY, 88, ruleY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 37, 51);
    doc.text(issuedOn, 60, ruleY - 3, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 98, 114);
    doc.text('DATE OF ISSUANCE', 60, labelY, { align: 'center' });

    if (qrDataUrl) {
      const qr = 28;
      doc.addImage(qrDataUrl, 'PNG', mid - qr / 2, 138, qr, qr);
    }

    doc.setDrawColor(30, 37, 51);
    doc.setLineWidth(0.4);
    doc.line(w - 88, ruleY, w - 32, ruleY);
    if (signature) {
      // Real signature, sized to sit on the rule without overflowing it.
      const sigW = 34;
      const sigH = Math.min(14, (signature.height / signature.width) * sigW);
      doc.addImage(signature.dataUrl, 'PNG', w - 60 - sigW / 2, ruleY - sigH - 1, sigW, sigH);
    } else if (signatoryName) {
      doc.setFont('times', 'italic');
      doc.setFontSize(17);
      doc.setTextColor(30, 37, 51);
      doc.text(signatoryName, w - 60, ruleY - 3.5, { align: 'center' });
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 98, 114);
    doc.text('AWARDED BY', w - 60, labelY, { align: 'center' });
    if (signatoryName) {
      // The signature above already carries the name — repeating it here printed it twice.
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 37, 51);
      doc.text(signatoryRole, w - 60, nameY, { align: 'center' });
    }

    // --- Provenance strip ---
    doc.setDrawColor(228, 231, 237);
    doc.setLineWidth(0.3);
    doc.line(20, h - 24.5, w - 20, h - 24.5);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 128, 144);
    doc.text(`AUTHENTICATION ID: ${authId}`, 20, h - 20);
    doc.text(`VERIFY: ${credential.verifyUrl}`, w - 20, h - 20, { align: 'right' });

    if (credential.evaluatorSignatureName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`Assessed by ${credential.evaluatorSignatureName}`, 20, h - 15.5);
    }
    doc.setFont('courier', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(170, 176, 188);
    doc.text(credential.hash, w - 20, h - 15.5, { align: 'right' });

    doc.save(`DojoHub_Certificate_${credential.studentName.replace(/\s+/g, '_')}_${credential.subjectTitle.replace(/\s+/g, '_')}.pdf`);
  };

  const sheet = (
    <>
      <div
        id="print-certificate-canvas"
        className="relative bg-[#fdfcfa] rounded-xl overflow-hidden ring-1 ring-navy-950/10 shadow-[0_2px_20px_rgba(5,7,12,0.06)]"
      >
        {/*
          Soft crimson bleeding in from opposite corners, echoing the organic wash on the
          reference certificate. Pure CSS gradients rather than images so it stays crisp at
          any size and adds nothing to the page weight.
        */}
        <div
          aria-hidden
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(210,15,40,0.16) 0%, rgba(210,15,40,0) 70%)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-28 -right-24 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(210,15,40,0.13) 0%, rgba(210,15,40,0) 70%)' }}
        />
        <div
          aria-hidden
          className="absolute top-1/3 -right-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(5,7,12,0.05) 0%, rgba(5,7,12,0) 70%)' }}
        />

        {/* Hairline inner frame — restraint reads as formal; a heavy border reads as a coupon. */}
        <div className="absolute inset-3 border border-crimson-600/25 rounded-lg pointer-events-none" />

        <div className="relative px-8 sm:px-12 py-9 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset, print view */}
          <img src={logo?.dataUrl ?? LOGO_SRC} alt="Dojo Hub" className="h-14 w-auto mx-auto" />

          {/* --- title, split across two weights like the reference --- */}
          <h2 className="mt-7 text-4xl sm:text-5xl font-extrabold tracking-[0.06em] text-navy-950 leading-none"
            style={{ marginRight: '-0.06em' }}>
            CERTIFICATE
          </h2>
          <p className="mt-1.5 text-xl sm:text-2xl tracking-[0.22em] text-crimson-600 font-semibold"
            style={{ marginRight: '-0.22em' }}>
            OF COMPLETION
          </p>

          <p className="mt-7 text-[11px] uppercase tracking-[0.24em] text-navy-400 font-semibold"
            style={{ marginRight: '-0.24em' }}>
            Has been awarded to
          </p>

          <p className="mt-3 text-3xl sm:text-4xl font-bold italic text-crimson-600 leading-tight">
            {credential.studentName}
          </p>
          <div className="mx-auto mt-3 h-px w-3/4 bg-navy-950/25" />
          {levelLine(credential) && (
            <p className="mt-2.5 text-[11px] uppercase tracking-[0.18em] text-navy-400 font-semibold"
              style={{ marginRight: '-0.18em' }}>
              {levelLine(credential)}
            </p>
          )}

          <p className="mt-6 text-xs text-navy-500">for successfully completing</p>
          <p className="mt-1.5 text-2xl sm:text-[1.7rem] font-extrabold text-navy-950 leading-tight text-balance">
            {subjectLine(credential)}
          </p>

          {/* --- date · seal · signature --- */}
          <div className="mt-9 grid grid-cols-3 items-end gap-6">
            <div>
              <p className="text-sm text-navy-900">{issuedOn}</p>
              <div className="mt-1.5 h-px bg-navy-950/70" />
              <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-navy-500">
                Date of Issuance
              </p>
            </div>

            {/* The QR is the seal: it is what actually proves the certificate, so it takes
                the centre position the reference gives its medallion. */}
            <div className="flex flex-col items-center">
              <div className="relative p-2 rounded-xl bg-white ring-1 ring-navy-950/10 shadow-sm">
                <div className="absolute -inset-1 rounded-2xl border border-crimson-600/25 pointer-events-none" />
                {/* eslint-disable-next-line @next/next/no-img-element -- data: URL */}
                {qrDataUrl && <img src={qrDataUrl} alt="Verification QR code" className="w-20 h-20 block" />}
              </div>
            </div>

            <div>
              {/* Real signature when the asset is present; the script-face name is the
                  fallback so a missing file never leaves the line blank. */}
              <div className="h-10 flex items-end justify-center">
                {signatureOk ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static asset
                  <img
                    src={AWARDING_SIGNATORY.image}
                    alt=""
                    className="max-h-10 w-auto object-contain"
                    onError={() => setSignatureOk(false)}
                  />
                ) : (
                  signatoryName && (
                    <p className="text-xl text-navy-900 leading-none" style={{ fontFamily: SIGNATURE_FONT }}>
                      {signatoryName}
                    </p>
                  )
                )}
              </div>
              <div className="mt-1.5 h-px bg-navy-950/70" />
              <p className="mt-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-navy-500">Awarded by</p>
              {signatoryName && (
                <p className="mt-1 text-xs font-bold text-navy-950 leading-tight">{signatoryRole}</p>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-navy-950/10 pt-3 text-left">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="text-[11px] font-mono text-navy-500">
                <span className="text-navy-400">Authentication ID: </span>
                {authId}
              </p>
              {credential.evaluatorSignatureName && (
                <p className="text-[11px] text-navy-400">Assessed by {credential.evaluatorSignatureName}</p>
              )}
            </div>
            <p className="mt-1 text-[10px] font-mono text-navy-300 break-all">{credential.hash}</p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}>
          Print Certificate
        </Button>
        <Button className="flex-1" onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </div>
    </>
  );

  if (embedded) return sheet;

  return (
    <Modal open onClose={onClose ?? (() => {})} title="Official Credential" maxWidth="max-w-3xl">
      {sheet}
    </Modal>
  );
}
