'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, ChevronLeft, Clock, Layers, Lock, PlayCircle } from 'lucide-react';
import { TrackDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { formatDuration } from '@/lib/video';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { TrackCover } from '@/components/student/TrackCover';
import { PublicNav } from './PublicNav';

/**
 * Public, unauthenticated course page. Shows the full syllabus so a visitor can judge
 * the course before committing — but every lesson is locked, and starting one requires
 * an account. Reading is open; doing is not.
 */
export function CoursePreview({ trackId }: { trackId: string }) {
  const { user } = useAuth();
  const { data: track, isLoading, isError } = useQuery<TrackDto>({
    queryKey: ['track', 'public', trackId],
    queryFn: () => api.get<TrackDto>(`/tracks/${trackId}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-4">
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !track) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-2xl font-extrabold text-navy-950">Course not found</h1>
          <p className="text-navy-500 mt-2">This course may have been unpublished.</p>
          <Link href="/#courses" className="inline-block mt-6">
            <Button variant="outline">Browse all courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const lessonCount = track.modules.reduce((sum, m) => sum + m.topics.length, 0);
  const totalSeconds = track.modules.reduce(
    (sum, m) => sum + m.topics.reduce((s, t) => s + t.durationSeconds, 0),
    0,
  );

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Link
          href="/#courses"
          className="inline-flex items-center gap-1 text-xs font-semibold text-navy-500 hover:text-navy-950"
        >
          <ChevronLeft className="w-4 h-4" /> All courses
        </Link>

        <div className="mt-6 grid lg:grid-cols-[1fr_20rem] gap-8 items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="red">{track.category.name}</Badge>
              <Badge tone="gray">{track.difficulty}</Badge>
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950 text-balance">
              {track.title}
            </h1>
            <p className="mt-3 text-navy-600 leading-relaxed max-w-2xl">{track.description}</p>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-500">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-crimson-600" />
                {track.modules.length} module{track.modules.length === 1 ? '' : 's'}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-crimson-600" />
                {lessonCount} lesson{lessonCount === 1 ? '' : 's'}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-crimson-600" />
                {track.durationWeeks} weeks
              </span>
            </div>

            {/* ------------------------------------------------- syllabus */}
            <h2 className="mt-10 text-xl font-extrabold tracking-tight text-navy-950">
              What you will cover
            </h2>

            <div className="mt-4 space-y-3">
              {track.modules.map((mod, i) => (
                <div key={mod.id} className="border border-black/[0.07] rounded-2xl overflow-hidden">
                  <div className="bg-navy-50/70 px-4 py-3 flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-navy-950 text-white text-[12px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-navy-950">{mod.title}</p>
                      <p className="text-[12px] text-navy-500">
                        {mod.topics.length > 0
                          ? `${mod.topics.length} lesson${mod.topics.length === 1 ? '' : 's'}`
                          : 'Project brief — submit work directly'}
                      </p>
                    </div>
                  </div>

                  {mod.topics.length > 0 && (
                    <ul className="divide-y divide-black/[0.05]">
                      {mod.topics.map((topic) => (
                        <li key={topic.id} className="px-4 py-2.5 flex items-center gap-3">
                          <Lock className="w-3.5 h-3.5 text-navy-300 shrink-0" />
                          <span className="text-sm text-navy-700 flex-1 min-w-0 truncate">
                            {topic.title}
                          </span>
                          <span className="text-[12px] font-mono text-navy-400 shrink-0">
                            {formatDuration(topic.durationSeconds)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ---------------------------------------------------- enrol card */}
          <aside className="lg:sticky lg:top-24 border border-black/[0.07] rounded-2xl overflow-hidden shadow-[0_1px_2px_rgba(5,7,12,0.04)]">
            <div className="aspect-[16/9] bg-navy-100">
              {track.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded URL
                <img
                  src={track.coverImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <TrackCover category={track.category.name} icon={track.icon} className="h-full" />
              )}
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-2xl font-extrabold text-navy-950">Free</p>
                <p className="text-xs text-navy-500">
                  {totalSeconds > 0 ? `${Math.round(totalSeconds / 60)} minutes of lessons` : 'Project-based course'}
                </p>
              </div>

              {user ? (
                <Link href={`/learning/${track.id}`} className="block">
                  <Button className="w-full">
                    <PlayCircle className="w-4 h-4" /> Go to this course
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="block">
                    <Button className="w-full">Sign up to enrol</Button>
                  </Link>
                  <p className="text-xs text-navy-500 text-center">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-crimson-600 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </>
              )}

              <ul className="pt-2 border-t border-black/[0.06] space-y-2 text-xs text-navy-600">
                <li className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 mt-0.5 text-crimson-600 shrink-0" />
                  Full access to every lesson once enrolled
                </li>
                <li className="flex items-start gap-2">
                  <Layers className="w-3.5 h-3.5 mt-0.5 text-crimson-600 shrink-0" />
                  Work reviewed by a supervisor, not auto-marked
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 mt-0.5 text-crimson-600 shrink-0" />
                  Learn at your own pace — no deadlines
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
