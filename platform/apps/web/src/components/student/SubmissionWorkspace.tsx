'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Clock, Plus, Trash2, XCircle } from 'lucide-react';
import { StoredFileKind, SubmissionDto } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '../ui/Button';
import { FileDropzone } from './FileDropzone';

export function SubmissionWorkspace({
  topicId,
  moduleId,
  topicTitle,
}: {
  topicId?: string;
  moduleId?: string;
  topicTitle: string;
}) {
  const queryClient = useQueryClient();
  const { data: submissions = [] } = useQuery<SubmissionDto[]>({
    queryKey: ['submissions', 'mine'],
    queryFn: () => api.get<SubmissionDto[]>('/submissions/mine'),
  });

  const matchesTarget = (s: SubmissionDto) => (topicId ? s.topicId === topicId : s.moduleId === moduleId);
  const existing = submissions.find((s) => matchesTarget(s) && s.status !== 'REJECTED');
  const lastRejected = submissions.find((s) => matchesTarget(s) && s.status === 'REJECTED');

  const [links, setLinks] = useState([{ url: '', description: '' }]);
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<{ id: string; originalName: string; sizeBytes: number; kind: StoredFileKind }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () =>
      api.post<SubmissionDto>('/submissions', {
        type: 'COMPETENCY',
        ...(topicId ? { topicId } : { moduleId }),
        title: `Competency Evidence: ${topicTitle}`,
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

  if (existing?.status === 'APPROVED' || existing?.status === 'PENDING') {
    return (
      <div className="bg-navy-50 rounded-2xl border border-navy-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          {existing.status === 'APPROVED' ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-navy-600 animate-pulse" />
          )}
          <h4 className="font-bold text-sm text-navy-950">
            {existing.status === 'APPROVED' ? 'Competency Verified' : 'Under Active Review'}
          </h4>
        </div>
        <p className="text-xs text-navy-600">{existing.submissionText}</p>
        {existing.status === 'APPROVED' && existing.feedback && (
          <div className="bg-white rounded-lg border border-navy-200 p-3 text-xs">
            <p className="font-bold text-navy-500 mb-1">Supervisor Feedback ({existing.score}%)</p>
            <p className="text-navy-600">{existing.feedback}</p>
            <p className="text-[10px] text-navy-400 mt-1">— {existing.evaluatorName}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-navy-50 rounded-2xl border border-navy-200 p-5 space-y-4">
      <h4 className="font-bold text-sm text-navy-950">Submit Competency Evidence</h4>

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
        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-navy-500">Evidence Links</label>
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
          className="text-[11px] font-semibold text-crimson-600 flex items-center gap-1"
        >
          <Plus className="w-3 h-3" /> Add another link
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1">Documents</label>
          <FileDropzone
            kind={StoredFileKind.DOCUMENT}
            accept=".pdf,.doc,.docx,.zip,.txt,.json,.png,.jpg"
            files={files.filter((f) => f.kind === StoredFileKind.DOCUMENT)}
            onChange={(docFiles) => setFiles([...files.filter((f) => f.kind !== StoredFileKind.DOCUMENT), ...docFiles.map((f) => ({ ...f, kind: StoredFileKind.DOCUMENT }))])}
          />
        </div>
        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1">Demo Video</label>
          <FileDropzone
            kind={StoredFileKind.VIDEO}
            accept="video/*"
            files={files.filter((f) => f.kind === StoredFileKind.VIDEO)}
            onChange={(vidFiles) => setFiles([...files.filter((f) => f.kind !== StoredFileKind.VIDEO), ...vidFiles.map((f) => ({ ...f, kind: StoredFileKind.VIDEO }))])}
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Describe what you built and how it satisfies this competency..."
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
    </div>
  );
}
