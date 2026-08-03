import { CoursePlayer } from '@/components/student/CoursePlayer';

export default async function LearningTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  return <CoursePlayer trackId={trackId} />;
}
