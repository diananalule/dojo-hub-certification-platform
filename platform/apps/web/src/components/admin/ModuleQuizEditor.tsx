'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, HelpCircle, Plus, Trash2, X } from 'lucide-react';
import { ModuleDto } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

/**
 * Authoring for a module's quiz.
 *
 * The API has supported module quizzes all along — five admin endpoints, both question
 * types, a pass threshold — but nothing in the admin UI ever called them, so the only
 * quizzes on the platform were the ones the seed script wrote directly. This is that
 * missing surface.
 *
 * Quizzes stay optional: a module without one simply has no quiz, and an existing quiz is
 * switched off with `quizEnabled` rather than deleted, so the questions survive being
 * hidden and can be brought back.
 */
const BLANK_QUESTION = {
  question: '',
  options: ['', ''],
  correctIndex: 0,
  explanation: '',
};

export function ModuleQuizEditor({ mod, trackId }: { mod: ModuleDto; trackId: string }) {
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(BLANK_QUESTION);
  const [error, setError] = useState<string | null>(null);

  const quiz = mod.quiz ?? null;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['track', 'admin', trackId] });
  const fail = (e: unknown) => setError(e instanceof ApiError ? e.message : 'Something went wrong.');
  const clear = () => setError(null);

  const createQuiz = useMutation({
    mutationFn: () =>
      api.post('/quizzes/modules/' + mod.id, {
        title: mod.title + ' — Quiz',
        passThreshold: 70,
      }),
    onSuccess: () => { clear(); refresh(); },
    onError: fail,
  });

  const addQuestion = useMutation({
    mutationFn: () =>
      api.post('/quizzes/module-quiz/' + quiz!.id + '/questions', {
        type: 'OBJECTIVE',
        question: draft.question.trim(),
        options: draft.options.map((o) => o.trim()).filter(Boolean),
        correctIndex: draft.correctIndex,
        explanation: draft.explanation.trim(),
      }),
    onSuccess: () => {
      setDraft(BLANK_QUESTION);
      setAdding(false);
      clear();
      refresh();
    },
    onError: fail,
  });

  const removeQuestion = useMutation({
    mutationFn: (questionId: string) => api.delete('/quizzes/questions/' + questionId),
    onSuccess: () => { clear(); refresh(); },
    onError: fail,
  });

  const toggleEnabled = useMutation({
    mutationFn: () => api.patch('/tracks/modules/' + mod.id, { quizEnabled: !mod.quizEnabled }),
    onSuccess: () => { clear(); refresh(); },
    onError: fail,
  });

  // Mirrors what the API will accept, so the button is only live when the save will work.
  const filledOptions = draft.options.map((o) => o.trim()).filter(Boolean);
  const canSave =
    draft.question.trim().length >= 5 &&
    filledOptions.length >= 2 &&
    draft.explanation.trim().length >= 5 &&
    draft.correctIndex < filledOptions.length;

  if (!quiz) {
    return (
      <div className="rounded-xl border border-dashed border-navy-200 bg-navy-50/60 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-navy-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-navy-950">No quiz on this module</p>
            <p className="text-xs text-navy-500">
              Optional — add one only if students should be tested at the end of this module.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => createQuiz.mutate()}
          loading={createQuiz.isPending}
          className="shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Add quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-navy-200 bg-white overflow-hidden">
      <div className="bg-navy-50 px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
        <div className="min-w-0">
          <p className="text-sm font-bold text-navy-950 truncate">{quiz.title}</p>
          <p className="text-[11px] text-navy-500">
            {quiz.questions.length} question{quiz.questions.length === 1 ? '' : 's'} · pass mark{' '}
            {quiz.passThreshold}%
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge tone={mod.quizEnabled ? 'green' : 'gray'}>
            {mod.quizEnabled ? 'Live' : 'Hidden'}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => toggleEnabled.mutate()}
            loading={toggleEnabled.isPending}
          >
            {mod.quizEnabled ? 'Hide from students' : 'Show to students'}
          </Button>
        </div>
      </div>

      {error && <p className="px-4 pt-3 text-xs text-crimson-700">{error}</p>}

      {quiz.questions.length === 0 && !adding && (
        <p className="px-4 py-3 text-xs text-navy-500">
          No questions yet. Students will not see this quiz until it has at least one.
        </p>
      )}

      <ul className="divide-y divide-navy-100">
        {quiz.questions.map((q, i) => (
          <li key={q.id} className="px-4 py-3 flex items-start gap-3">
            <span className="text-[11px] font-mono text-navy-400 mt-0.5 shrink-0">{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-navy-950">{q.question ?? q.prompt}</p>
              {q.type === 'OBJECTIVE' && (
                <ul className="mt-1.5 space-y-0.5">
                  {q.options.map((opt, oi) => (
                    <li
                      key={oi}
                      className={
                        oi === q.correctIndex
                          ? 'text-xs flex items-center gap-1.5 text-green-700 font-semibold'
                          : 'text-xs flex items-center gap-1.5 text-navy-500'
                      }
                    >
                      {oi === q.correctIndex ? (
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                      ) : (
                        <span className="w-3 shrink-0" />
                      )}
                      {opt}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button
              onClick={() => removeQuestion.mutate(q.id)}
              aria-label="Remove question"
              className="p-1.5 rounded-lg text-navy-400 hover:text-crimson-600 hover:bg-crimson-50 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </li>
        ))}
      </ul>

      {adding ? (
        <div className="p-4 border-t border-navy-100 space-y-3 bg-navy-50/40">
          <input
            className="input text-sm"
            placeholder="Question"
            value={draft.question}
            onChange={(e) => setDraft({ ...draft, question: e.target.value })}
          />

          <div className="space-y-2">
            <p className="text-[11px] font-mono uppercase tracking-wider text-navy-500">
              Options — click the circle to mark the correct answer
            </p>
            {draft.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label={'Mark option ' + (i + 1) + ' correct'}
                  onClick={() => setDraft({ ...draft, correctIndex: i })}
                  className={
                    draft.correctIndex === i
                      ? 'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center border-green-600 bg-green-600'
                      : 'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center border-navy-300'
                  }
                >
                  {draft.correctIndex === i && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <input
                  className="input text-sm py-2"
                  placeholder={'Option ' + (i + 1)}
                  value={opt}
                  onChange={(e) => {
                    const options = [...draft.options];
                    options[i] = e.target.value;
                    setDraft({ ...draft, options });
                  }}
                />
                {draft.options.length > 2 && (
                  <button
                    type="button"
                    aria-label={'Remove option ' + (i + 1)}
                    onClick={() => {
                      const options = draft.options.filter((_, oi) => oi !== i);
                      setDraft({
                        ...draft,
                        options,
                        correctIndex: Math.min(draft.correctIndex, options.length - 1),
                      });
                    }}
                    className="p-1.5 text-navy-400 hover:text-crimson-600 shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setDraft({ ...draft, options: [...draft.options, ''] })}
              className="text-xs font-bold text-crimson-600 hover:underline"
            >
              + Add option
            </button>
          </div>

          <input
            className="input text-sm"
            placeholder="Explanation shown after answering"
            value={draft.explanation}
            onChange={(e) => setDraft({ ...draft, explanation: e.target.value })}
          />

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => addQuestion.mutate()}
              loading={addQuestion.isPending}
              disabled={!canSave}
            >
              Save question
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setAdding(false);
                setDraft(BLANK_QUESTION);
                clear();
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-navy-100">
          <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
            <Plus className="w-3.5 h-3.5" /> Add question
          </Button>
        </div>
      )}
    </div>
  );
}
