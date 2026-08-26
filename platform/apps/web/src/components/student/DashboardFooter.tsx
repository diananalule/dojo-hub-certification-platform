import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import DojoHubLogo from '@/components/DojoHubLogo';

/**
 * Dashboard footer. Sits on a grey panel rather than the page's white background —
 * on white it blended into the content above it and read as stray links rather than
 * as the end of the page. Every link points at a route that actually exists, so there
 * are no placeholder About/Terms pages waiting to 404.
 */
const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Learning',
    links: [
      // '/home' is the signed-in dashboard; '/' is the public site. Naming them apart
      // matters — without this link the landing page was only reachable by URL editing.
      { label: 'Public home page', href: '/' },
      { label: 'Browse Courses', href: '/home' },
      { label: 'My Learning', href: '/learning' },
      { label: 'My Certificates', href: '/certificates' },
    ],
  },
  {
    heading: 'Account',
    links: [{ label: 'Profile & Settings', href: '/account-settings' }],
  },
];

export function DashboardFooter() {
  return (
    <footer className="mt-12 rounded-2xl border border-black/[0.07] bg-navy-50 overflow-hidden">
      <div className="p-6 sm:p-8 grid gap-8 sm:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,1fr))]">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5 group" title="Go to the public home page">
            <span className="bg-white rounded-lg p-1.5 border border-black/[0.05] shrink-0">
              <DojoHubLogo size={26} />
            </span>
            <span className="min-w-0">
              <span className="block font-extrabold tracking-tight text-navy-950 leading-none">
                DOJO <span className="text-crimson-600">HUB</span>
              </span>
              <span className="block text-[11px] font-mono uppercase tracking-[0.14em] text-navy-400 leading-none mt-1">
                Learning Platform
              </span>
            </span>
          </Link>
          <p className="mt-3.5 text-xs text-navy-500 leading-relaxed">
            Structured certification tracks with supervisor-reviewed capstones and verifiable
            credentials.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-[11px] font-mono uppercase tracking-[0.14em] font-bold text-navy-500 mb-3">
              {col.heading}
            </p>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-navy-600 hover:text-crimson-600 transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-black/[0.06] bg-navy-100/50 px-6 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-[12px] text-navy-500">
          © {new Date().getFullYear()} Dojo Hub (SMC). All rights reserved.
        </p>
        <p className="flex items-center gap-1.5 text-[12px] text-navy-500">
          <ShieldCheck className="w-3.5 h-3.5 text-crimson-600 shrink-0" />
          Every certificate carries a QR code that anyone can verify.
        </p>
      </div>
    </footer>
  );
}
