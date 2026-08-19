'use client';

import { ReactNode, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from './cn';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidth?: string;
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Stop the page behind scrolling while the dialog is open, so a scroll gesture
  // acts on the dialog rather than sliding the content underneath it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  /*
   * Portalled to <body>. Pages wrap their content in `animate-fadeIn`, which ends on
   * `transform: translateY(0)` with fill-mode forwards — and a transformed ancestor
   * becomes the containing block for `position: fixed` children. Rendered in place,
   * this overlay anchored to that wrapper instead of the viewport, so on a long page
   * the dialog opened far below the fold and had to be scrolled to.
   */
  return createPortal(
    <div className="fixed inset-0 bg-navy-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative bg-white/98 backdrop-blur-xl rounded-3xl w-full border border-black/[0.06] shadow-2xl shadow-black/40 p-6 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto',
          maxWidth,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-crimson-500/40 to-transparent" />
        <div className="flex justify-between items-start gap-4">
          <div>
            <h3 id={titleId} className="text-lg font-extrabold text-navy-950 tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-navy-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-navy-400 hover:text-white hover:bg-navy-950 p-1.5 rounded-lg shrink-0 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
