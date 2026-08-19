import Link from 'next/link';
import DojoHubLogo from '@/components/DojoHubLogo';

/**
 * Dashboard footer. Every link points at a route that actually exists — no
 * placeholder About/Terms pages that would 404.
 */
const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Learning',
    links: [
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
    <footer className="mt-12 border-t border-black/[0.06] pt-8 pb-4">
      <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5">
            <DojoHubLogo size={28} />
            <span className="font-extrabold tracking-tight text-navy-950">
              DOJO <span className="text-crimson-600">HUB</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-navy-500 leading-relaxed">
            Structured certification tracks with evaluator-reviewed capstones and verifiable credentials.
          </p>
        </div>

        <div className="flex gap-12 sm:gap-16">
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 mb-2.5">{col.heading}</p>
              <ul className="space-y-1.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-xs text-navy-600 hover:text-crimson-600 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 pt-4 border-t border-black/[0.04] text-[12px] text-navy-400">
        © {new Date().getFullYear()} Dojo Hub (SMC). Every certificate carries a QR code that anyone can verify.
      </p>
    </footer>
  );
}
