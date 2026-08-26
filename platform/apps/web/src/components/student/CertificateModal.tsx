'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { CredentialDto } from '@dojo-hub/shared';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { subjectLine } from './certificate-subject';

/** Horizontal wordmark — carries the Dojo Hub name, so no separate text heading is drawn. */
const LOGO_SRC = '/dojohub-wordmark.jpeg';
/** The certificate's paper colour. The wordmark ships on an off-white field, which is
 *  keyed out and re-flattened onto this so it blends into the page. */
const PAPER = { hex: '#fdfcfa', rgb: [253, 252, 250] as const };

/** Cursive stack for the signature line — falls back gracefully on Windows/macOS/Linux. */
const SIGNATURE_FONT = '"Segoe Script", "Brush Script MT", "Snell Roundhand", cursive';

/** "1 September 2026" — unambiguous across locales, unlike 01/09/2026. */
function formatIssueDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function authenticationId(credential: CredentialDto): string {
  return `DH-${credential.id.slice(0, 8).toUpperCase()}-${credential.hash.slice(0, 8).toUpperCase()}`;
}

type LoadedLogo = { dataUrl: string; width: number; height: number };

/**
 * jsPDF embeds PNG pixel data uncompressed, so the full-size logo would add megabytes to
 * every certificate. Downscale to 700px first — at a 70mm print width that is still
 * ~250 DPI, comfortably above print requirements for a wordmark.
 */
const LOGO_PDF_WIDTH_PX = 700;

/** Pixels at least this bright on every channel count as the wordmark's backdrop. */
const BACKDROP_THRESHOLD = 232;

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

      resolve({ dataUrl: canvas.toDataURL('image/png'), width, height });
    };
    img.onerror = () => reject(new Error('logo failed to load'));
    img.src = LOGO_SRC;
  });
}

export function CertificateModal({ credential, onClose }: { credential: CredentialDto; onClose: () => void }) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [logo, setLogo] = useState<LoadedLogo | null>(null);

  useEffect(() => {
    QRCode.toDataURL(credential.verifyUrl, { margin: 1, width: 240 }).then(setQrDataUrl);
  }, [credential.verifyUrl]);

  useEffect(() => {
    // A missing logo must not block issuing the certificate — the PDF just omits it.
    loadLogo()
      .then(setLogo)
      .catch(() => setLogo(null));
  }, []);

  const issuedOn = formatIssueDate(credential.issuedAt);
  const authId = authenticationId(credential);
  const signatoryName = credential.adminSignatureName ?? credential.evaluatorSignatureName;
  const signatoryRole = credential.adminSignatureName ? 'Director, Dojo Hub (SMC)' : 'Lead Evaluator';

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const w = doc.internal.pageSize.getWidth();
    const h = doc.internal.pageSize.getHeight();
    const mid = w / 2;

    // Cream field + double rule: prints cleanly and costs far less ink than a dark fill.
    doc.setFillColor(PAPER.rgb[0], PAPER.rgb[1], PAPER.rgb[2]);
    doc.rect(0, 0, w, h, 'F');
    doc.setDrawColor(30, 37, 51);
    doc.setLineWidth(1.4);
    doc.rect(9, 9, w - 18, h - 18);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.4);
    doc.rect(12.5, 12.5, w - 25, h - 25);

    // The wordmark carries the Dojo Hub name, so no separate text heading is drawn.
    if (logo) {
      const logoW = 72;
      const logoH = (logo.height / logo.width) * logoW;
      doc.addImage(logo.dataUrl, 'PNG', mid - logoW / 2, 20, logoW, logoH);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 128, 144);
    doc.text('OFFICIAL VERIFIABLE CREDENTIAL', mid, 52, { align: 'center' });

    doc.setFont('times', 'bold');
    doc.setFontSize(30);
    doc.setTextColor(30, 37, 51);
    doc.text('CERTIFICATE OF COMPLETION', mid, 70, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 128, 144);
    doc.text('HAS BEEN AWARDED TO', mid, 82, { align: 'center' });

    doc.setFont('times', 'bolditalic');
    doc.setFontSize(30);
    doc.setTextColor(220, 38, 38);
    doc.text(credential.studentName, mid, 97, { align: 'center' });

    doc.setDrawColor(210, 214, 222);
    doc.setLineWidth(0.3);
    doc.line(mid - 65, 102, mid + 65, 102);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(140, 148, 162);
    doc.text(credential.studentEmail, mid, 108, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(90, 98, 114);
    doc.text('for successfully completing the requirements of', mid, 120, { align: 'center' });

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
    const roleY = 181.5;

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
    if (signatoryName) {
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
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(30, 37, 51);
      doc.text(signatoryName, w - 60, nameY, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 128, 144);
      doc.text(signatoryRole, w - 60, roleY, { align: 'center' });
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

  return (
    <Modal open onClose={onClose} title="Official Credential" maxWidth="max-w-3xl">
      <div
        id="print-certificate-canvas"
        className="relative bg-[#fdfcfa] border-2 border-navy-950 rounded-lg overflow-hidden"
      >
        <div className="absolute inset-[6px] border border-crimson-600/40 rounded pointer-events-none" />

        <div className="relative px-8 py-7 text-center">
          {/* Wordmark includes the Dojo Hub name, so no text heading follows it.
              eslint-disable-next-line @next/next/no-img-element -- static asset, no optimisation needed in print view */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo?.dataUrl ?? LOGO_SRC} alt="Dojo Hub" className="h-16 w-auto mx-auto" />

          <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-navy-400">Official Verifiable Credential</p>

          <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            CERTIFICATE OF COMPLETION
          </h2>

          <p className="mt-4 text-[12px] uppercase tracking-[0.2em] text-navy-400">Has been awarded to</p>
          <p className="mt-2 text-3xl font-bold italic text-crimson-600">{credential.studentName}</p>
          <div className="mx-auto mt-2 h-px w-2/3 bg-navy-200" />
          <p className="mt-2 text-xs text-navy-400">{credential.studentEmail}</p>

          <p className="mt-5 text-xs text-navy-500">for successfully completing the requirements of</p>
          <p className="mt-1 text-xl font-extrabold text-navy-950">{subjectLine(credential)}</p>

          <div className="mt-7 grid grid-cols-3 items-end gap-4">
            <div>
              <p className="text-sm text-navy-900">{issuedOn}</p>
              <div className="mt-1 h-px bg-navy-950" />
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-navy-500">Date of Issuance</p>
            </div>

            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image doesn't optimize these */}
              {qrDataUrl && <img src={qrDataUrl} alt="Verification QR code" className="w-24 h-24" />}
            </div>

            <div>
              {signatoryName && (
                <p className="text-lg text-navy-900 leading-tight" style={{ fontFamily: SIGNATURE_FONT }}>
                  {signatoryName}
                </p>
              )}
              <div className="mt-1 h-px bg-navy-950" />
              <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-navy-500">Awarded by</p>
              {signatoryName && (
                <>
                  <p className="mt-0.5 text-xs font-bold text-navy-950 leading-tight">{signatoryName}</p>
                  <p className="text-[11px] text-navy-500 leading-tight">{signatoryRole}</p>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 border-t border-navy-100 pt-3 text-left">
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
    </Modal>
  );
}
