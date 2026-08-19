import { CategoryCourses } from '@/components/student/CategoryCourses';

// `params` is a Promise in this Next.js version — see the sibling [trackId] route.
export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  return <CategoryCourses categoryId={categoryId} />;
}
