import { CoursePreview } from '@/components/landing/CoursePreview';

// `params` is a Promise in this Next.js version.
export default async function PublicCoursePage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  return <CoursePreview trackId={trackId} />;
}
