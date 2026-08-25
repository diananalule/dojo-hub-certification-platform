import { cookies } from 'next/headers';
import { LandingPage } from '@/components/landing/LandingPage';

/**
 * Public marketing home.
 *
 * Deliberately does NOT bounce signed-in users to their dashboard. Staff need to be
 * able to review this page without signing out, and an auto-redirect also made the
 * "Go to my dashboard" button in PublicNav unreachable — nobody stayed on the page
 * long enough to click it. Signing in still lands people directly on their role home,
 * so removing the redirect strands no one.
 *
 * The session cookie is read here purely so the nav can render the right buttons on
 * the first paint. Without it the nav has to assume signed-out until /auth/me answers,
 * which made a returning user watch Sign In / Create Account flash and then swap. This
 * is a rendering hint only — never an authorisation check. The cookie is httpOnly and
 * signed, we only look at whether one is present, and every guarded route still
 * verifies the session against the API.
 */
export default async function RootPage() {
  const hasSession = (await cookies()).has('access_token');
  return <LandingPage initiallySignedIn={hasSession} />;
}
