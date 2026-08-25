import { cookies } from 'next/headers';
import { CoursePreview } from '@/components/landing/CoursePreview';

// `params` is a Promise in this Next.js version.
export default async function PublicCoursePage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  // Rendering hint for the nav only — see the note in app/page.tsx.
  const hasSession = (await cookies()).has('access_token');
  return <CoursePreview trackId={trackId} initiallySignedIn={hasSession} />;
}
