import { CurriculumTrackEditor } from '@/components/admin/CurriculumTrackEditor';

export default async function CurriculumTrackPage({ params }: { params: Promise<{ trackId: string }> }) {
  const { trackId } = await params;
  return <CurriculumTrackEditor trackId={trackId} />;
}
