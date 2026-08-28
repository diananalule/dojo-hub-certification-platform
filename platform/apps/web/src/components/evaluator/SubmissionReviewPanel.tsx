'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, CheckSquare, Square, ExternalLink, FileText, XCircle } from 'lucide-react';
import { SubmissionDto } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

function EvidenceList({ submission }: { submission: SubmissionDto }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[12px] font-mono uppercase text-navy-400 font-bold mb-1">Candidate Write-up</p>
        <p className="text-xs text-navy-700 bg-white p-3 rounded-lg border border-navy-100">{submission.submissionText}</p>
      </div>

      {submission.links.length > 0 && (
        <div>
          <p className="text-[12px] font-mono uppercase text-navy-400 font-bold mb-1">Submitted Links</p>
          <div className="space-y-1.5">
            {submission.links.map((l, i) => (
              /* The URL is always shown, not just the description. An evaluator grading a
                 submission needs to see where a link actually goes — whether it is the
                 GitHub repo it claims to be — before deciding to open it, and the
                 description alone gave them no way to tell. */
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 text-xs bg-white border border-navy-100 rounded-lg px-3 py-2 hover:border-crimson-300"
              >
                <ExternalLink className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-0.5" />
                <span className="min-w-0 flex-1">
                  {l.description && (
                    <span className="block truncate font-semibold text-navy-800">{l.description}</span>
                  )}
                  <span className="block break-all font-mono text-[11px] text-crimson-700">{l.url}</span>
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {submission.files.length > 0 && (
        <div>
          <p className="text-[12px] font-mono uppercase text-navy-400 font-bold mb-1">Submitted Files</p>
          <div className="space-y-1.5">
            {submission.files.map((f) => (
              <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs bg-white border border-navy-100 rounded-lg px-3 py-2 hover:border-crimson-300">
                <FileText className="w-3.5 h-3.5 text-navy-400 shrink-0" />
                <span className="truncate">{f.originalName}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DecidedSubmissionSummary({ submission }: { submission: SubmissionDto }) {
  const approved = submission.status === 'APPROVED';
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-navy-50 p-5 rounded-b-2xl">
      <EvidenceList submission={submission} />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {approved ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-crimson-600" />}
          <Badge tone={approved ? 'green' : 'red'}>{submission.status}</Badge>
          {submission.score !== null && <span className="text-xs font-bold text-navy-950">{submission.score}%</span>}
        </div>
        {submission.feedback && (
          <div className="bg-white rounded-lg border border-navy-100 p-3 text-xs">
            <p className="font-bold text-navy-500 mb-1">Feedback Given</p>
            <p className="text-navy-700">{submission.feedback}</p>
          </div>
        )}
        <p className="text-[12px] text-navy-400">
          Decided by {submission.evaluatorName ?? 'an evaluator'}
          {submission.evaluatedAt && ` on ${new Date(submission.evaluatedAt).toLocaleString()}`}. This decision is final and cannot be changed here.
        </p>
      </div>
    </div>
  );
}

export function SubmissionReviewPanel({ submission }: { submission: SubmissionDto }) {
  const queryClient = useQueryClient();
  const [score, setScore] = useState(90);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggleCheck = useMutation({
    mutationFn: ({ checkId, checked }: { checkId: string; checked: boolean }) =>
      api.patch(`/submissions/${submission.id}/rubric/${checkId}`, { checked }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions', 'queue'] }),
  });

  const grade = useMutation({
    mutationFn: (decision: 'APPROVE' | 'REJECT') => api.post(`/submissions/${submission.id}/grade`, { decision, score, feedback }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', 'queue'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'directory'] });
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : 'Failed to submit grade.'),
  });

  const allChecked = submission.rubricChecks.length === 0 || submission.rubricChecks.every((c) => c.checked);

  if (submission.status !== 'PENDING') {
    return <DecidedSubmissionSummary submission={submission} />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-navy-50 p-5 rounded-b-2xl">
      <EvidenceList submission={submission} />

      <div className="space-y-4">
        {submission.rubricChecks.length > 0 && (
          <div>
            <p className="text-[12px] font-mono uppercase text-navy-400 font-bold mb-1">Grading Rubric (all required to approve)</p>
            <div className="space-y-1.5">
              {submission.rubricChecks.map((check) => (
                <button
                  key={check.id}
                  onClick={() => toggleCheck.mutate({ checkId: check.id, checked: !check.checked })}
                  aria-pressed={check.checked}
                  className="w-full flex items-center gap-2 text-xs bg-white border border-navy-100 rounded-lg px-3 py-2 text-left hover:border-crimson-300"
                >
                  {check.checked ? (
                    <CheckSquare className="w-4 h-4 text-green-600 shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-navy-300 shrink-0" />
                  )}
                  <span>{check.requirement}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex justify-between text-[12px] text-navy-400 mb-1">
            <span>60% Passing</span>
            <span className="font-bold text-navy-950">{score}%</span>
            <span>100% Perfect</span>
          </div>
          <input
            type="range"
            min={60}
            max={100}
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value, 10))}
            aria-label="Submission score percentage"
            className="w-full accent-crimson-600"
          />
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          placeholder="Written feedback for the candidate (required)..."
          aria-label="Written feedback for the candidate"
          className="input resize-none"
        />
        {error && <p className="text-xs text-crimson-600">{error}</p>}
        {!allChecked && <p className="text-[12px] text-amber-700">Check every rubric item before approving.</p>}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            loading={grade.isPending}
            onClick={() => {
              if (!feedback.trim()) return setError('Feedback is required.');
              setError(null);
              grade.mutate('REJECT');
            }}
          >
            Request Revision
          </Button>
          <Button
            size="sm"
            disabled={!allChecked}
            loading={grade.isPending}
            onClick={() => {
              if (!feedback.trim()) return setError('Feedback is required.');
              setError(null);
              grade.mutate('APPROVE');
            }}
          >
            Approve &amp; Pass
          </Button>
        </div>
      </div>
    </div>
  );
}
