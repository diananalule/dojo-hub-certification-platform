'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, ChevronLeft } from 'lucide-react';
import { AttemptTargetType, SubmissionDto, TopicProgressDto, TrackDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { useMyEnrollments } from '@/lib/hooks';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { VideoPlayer } from './VideoPlayer';
import { SubmissionWorkspace } from './SubmissionWorkspace';
import { SyllabusPanel } from './SyllabusPanel';
import { AssessmentWizard } from './AssessmentWizard';
import { Modal } from '../ui/Modal';
import { Skeleton, SkeletonRow } from '../ui/Skeleton';

export function CoursePlayer({ trackId }: { trackId: string }) {
  const queryClient = useQueryClient();
  const { data: track, isLoading } = useQuery<TrackDto>({ queryKey: ['track', trackId], queryFn: () => api.get<TrackDto>(`/tracks/${trackId}`) });
  const { data: enrollments = [] } = useMyEnrollments();
  const enrollment = enrollments.find((e) => e.trackId === trackId);

  const { data: progress = [] } = useQuery<TopicProgressDto[]>({
    queryKey: ['progress', trackId],
    queryFn: () => api.get<TopicProgressDto[]>(`/progress/tracks/${trackId}`),
  });
  const watchedIds = new Set(progress.filter((p) => p.watched).map((p) => p.topicId));

  const { data: submissions = [] } = useQuery<SubmissionDto[]>({
    queryKey: ['submissions', 'mine'],
    queryFn: () => api.get<SubmissionDto[]>('/submissions/mine'),
  });

  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [confirmUnenroll, setConfirmUnenroll] = useState(false);
  const [quizModal, setQuizModal] = useState<{ type: AttemptTargetType; fetchParam: string } | null>(null);

  const allTopics = track?.modules.flatMap((m) => m.topics) ?? [];
  const topiclessModules = track?.modules.filter((m) => m.topics.length === 0) ?? [];

  const selectedModule = selectedModuleId ? (topiclessModules.find((m) => m.id === selectedModuleId) ?? null) : null;
  const defaultTopic = allTopics.find((t) => !watchedIds.has(t.id)) ?? allTopics[0] ?? null;
  const selectedTopic = selectedModule
    ? null
    : ((selectedTopicId ? allTopics.find((t) => t.id === selectedTopicId) : null) ?? defaultTopic);

  // A brief-only track (every module topic-less) has nothing to auto-select, so open the first module.
  const activeModule = selectedModule ?? (!selectedTopic && topiclessModules.length > 0 ? topiclessModules[0] : null);

  const enroll = useMutation({
    mutationFn: () => api.post(`/enrollments/tracks/${trackId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] }),
  });
  const unenroll = useMutation({
    mutationFn: () => api.delete(`/enrollments/tracks/${trackId}`),
    onSuccess: () => {
      // Progress and submissions for this track are wiped server-side, so every
      // cached view of them has to be refetched rather than showing stale state.
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['progress', trackId] });
      queryClient.invalidateQueries({ queryKey: ['submissions', 'mine'] });
      setConfirmUnenroll(false);
      setSelectedTopicId(null);
      setSelectedModuleId(null);
    },
  });
  const markWatched = useMutation({
    mutationFn: (topicId: string) => api.post(`/progress/topics/${topicId}/watched`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress', trackId] });
      queryClient.invalidateQueries({ queryKey: ['enrollments', 'me'] });
    },
  });

  if (isLoading || !track) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-7 w-2/5" />
          <Skeleton className="h-3.5 w-3/5" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
          <div className="bg-white rounded-2xl border border-black/[0.06] divide-y divide-navy-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
          <Skeleton className="h-[420px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Link href="/learning" className="flex items-center gap-1 text-xs text-navy-500 hover:text-navy-950 font-semibold">
          <ChevronLeft className="w-4 h-4" /> Back to My Learning
        </Link>
        {isEnrolled ? (
          <Button size="sm" variant="outline" onClick={() => setConfirmUnenroll(true)}>
            Unenroll
          </Button>
        ) : (
          <Button size="sm" onClick={() => enroll.mutate()} loading={enroll.isPending}>
            Enroll in this Track
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="red">{track.category.name}</Badge>
          <Badge tone="gray">{track.difficulty}</Badge>
          {!isEnrolled && <Badge tone="amber">Preview Mode</Badge>}
        </div>
        <h1 className="text-2xl font-extrabold text-navy-950">{track.title}</h1>
        <p className="text-sm text-navy-500 mt-1">{track.description}</p>
      </div>

      {!isEnrolled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          You&apos;re browsing in preview mode. Enroll to track progress, submit competency evidence, and take assessments.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">
        <SyllabusPanel
          track={track}
          watchedTopicIds={watchedIds}
          submissions={submissions}
          selectedTopicId={selectedTopic?.id ?? null}
          selectedModuleId={activeModule?.id ?? null}
          onSelectTopic={(topic) => {
            setSelectedModuleId(null);
            setSelectedTopicId(topic.id);
          }}
          onSelectModule={(moduleId) => {
            setSelectedTopicId(null);
            setSelectedModuleId(moduleId);
          }}
          onOpenQuiz={(moduleId) => setQuizModal({ type: 'MODULE_QUIZ', fetchParam: moduleId })}
          onOpenAssessment={() => setQuizModal({ type: 'TRACK_ASSESSMENT', fetchParam: trackId })}
        />

        <div className="bg-white rounded-2xl border border-navy-200 p-5 space-y-6">
          {selectedTopic ? (
            <>
              <VideoPlayer
                key={selectedTopic.id}
                topic={selectedTopic}
                watched={watchedIds.has(selectedTopic.id)}
                onWatched={() => isEnrolled && markWatched.mutate(selectedTopic.id)}
              />
              {isEnrolled && <SubmissionWorkspace topicId={selectedTopic.id} topicTitle={selectedTopic.title} />}
            </>
          ) : activeModule ? (
            <>
              <div>
                <Badge tone="blue">Project Brief</Badge>
                <h3 className="font-bold text-navy-950 mt-2">{activeModule.title}</h3>
                <p className="text-sm text-navy-600 mt-2 whitespace-pre-wrap">{activeModule.description}</p>
                {activeModule.tools.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {activeModule.tools.map((tool) => (
                      <Badge key={tool} tone="indigo">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              {isEnrolled && <SubmissionWorkspace moduleId={activeModule.id} topicTitle={activeModule.title} />}
            </>
          ) : (
            <p className="text-sm text-navy-400">This track has no published lessons yet.</p>
          )}
        </div>
      </div>

      {confirmUnenroll && (
        <Modal
          open
          onClose={() => setConfirmUnenroll(false)}
          title="Unenroll from this course?"
          subtitle="This cannot be undone."
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex gap-3 bg-crimson-50 border border-crimson-200 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-crimson-600 shrink-0 mt-0.5" />
              <div className="text-sm text-crimson-800 space-y-2">
                <p className="font-bold">Your progress in this course will be erased.</p>
                <p>
                  You will <span className="font-semibold">not</span> resume where you stopped. If you enrol again later, you start this
                  course from the very beginning.
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 mb-2">What gets deleted</p>
              <ul className="text-sm text-navy-700 space-y-1.5">
                <li className="flex gap-2">
                  <span className="text-crimson-600">•</span>
                  {watchedIds.size > 0 ? `${watchedIds.size} completed lesson${watchedIds.size === 1 ? '' : 's'}` : 'Your lesson progress'}
                </li>
                <li className="flex gap-2">
                  <span className="text-crimson-600">•</span>
                  Work you submitted for this course, including supervisor feedback and scores
                </li>
              </ul>
              <p className="text-xs text-navy-500 mt-3">
                Certificates you have already earned are kept — they are tied to your certification level, not to this course.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button variant="secondary" onClick={() => setConfirmUnenroll(false)}>
                Stay Enrolled
              </Button>
              <Button variant="danger" loading={unenroll.isPending} onClick={() => unenroll.mutate()}>
                Unenroll &amp; Erase
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {quizModal && <AssessmentWizard type={quizModal.type} fetchParam={quizModal.fetchParam} onClose={() => setQuizModal(null)} />}
    </div>
  );
}
