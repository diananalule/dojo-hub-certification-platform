import { cookies } from 'next/headers';
import { CategoryDto, TrackSummaryDto } from '@dojo-hub/shared';
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
 * the first paint. This is a rendering hint only, never an authorisation check: the
 * cookie is httpOnly and signed, only its presence is read, and every guarded route
 * still verifies the session against the API.
 */

const API = process.env.API_PROXY_TARGET ?? 'http://localhost:4000';

/**
 * The catalogue is fetched here rather than left to the browser. Both services run on
 * Render's free tier, which hibernates them when idle; the first request after that
 * gets a 429 straight from Render's edge, and a failed client fetch left the page
 * claiming there were no published courses. Server-side this is a same-network call
 * that also warms the API, and a failure returns null so the page can say so honestly
 * instead of rendering an empty catalogue.
 */
async function fetchCatalogue<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API}/api${path}`, {
      // Public data, and a stale minute is far better than a cold-start failure.
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? body) as T;
  } catch {
    return null;
  }
}

export default async function RootPage() {
  const [cookieStore, tracks, categories] = await Promise.all([
    cookies(),
    fetchCatalogue<TrackSummaryDto[]>('/tracks'),
    fetchCatalogue<CategoryDto[]>('/categories'),
  ]);

  return (
    <LandingPage
      initiallySignedIn={cookieStore.has('access_token')}
      initialTracks={tracks}
      initialCategories={categories}
    />
  );
}
