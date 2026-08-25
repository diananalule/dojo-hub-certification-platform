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
export function PublicNav() {
  const { user, isLoading } = useAuth();

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

          {/* The signed-out buttons are the default rather than a loading blank: almost
              everyone landing here is signed out, they must be in the server-rendered
              HTML for crawlers, and an empty top-right corner that pops two buttons in
              after hydration looks broken. Signed-in users swap to their dashboard. */}
          {!isLoading && user ? (
            <Link href={ROLE_HOME[user.role] ?? '/home'}>
              <Button size="sm">Go to my dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button size="sm" variant="outline">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Create Account</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
