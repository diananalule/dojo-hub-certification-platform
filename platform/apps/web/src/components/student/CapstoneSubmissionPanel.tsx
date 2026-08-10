'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Plus, Trash2, Trophy, XCircle } from 'lucide-react';
import { LevelDto, StoredFileKind, SubmissionDto } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { FileDropzone } from './FileDropzone';

export function CapstoneSubmissionPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery<SubmissionDto[]>({
    queryKey: ['submissions', 'mine'],
    queryFn: () => api.get<SubmissionDto[]>('/submissions/mine'),
    enabled: !!user?.studentProfile,
  });

  const { data: levels = [] } = useQuery<LevelDto[]>({
    queryKey: ['levels'],
    queryFn: () => api.get<LevelDto[]>('/levels'),
    enabled: !!user?.studentProfile,
  });

  const [links, setLinks] = useState([{ url: '', description: '' }]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<{ id: string; originalName: string; sizeBytes: number }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentLevel = user?.studentProfile?.currentLevel;

  const submit = useMutation({
    mutationFn: () =>
      api.post<SubmissionDto>('/submissions', {
        type: 'CAPSTONE',
        levelId: currentLevel!.id,
        title: `Capstone Project — ${currentLevel!.name}`,
        submissionText: notes,
        links: links.filter((l) => l.url.trim()),
        fileIds: files.map((f) => f.id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', 'mine'] });
      setLinks([{ url: '', description: '' }]);
      setNotes('');
      setFiles([]);
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Submission failed.'),
  });

  if (!currentLevel) return null;

  const isTopLevel = levels.length > 0 && !levels.some((l) => l.order > currentLevel.order);
  const existing = submissions.find((s) => s.type === 'CAPSTONE' && s.levelId === currentLevel.id && s.status !== 'REJECTED');
  const lastRejected = submissions.find((s) => s.type === 'CAPSTONE' && s.levelId === currentLevel.id && s.status === 'REJECTED');

  if (isTopLevel) {
    return (
      <Card className="p-6 space-y-2 bg-gradient-to-br from-navy-950 to-navy-900 border-navy-900">
        <div className="flex items-center gap-2 text-white">
          <Trophy className="w-5 h-5 text-crimson-400" />
          <h3 className="font-bold">You&apos;ve reached the top certification level</h3>
        </div>
        <p className="text-sm text-navy-300">
          You&apos;re at {currentLevel.name} — the highest rung on the certification ladder. Nothing further to submit.
        </p>
      </Card>
    );
  }

  if (existing?.status === 'APPROVED' || existing?.status === 'PENDING') {
    return (
      <Card className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          {existing.status === 'APPROVED' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-navy-600 animate-pulse" />
          )}
          <h3 className="font-bold text-sm text-navy-950">
            {existing.status === 'APPROVED' ? 'Capstone Approved' : `Capstone for ${currentLevel.name} — Under Review`}
          </h3>
        </div>
        <p className="text-xs text-navy-600">{existing.submissionText}</p>
        {existing.status === 'APPROVED' && existing.feedback && (
          <div className="bg-navy-50 rounded-lg border border-navy-200 p-3 text-xs">
            <p className="font-bold text-navy-500 mb-1">Supervisor Feedback</p>
            <p className="text-navy-600">{existing.feedback}</p>
            <p className="text-[12px] text-navy-400 mt-1">— {existing.evaluatorName}</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-bold text-sm text-navy-950">Submit Capstone Project — {currentLevel.name}</h3>
        <p className="text-xs text-navy-500 mt-0.5">
          A supervisor reviews your project holistically and decides whether you advance to the next level.
        </p>
      </div>

      {lastRejected && (
        <div className="bg-crimson-50 border border-crimson-200 rounded-lg p-3 text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-crimson-700 font-bold">
            <XCircle className="w-3.5 h-3.5" /> Revision Requested
          </div>
          <p className="text-crimson-600">{lastRejected.feedback}</p>
        </div>
      )}

      {error && <div className="bg-crimson-50 border border-crimson-200 rounded-lg p-2.5 text-xs text-crimson-700">{error}</div>}

      <div className="space-y-2">
        <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500">Evidence Links</label>
        {links.map((link, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={link.url}
              onChange={(e) => setLinks(links.map((l, idx) => (idx === i ? { ...l, url: e.target.value } : l)))}
              placeholder="https://github.com/..."
              aria-label="Evidence link URL"
              className="input flex-1"
            />
            <input
              value={link.description}
              onChange={(e) => setLinks(links.map((l, idx) => (idx === i ? { ...l, description: e.target.value } : l)))}
              placeholder="Description"
              aria-label="Evidence link description"
              className="input flex-1"
            />
            {links.length > 1 && (
              <button onClick={() => setLinks(links.filter((_, idx) => idx !== i))} aria-label="Remove this link" className="text-navy-400 hover:text-crimson-600">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => setLinks([...links, { url: '', description: '' }])}
          className="text-[13px] font-semibold text-crimson-600 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add another link
        </button>
      </div>

      <div>
        <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1">Supporting Files</label>
        <FileDropzone
          kind={StoredFileKind.DOCUMENT}
          accept=".pdf,.doc,.docx,.zip,.txt,.json,.png,.jpg"
          files={files}
          onChange={setFiles}
        />
      </div>

      <div>
        <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Describe your project and how it demonstrates readiness for the next level..."
          className="input resize-none"
        />
      </div>

      <Button
        size="sm"
        loading={submit.isPending}
        onClick={() => {
          setError(null);
          if (!links.some((l) => l.url.trim()) && files.length === 0) {
            setError('Add at least one link or uploaded file as evidence.');
            return;
          }
          if (notes.trim().length < 10) {
            setError('Add a short note (10+ characters) describing your submission.');
            return;
          }
          submit.mutate();
        }}
      >
        Submit for Review
      </Button>
    </Card>
  );
}
