/**
 * Shared HTML shell for every outgoing email. Deliberately table-free and
 * inline-styled: Gmail, Outlook and Apple Mail strip <style> blocks, so anything
 * not inlined is simply lost.
 */
const INK = '#05070c';
const MUTED = '#41506e';
const FAINT = '#64748f';
const ACCENT = '#d20f28';
const LINE = '#e7ebf1';

export interface EmailBlock {
  heading: string;
  intro: string;
  /** Optional bullet-style detail lines rendered as a bordered panel. */
  facts?: { label: string; value: string }[];
  ctaLabel?: string;
  ctaUrl?: string;
  outro?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderEmail(block: EmailBlock): string {
  const facts = block.facts?.length
    ? `<div style="border:1px solid ${LINE};border-radius:10px;padding:16px 18px;margin:0 0 24px;">
         ${block.facts
           .map(
             (f) => `<p style="margin:0 0 8px;font-size:14px;color:${MUTED};">
               <strong style="color:${INK};">${escapeHtml(f.label)}:</strong> ${escapeHtml(f.value)}
             </p>`,
           )
           .join('')}
       </div>`
    : '';

  const cta =
    block.ctaLabel && block.ctaUrl
      ? `<p style="margin:0 0 26px;">
           <a href="${block.ctaUrl}" style="display:inline-block;background:${ACCENT};color:#ffffff;
              text-decoration:none;font-weight:700;font-size:15px;padding:13px 26px;border-radius:10px;">
             ${escapeHtml(block.ctaLabel)}
           </a>
         </p>
         <p style="margin:0 0 26px;font-size:12px;color:${FAINT};word-break:break-all;">
           If the button doesn't work, paste this into your browser:<br>${block.ctaUrl}
         </p>`
      : '';

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f6f9;">
  <div style="max-width:560px;margin:0 auto;padding:32px 20px;
              font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="background:#ffffff;border:1px solid ${LINE};border-radius:16px;padding:32px 30px;">

      <p style="margin:0 0 26px;font-size:18px;font-weight:800;letter-spacing:-0.02em;color:${INK};">
        DOJO <span style="color:${ACCENT};">HUB</span>
      </p>

      <h1 style="margin:0 0 14px;font-size:22px;line-height:1.3;font-weight:800;
                 letter-spacing:-0.02em;color:${INK};">${escapeHtml(block.heading)}</h1>

      <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:${MUTED};">${escapeHtml(block.intro)}</p>

      ${facts}
      ${cta}
      ${block.outro ? `<p style="margin:0;font-size:14px;line-height:1.6;color:${MUTED};">${escapeHtml(block.outro)}</p>` : ''}
    </div>

    <p style="margin:20px 4px 0;font-size:12px;line-height:1.6;color:${FAINT};">
      Dojo Hub (SMC) · Certification Platform<br>
      You're receiving this because you have a Dojo Hub account.
    </p>
  </div>
</body></html>`;
}

/** Plain-text fallback, for clients that refuse HTML and for spam scoring. */
export function renderText(block: EmailBlock): string {
  const lines = [block.heading, '', block.intro];
  if (block.facts?.length) {
    lines.push('');
    block.facts.forEach((f) => lines.push(`${f.label}: ${f.value}`));
  }
  if (block.ctaUrl) lines.push('', `${block.ctaLabel ?? 'Open'}: ${block.ctaUrl}`);
  if (block.outro) lines.push('', block.outro);
  lines.push('', 'Dojo Hub (SMC) · Certification Platform');
  return lines.join('\n');
}
