import { LandingPage } from '@/components/landing/LandingPage';

/**
 * Public marketing home.
 *
 * Deliberately does NOT bounce signed-in users to their dashboard. Staff need to be
 * able to review this page without signing out, and an auto-redirect also made the
 * "Go to my dashboard" button in PublicNav unreachable — nobody stayed on the page
 * long enough to click it. Signing in still lands people directly on their role home,
 * so removing the redirect strands no one.
 */
export default function RootPage() {
  return <LandingPage />;
}
