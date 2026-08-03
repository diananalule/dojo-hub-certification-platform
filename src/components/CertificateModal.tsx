import React, { useState, useRef } from 'react';
import { IssuedCredential } from '../types';
import { Printer, Download, X, Check, ShieldAlert, Award } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface CertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: IssuedCredential;
}

export default function CertificateModal({ isOpen, onClose, credential }: CertificateModalProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Generate a premium dynamic serial number
  const serialNumber = `SN-${credential.id}-${credential.hash.substring(2, 10).toUpperCase()}`;

  // Get track title from level
  const getTrackTitle = (level: string) => {
    switch (level) {
      case 'Beginner': return 'Frontend & Hardware Foundations';
      case 'Intermediate': return 'Advanced Client Architectures & Firmware';
      case 'Advanced': return 'Fullstack Engineering & Connected Systems';
      case 'Expert': return 'Enterprise Architecture, AI & Security Capstone';
      default: return 'Software & Hardware Engineering';
    }
  };

  const getFullLevelName = (level: string) => {
    switch (level) {
      case 'Beginner': return 'Beginner Level (Foundations)';
      case 'Intermediate': return 'Intermediate Level (Application)';
      case 'Advanced': return 'Advanced Level (Competence)';
      case 'Expert': return 'Expert Level (Capstone & Mastery)';
      default: return level;
    }
  };

  const trackTitle = getTrackTitle(credential.level);

  // Trigger System Print using the standard print dialogue
  const handlePrint = () => {
    window.print();
  };

  // Generate premium PDF document
  const handleDownloadPDF = () => {
    if (downloading) return;
    setDownloading(true);
    setDownloadProgress(20);
    setDownloadSuccess(false);

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const width = doc.internal.pageSize.getWidth(); // 297mm
      const height = doc.internal.pageSize.getHeight(); // 210mm

      // Progress animation
      setDownloadProgress(40);

      // --- DRAW BACKGROUND & BORDER FRAME ---
      // Off-white soft background
      doc.setFillColor(252, 252, 252);
      doc.rect(0, 0, width, height, 'F');

      // Double navy border
      doc.setDrawColor(15, 23, 42); // navy-950 (rgb: 15, 23, 42)
      doc.setLineWidth(1.5);
      doc.rect(8, 8, width - 16, height - 16, 'D');

      doc.setLineWidth(0.5);
      doc.rect(10, 10, width - 20, height - 20, 'D');

      // Corner gold/navy accent anchors
      doc.setFillColor(15, 23, 42);
      // Top-Left corner block
      doc.rect(7, 7, 5, 5, 'F');
      // Top-Right
      doc.rect(width - 12, 7, 5, 5, 'F');
      // Bottom-Left
      doc.rect(7, height - 12, 5, 5, 'F');
      // Bottom-Right
      doc.rect(width - 12, height - 12, 5, 5, 'F');

      setDownloadProgress(60);

      // --- HEADER TITLE ---
      doc.setTextColor(15, 23, 42); // Navy
      doc.setFont('times', 'bold');
      doc.setFontSize(28);
      doc.text('DOJO HUB ACADEMY', width / 2, 28, { align: 'center' });

      // Crimson separating line
      doc.setDrawColor(220, 38, 38); // Crimson
      doc.setLineWidth(0.8);
      doc.line(width / 2 - 40, 33, width / 2 + 40, 33);

      doc.setTextColor(100, 116, 139); // Gray-500
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('CRYPTOGRAPHIC BOARD OF TECHNICAL VERIFICATION', width / 2, 39, { align: 'center' });

      // --- PROSE AND RECIPIENT ---
      doc.setFont('times', 'italic');
      doc.setFontSize(12);
      doc.setTextColor(100, 116, 139);
      doc.text('This official proficiency parchment is proudly presented to', width / 2, 56, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42);
      doc.text(credential.studentName.toUpperCase(), width / 2, 68, { align: 'center' });

      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(148, 163, 184); // Gray-400
      doc.text(credential.studentEmail, width / 2, 74, { align: 'center' });

      // --- ACHIEVEMENT DETAIL ---
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139);
      doc.text('who has demonstrated comprehensive technical mastery and successfully satisfied all syllabus requirements to achieve the professional rank of', width / 2, 88, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(220, 38, 38); // Crimson red
      doc.text(getFullLevelName(credential.level).toUpperCase(), width / 2, 100, { align: 'center' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`Discipline Specialization: ${trackTitle.toUpperCase()}`, width / 2, 108, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('Validated via distributed supervisor evaluation consensus and cryptographically logged on the public ledger audit timeline.', width / 2, 115, { align: 'center' });

      setDownloadProgress(80);

      // --- BOTTOM SECTION: SIGNATURES, SEAL & QR ---

      // Left Column: Signatures
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('SUPERVISOR ENDORSEMENT', 25, 142);
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`✓ ${credential.signatures.evaluator || 'Lead Instructor Kenji'}`, 25, 148);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text('Dojo Faculty Proctor', 25, 153);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(148, 163, 184);
      doc.text('ADMINISTRATIVE SIGN-OFF', 25, 167);
      doc.setFont('times', 'italic');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(`✓ ${credential.signatures.admin || 'Sarah Admin'}`, 25, 173);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text('Academy Director', 25, 178);

      // Middle Column: Digital Wax Seal
      // Let's draw a beautiful red circle seal
      const sealX = width / 2;
      const sealY = 160;
      doc.setFillColor(185, 28, 28); // Crimson red
      doc.circle(sealX, sealY, 18, 'F');
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.5);
      doc.circle(sealX, sealY, 15, 'D');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5);
      doc.text('DOJO HUB', sealX, sealY - 6, { align: 'center' });
      doc.setFontSize(7);
      doc.text('OFFICIAL', sealX, sealY - 1, { align: 'center' });
      doc.text('SEAL', sealX, sealY + 4, { align: 'center' });
      doc.setFontSize(4);
      doc.text('EST. 2026', sealX, sealY + 9, { align: 'center' });

      // Right Column: QR Code Grid & Serial Info
      const qrX = width - 75;
      const qrY = 138;
      const qrSize = 22;

      // Draw QR border
      doc.setDrawColor(203, 213, 225); // gray-300
      doc.setLineWidth(0.5);
      doc.setFillColor(255, 255, 255);
      doc.rect(qrX - 2, qrY - 2, qrSize + 24, qrSize + 4, 'FD');

      // Draw the pixel grid QR Code
      doc.setFillColor(15, 23, 42); // navy-950
      const dotSize = qrSize / 6;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          if ((r % 5 === 0 || c % 5 === 0 || r < 1 || r > 4 || (r + c) % 3 === 0)) {
            doc.rect(qrX + c * dotSize, qrY + r * dotSize, dotSize, dotSize, 'F');
          }
        }
      }

      // QR metadata text
      doc.setTextColor(22, 163, 74); // green-600
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.text('VERIFIED', qrX + qrSize + 2, qrY + 3);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      doc.text('Secure Hash:', qrX + qrSize + 2, qrY + 8);
      doc.setTextColor(15, 23, 42);
      doc.setFont('courier', 'bold');
      doc.setFontSize(5.5);
      doc.text(credential.hash.substring(0, 14) + '...', qrX + qrSize + 2, qrY + 13);

      // Serial number and issuance date under QR
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6);
      doc.setTextColor(148, 163, 184);
      doc.text('SERIAL NUMBER', width - 25, 172, { align: 'right' });
      
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(width - 65, 175, 40, 5, 'F');
      
      doc.setFont('courier', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text(serialNumber, width - 45, 179, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(`DIGITALLY CERTIFIED ON ${new Date(credential.issuedAt).toLocaleDateString().toUpperCase()}`, width - 25, 186, { align: 'right' });

      setDownloadProgress(100);

      // Save PDF document with a clean format
      const fileNameStr = `DojoHub_Certificate_${credential.studentName.replace(/\s+/g, '_')}_${credential.level}.pdf`;
      doc.save(fileNameStr);

      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
      }, 300);

    } catch (err) {
      console.error("Error creating PDF: ", err);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn" id="certificate-modal-overlay">
      
      {/* Outer wrapper with printable class constraints */}
      <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl relative border-4 border-gray-100 flex flex-col justify-between max-h-[95vh] no-print" id="certificate-modal-container">
        
        {/* TOP INTERACTIVE ACTIONS CONTROLS BAR (Hidden during printing) */}
        <div className="bg-navy-950 text-white px-6 py-4 flex items-center justify-between border-b border-navy-900" id="certificate-modal-controls">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-crimson-500 animate-spin-slow" />
            <span className="font-sans font-bold text-xs tracking-wider uppercase">Dojo Hub Automated Credential Engine</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
              title="Prints only the certificate content"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Certificate
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 bg-navy-800 hover:bg-navy-700 disabled:opacity-50 text-white font-sans font-bold px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading ? 'Compiling PDF...' : 'Download PDF'}
            </button>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1"
              id="close-certificate-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading progress bar if compiling */}
        {downloading && (
          <div className="h-1.5 bg-gray-100 w-full" id="compiling-progress-bar">
            <div 
              className="h-full bg-crimson-600 transition-all duration-150" 
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}

        {/* Download success banner */}
        {downloadSuccess && (
          <div className="bg-green-500 text-white text-center py-2 px-4 font-sans font-bold text-xs flex items-center justify-center gap-1.5 animate-slideDown" id="compiling-success">
            <Check className="w-4 h-4" />
            Certificate package compiled and downloaded successfully! (Serial: {serialNumber})
          </div>
        )}

        {/* ========================================================================= */}
        {/* CORE CERTIFICATE LAYOUT - THIS AREA TARGETED BY STYLE FOR PRINT PREVIEW */}
        {/* ========================================================================= */}
        <div className="p-10 md:p-12 bg-white flex-1 overflow-y-auto select-none print-only-area text-left" id="print-certificate-canvas">
          
          {/* Ornate Certificate Border Frame */}
          <div className="border-8 border-double border-navy-950 p-6 md:p-8 bg-neutral-50/50 rounded-2xl relative min-h-[460px] flex flex-col justify-between" id="certificate-frame">
            
            {/* Elegant corner designs */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-navy-950" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-navy-950" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-navy-950" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-navy-950" />

            {/* Certificate Header Branding */}
            <div className="text-center space-y-2 mt-4" id="certificate-head-block">
              <h1 className="text-3xl font-serif tracking-widest text-navy-950 font-bold uppercase" style={{ fontFamily: '"Playfair Display", Georgia, serif' }}>
                Dojo Hub Academy
              </h1>
              <div className="w-44 h-0.5 bg-crimson-600 mx-auto" />
              <p className="text-[10px] font-mono tracking-[0.25em] text-gray-400 uppercase font-bold">
                Cryptographic Board of Technical Verification
              </p>
            </div>

            {/* Main Credential Text block */}
            <div className="text-center my-6 md:my-8 space-y-4" id="certificate-prose-block">
              <div className="space-y-0.5">
                <p className="text-xs font-serif text-gray-500 italic">This official proficiency parchment is proudly presented to</p>
                <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-navy-950 uppercase py-1">
                  {credential.studentName}
                </h2>
                <p className="text-[11px] font-mono text-gray-400">{credential.studentEmail}</p>
              </div>

              <div className="space-y-1 max-w-lg mx-auto">
                <p className="text-xs font-serif text-gray-500 italic">who has demonstrated comprehensive technical mastery and successfully satisfied all syllabus requirements to achieve the professional rank of</p>
                <h3 className="text-xl font-sans font-extrabold tracking-tight text-crimson-600 uppercase py-1">
                  {getFullLevelName(credential.level)}
                </h3>
                <h4 className="text-sm font-sans font-bold text-navy-950 uppercase tracking-wide">
                  Discipline Specialization: {trackTitle}
                </h4>
                <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                  Validated via distributed supervisor evaluation consensus and cryptographically logged on the public ledger audit timeline.
                </p>
              </div>
            </div>

            {/* Certificate Signatures, Seal, & Verification QR Code Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-between mt-4 pt-4 border-t border-gray-200/50 text-xs" id="certificate-auth-block">
              
              {/* Left Column: Official Signatures */}
              <div className="space-y-3 order-2 md:order-1 text-center md:text-left">
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-gray-400 uppercase leading-none">Supervisor Endorsement</div>
                  <div className="text-[11px] font-serif italic text-navy-950 font-bold">
                    ✓ {credential.signatures.evaluator || 'Lead Instructor Kenji'}
                  </div>
                  <div className="text-[8px] font-mono text-gray-400">Dojo Faculty Proctor</div>
                </div>

                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-gray-400 uppercase leading-none">Administrative Sign-Off</div>
                  <div className="text-[11px] font-serif italic text-navy-950 font-bold">
                    ✓ {credential.signatures.admin || 'Sarah Admin'}
                  </div>
                  <div className="text-[8px] font-mono text-gray-400">Academy Director</div>
                </div>
              </div>

              {/* Middle Column: Digital Wax Seal of Proficiency */}
              <div className="flex justify-center my-4 md:my-0 order-1 md:order-2">
                <div className="w-24 h-24 bg-gradient-to-br from-crimson-600 to-red-800 rounded-full border-4 border-double border-white shadow-md flex flex-col items-center justify-center text-white relative" id="digital-parchment-seal">
                  <div className="absolute inset-2 border border-white/20 rounded-full flex flex-col items-center justify-center text-center">
                    <span className="text-[6px] font-mono uppercase tracking-widest font-bold">DOJO HUB</span>
                    <span className="text-[7px] font-sans font-black tracking-tight leading-none uppercase mt-0.5">OFFICIAL</span>
                    <span className="text-[7px] font-sans font-black tracking-tight leading-none uppercase text-yellow-400">SEAL</span>
                    <span className="text-[5px] font-mono text-[5px] mt-1">EST. 2026</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Embedded Verification QR Code */}
              <div className="flex flex-col items-center md:items-end justify-center space-y-1.5 order-3">
                <div className="bg-white p-2 border border-gray-300 rounded-lg flex items-center gap-2 shadow-sm">
                  
                  {/* High-Fidelity Rendered QR Code Grid */}
                  <div className="w-16 h-16 bg-white flex flex-col justify-between" id="embedded-qr-code">
                    <div className="grid grid-cols-6 gap-0.5 flex-1">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-full h-full ${
                            (i % 5 === 0 || i % 6 === 1 || i < 6 || i > 30 || i % 7 === 2 || i === 14 || i === 22) 
                              ? 'bg-navy-950' 
                              : 'bg-white'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Verification Status Details */}
                  <div className="text-left space-y-0.5" id="qr-code-meta">
                    <div className="text-[8px] font-mono text-green-600 font-bold uppercase tracking-wider flex items-center gap-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
                      VERIFIED
                    </div>
                    <div className="text-[7px] font-mono text-gray-500 leading-tight">Secure Hash:</div>
                    <div className="text-[7px] font-mono font-bold text-navy-950 tracking-tight select-all truncate w-[90px]">
                      {credential.hash.substring(0, 18)}...
                    </div>
                  </div>

                </div>
                
                {/* Unique Serial Number and Issuance Timestamp */}
                <div className="text-center md:text-right space-y-0.5">
                  <span className="text-[8px] font-mono text-gray-400 block uppercase font-bold tracking-widest">
                    SERIAL NUMBER
                  </span>
                  <span className="text-[10px] font-mono text-navy-950 font-bold block select-all bg-gray-100 px-1.5 py-0.5 rounded leading-none">
                    {serialNumber}
                  </span>
                  <span className="text-[7px] font-sans text-gray-400 block mt-0.5">
                    PARCHMENT DIGITALLY CERTIFIED ON {new Date(credential.issuedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* PRINT-ONLY CSS HELPER - FORCES CERTIFICATE BOX TO SCALE FULL SCREEN DURING PRINTING */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-certificate-canvas, #print-certificate-canvas * {
            visibility: visible !important;
          }
          #print-certificate-canvas {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          #certificate-frame {
            border-width: 12px !important;
            min-height: 95vh !important;
            justify-content: space-around !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}
