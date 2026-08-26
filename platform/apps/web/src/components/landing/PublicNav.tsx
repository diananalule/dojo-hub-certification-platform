'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import DojoHubLogo from '@/components/DojoHubLogo';

const ROLE_HOME: Record<string, string> = { STUDENT: '/home', EVALUATOR: '/queue', ADMIN: '/metrics' };

/**
 * Public header. Signed-out visitors get Sign In / Create Account; anyone already
 * signed in is offered their dashboard instead, so the page never asks them to log
 * in again.
 */
export function PublicNav({ initiallySignedIn = false }: { initiallySignedIn?: boolean }) {
  const { user, isLoading } = useAuth();

  // While /auth/me is in flight we trust the server's cookie check instead of assuming
  // signed-out. Assuming signed-out put the correct buttons in the HTML for visitors but
  // made returning users watch Sign In / Create Account render and then vanish once the
  // request landed — on a cold API that flash lasts long enough to look broken.
  const signedIn = isLoading ? initiallySignedIn : !!user;

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 min-w-0">
          <DojoHubLogo size={34} />
          <span className="min-w-0">
            <span className="block font-extrabold tracking-tight text-navy-950 leading-none truncate">
              DOJO <span className="text-crimson-600">HUB</span>
            </span>
            <span className="block text-[11px] font-mono uppercase tracking-[0.14em] text-navy-400 leading-none mt-0.5">
              Learning Platform
            </span>
          </span>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href="/#courses" className="hidden sm:block text-sm font-semibold text-navy-600 hover:text-crimson-600 transition-colors">
            Courses
          </Link>
          <Link href="/#how-it-works" className="hidden md:block text-sm font-semibold text-navy-600 hover:text-crimson-600 transition-colors">
            How it works
          </Link>

          {/* Sign In and Create Account stay visible for everyone, signed in or not, so the
              way into an account is always on screen where a visitor expects it. A signed-in
              viewer gets their dashboard link in front of them as the primary action. */}
          {signedIn && (
            // The role is unknown until /auth/me resolves, so the href falls back to the
            // student home. RequireRole redirects anyone who lands on the wrong one.
            <Link href={user ? (ROLE_HOME[user.role] ?? '/home') : '/home'}>
              <Button size="sm">Go to my dashboard</Button>
            </Link>
          )}
          <Link href="/login">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" variant={signedIn ? 'outline' : 'primary'}>
              Create Account
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
