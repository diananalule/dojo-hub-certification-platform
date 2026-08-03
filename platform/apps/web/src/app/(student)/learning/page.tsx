'use client';

import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMyEnrollments, useTracks } from '@/lib/hooks';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonRow } from '@/components/ui/Skeleton';
import { TrackCover } from '@/components/student/TrackCover';

export default function MyLearningPage() {
  const { data: enrollments = [], isLoading } = useMyEnrollments();
  const { data: allTracks = [] } = useTracks();
  const queryClient = useQueryClient();

  const enroll = useMutation({
    mutationFn: (trackId: string) => api.post(`/enrollments/tracks/${trackId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] }),
  });

  const inProgress = enrollments.filter((e) => e.status === 'IN_PROGRESS');
  const notStarted = enrollments.filter((e) => e.status === 'NOT_STARTED');
  const completed = enrollments.filter((e) => e.status === 'COMPLETED');
  const enrolledIds = new Set(enrollments.map((e) => e.trackId));
  const discoverable = allTracks.filter((t) => !enrolledIds.has(t.id));

  return (
    <div className="space-y-8 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">My Learning Library</h1>
        <p className="text-sm text-navy-500 mt-1">Manage and track your active study tracks and learning goals.</p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-0">
              <SkeletonRow />
            </Card>
          ))}
        </div>
      )}

      {inProgress.length > 0 && (
        <Section title={`In Progress (${inProgress.length})`}>
          {inProgress.map((e) => (
            <EnrollmentRow key={e.id} enrollment={e} />
          ))}
        </Section>
      )}

      {notStarted.length > 0 && (
        <Section title={`Enrolled — Not Started (${notStarted.length})`}>
          {notStarted.map((e) => (
            <EnrollmentRow key={e.id} enrollment={e} />
          ))}
        </Section>
      )}

      {completed.length > 0 && (
        <Section title={`Completed (${completed.length})`}>
          {completed.map((e) => (
            <EnrollmentRow key={e.id} enrollment={e} />
          ))}
        </Section>
      )}

      {discoverable.length > 0 && (
        <Section title="Discover More Courses">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {discoverable.map((t) => (
              <Card key={t.id} className="p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy-950 truncate">{t.title}</p>
                  <p className="text-xs text-navy-500">{t.category.name} • {t.difficulty}</p>
                </div>
                <Button size="sm" variant="dark" loading={enroll.isPending} onClick={() => enroll.mutate(t.id)}>
                  Enroll
                </Button>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-bold text-navy-950 mb-3 uppercase tracking-wide">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function EnrollmentRow({ enrollment }: { enrollment: ReturnType<typeof useMyEnrollments>['data'] extends (infer U)[] | undefined ? U : never }) {
  const progress = enrollment.totalTopicCount ? Math.round((enrollment.completedTopicCount / enrollment.totalTopicCount) * 100) : 0;
  return (
    <Card className="p-4 flex items-center gap-4">
      <div className="w-24 h-16 rounded-xl overflow-hidden shrink-0">
        <TrackCover category={enrollment.track.category.name} icon={enrollment.track.icon} className="h-16" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-mono uppercase text-crimson-600 font-bold">{enrollment.track.difficulty}</p>
        <h4 className="font-bold text-sm text-navy-950 truncate">{enrollment.track.title}</h4>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-navy-100 rounded-full overflow-hidden max-w-xs">
            <div className="h-full bg-crimson-600" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] text-navy-500 shrink-0">{progress}% Complete</span>
        </div>
      </div>
      <Link href={`/learning/${enrollment.trackId}`}>
        <Button size="sm" variant="dark">
          {enrollment.status === 'NOT_STARTED' ? 'Start Studying' : 'Resume Course'}
        </Button>
      </Link>
    </Card>
  );
}
