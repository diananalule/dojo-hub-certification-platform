'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { CredentialDto } from '@dojo-hub/shared';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

const AWARDING_BODY = 'DOJO HUB (SMC)';
const LOGO_SRC = '/dojohub-logo.png';

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
 * jsPDF embeds PNG pixel data uncompressed, so the full-size logo would add ~2.5MB to
 * every certificate. Downscale to 300px first — at a 20mm print width that is still
 * ~380 DPI, far beyond what print needs.
 */
const LOGO_PDF_WIDTH_PX = 300;

/** jsPDF needs raw bytes + intrinsic size, so load the logo once and keep its aspect ratio. */
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
      // The logo is transparent; flatten onto the certificate's cream field so the
      // PDF doesn't show a black box where alpha would be.
      ctx.fillStyle = '#fdfcfa';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

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
    doc.setFillColor(253, 252, 250);
    doc.rect(0, 0, w, h, 'F');
    doc.setDrawColor(30, 37, 51);
    doc.setLineWidth(1.4);
    doc.rect(9, 9, w - 18, h - 18);
    doc.setDrawColor(220, 38, 38);
    doc.setLineWidth(0.4);
    doc.rect(12.5, 12.5, w - 25, h - 25);

    if (logo) {
      const logoW = 20;
      const logoH = (logo.height / logo.width) * logoW;
      doc.addImage(logo.dataUrl, 'PNG', mid - logoW / 2, 19, logoW, logoH);
    }

    doc.setTextColor(30, 37, 51);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(AWARDING_BODY, mid, 48, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(120, 128, 144);
    doc.text('OFFICIAL VERIFIABLE CREDENTIAL', mid, 53.5, { align: 'center' });

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
    doc.text(`${credential.level.name} Level`, mid, 132, { align: 'center' });

    // --- Footer row: date (left) · QR (centre) · signature (right) ---
    const ruleY = 172;
    const labelY = 178;

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
      const qr = 30;
      doc.addImage(qrDataUrl, 'PNG', mid - qr / 2, 143, qr, qr);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(220, 38, 38);
      doc.text('SCAN TO VERIFY', mid, labelY, { align: 'center' });
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
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(140, 148, 162);
      doc.text(signatoryRole, w - 60, labelY + 4, { align: 'center' });
    }

    // --- Provenance strip ---
    doc.setDrawColor(228, 231, 237);
    doc.setLineWidth(0.3);
    doc.line(20, h - 28, w - 20, h - 28);

    doc.setFont('courier', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 128, 144);
    doc.text(`AUTHENTICATION ID: ${authId}`, 20, h - 23);
    doc.text(`VERIFY: ${credential.verifyUrl}`, w - 20, h - 23, { align: 'right' });

    if (credential.evaluatorSignatureName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(`Assessed by ${credential.evaluatorSignatureName}`, 20, h - 18);
    }
    doc.setFont('courier', 'normal');
    doc.setFontSize(5.5);
    doc.setTextColor(170, 176, 188);
    doc.text(credential.hash, w - 20, h - 18, { align: 'right' });

    doc.save(`DojoHub_Certificate_${credential.studentName.replace(/\s+/g, '_')}_${credential.level.name}.pdf`);
  };

  return (
    <Modal open onClose={onClose} title="Official Credential" maxWidth="max-w-3xl">
      <div
        id="print-certificate-canvas"
        className="relative bg-[#fdfcfa] border-2 border-navy-950 rounded-lg overflow-hidden"
      >
        <div className="absolute inset-[6px] border border-crimson-600/40 rounded pointer-events-none" />

        <div className="relative px-8 py-7 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset, no optimisation needed in print view */}
          <img src={LOGO_SRC} alt="Dojo Hub logo" className="h-14 w-auto mx-auto" />

          <p className="mt-3 text-base font-extrabold tracking-tight text-navy-950">{AWARDING_BODY}</p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-navy-400">Official Verifiable Credential</p>

          <h2 className="mt-5 text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-950">
            CERTIFICATE OF COMPLETION
          </h2>

          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-navy-400">Has been awarded to</p>
          <p className="mt-2 text-3xl font-bold italic text-crimson-600">{credential.studentName}</p>
          <div className="mx-auto mt-2 h-px w-2/3 bg-navy-200" />
          <p className="mt-2 text-xs text-navy-400">{credential.studentEmail}</p>

          <p className="mt-5 text-xs text-navy-500">for successfully completing the requirements of</p>
          <p className="mt-1 text-xl font-extrabold text-navy-950">{credential.level.name} Level</p>

          <div className="mt-7 grid grid-cols-3 items-end gap-4">
            <div>
              <p className="text-sm text-navy-900">{issuedOn}</p>
              <div className="mt-1 h-px bg-navy-950" />
              <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-navy-500">Date of Issuance</p>
            </div>

            <div className="flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, next/image doesn't optimize these */}
              {qrDataUrl && <img src={qrDataUrl} alt="Verification QR code" className="w-24 h-24" />}
              <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-crimson-600">Scan to verify</p>
            </div>

            <div>
              {signatoryName && (
                <p className="text-lg text-navy-900 leading-tight" style={{ fontFamily: SIGNATURE_FONT }}>
                  {signatoryName}
                </p>
              )}
              <div className="mt-1 h-px bg-navy-950" />
              <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-navy-500">Awarded by</p>
              {signatoryName && <p className="text-[8px] text-navy-400">{signatoryRole}</p>}
            </div>
          </div>

          <div className="mt-6 border-t border-navy-100 pt-3 text-left">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p className="text-[9px] font-mono text-navy-500">
                <span className="text-navy-400">Authentication ID: </span>
                {authId}
              </p>
              {credential.evaluatorSignatureName && (
                <p className="text-[9px] text-navy-400">Assessed by {credential.evaluatorSignatureName}</p>
              )}
            </div>
            <p className="mt-1 text-[8px] font-mono text-navy-300 break-all">{credential.hash}</p>
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
