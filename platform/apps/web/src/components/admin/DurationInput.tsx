'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

/** The API rejects a zero-length lesson (Min(1)), so the control can never produce one. */
const MIN_SECONDS = 15;
const MAX_SECONDS = 599 * 60 + 59;
const MINUTE_STEP = 60;
const SECOND_STEP = 15;

function clamp(total: number): number {
  return Math.min(MAX_SECONDS, Math.max(MIN_SECONDS, total));
}

function Stepper({ onStep, label }: { onStep: (direction: 1 | -1) => void; label: string }) {
  return (
    <span className="flex flex-col border-l border-black/[0.08]">
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onStep(1)}
        aria-label={`Increase ${label}`}
        className="px-1.5 py-0.5 text-navy-400 hover:text-crimson-600 hover:bg-navy-50 rounded-tr-xl transition-colors"
      >
        <ChevronUp className="w-3 h-3" />
      </button>
      <button
        type="button"
        tabIndex={-1}
        onClick={() => onStep(-1)}
        aria-label={`Decrease ${label}`}
        className="px-1.5 py-0.5 text-navy-400 hover:text-crimson-600 hover:bg-navy-50 border-t border-black/[0.08] rounded-br-xl transition-colors"
      >
        <ChevronDown className="w-3 h-3" />
      </button>
    </span>
  );
}

/**
 * Lesson length as minutes + seconds rather than a free-text "MM:SS" string — the old
 * field silently produced an invalid duration whenever it was cleared or mistyped.
 * Value is total seconds, so callers never parse anything.
 */
export function DurationInput({ value, onChange }: { value: number; onChange: (totalSeconds: number) => void }) {
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;

  // Local text state lets a field sit empty mid-edit without snapping back to 0.
  const [minText, setMinText] = useState(String(minutes));
  const [secText, setSecText] = useState(String(seconds).padStart(2, '0'));

  useEffect(() => {
    setMinText(String(Math.floor(value / 60)));
    setSecText(String(value % 60).padStart(2, '0'));
  }, [value]);

  const commit = (nextMin: string, nextSec: string) => {
    const m = Number(nextMin) || 0;
    const s = Number(nextSec) || 0;
    onChange(clamp(m * 60 + s));
  };

  return (
    <div>
      <div className="flex items-stretch gap-2">
        {[
          {
            key: 'minutes',
            text: minText,
            setText: setMinText,
            step: MINUTE_STEP,
            suffix: 'min',
            onBlur: () => commit(minText, secText),
          },
          {
            key: 'seconds',
            text: secText,
            setText: setSecText,
            step: SECOND_STEP,
            suffix: 'sec',
            onBlur: () => commit(minText, secText),
          },
        ].map((field) => (
          <div
            key={field.key}
            className="flex items-center bg-white border border-black/[0.08] rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-crimson-500/40 focus-within:border-crimson-500 transition-all"
          >
            <input
              type="number"
              inputMode="numeric"
              value={field.text}
              onChange={(e) => field.setText(e.target.value)}
              onBlur={field.onBlur}
              aria-label={`Lesson length — ${field.key}`}
              // Native spinners hidden; the chevrons below are the visible control.
              className="w-12 px-2.5 py-3 text-sm text-navy-950 text-right bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="pr-2 text-[12px] font-mono uppercase text-navy-400 select-none">{field.suffix}</span>
            <Stepper
              label={`lesson ${field.key}`}
              onStep={(direction) => onChange(clamp(value + direction * field.step))}
            />
          </div>
        ))}
      </div>
      <p className="mt-1 text-[12px] text-navy-400">
        Lesson length — seconds step by {SECOND_STEP}. Arrow keys work too.
      </p>
    </div>
  );
}
