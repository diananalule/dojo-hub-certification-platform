'use client';

import { useEffect } from 'react';
import { cn } from './cn';
import { useSlidingIndicator } from './useSlidingIndicator';

interface TabOption<T extends string> {
  value: T;
  label: string;
}

/**
 * A segmented-control style tab group with two blended sliding layers:
 * a persistent solid pill that glides to the selected tab on click, and a
 * lighter glass pill that previews under whichever tab the cursor is
 * hovering (with a short delay), independent of the current selection.
 */
export function SlidingTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: TabOption<T>[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  const hoverIndicator = useSlidingIndicator('horizontal');
  const selectIndicator = useSlidingIndicator('horizontal');

  useEffect(() => {
    selectIndicator.focusItem(value, { immediate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={cn('relative inline-flex items-center gap-1 p-1 bg-navy-950/[0.04] rounded-xl', className)}
      onMouseLeave={hoverIndicator.release}
    >
      <div
        className="slide-indicator absolute top-1 bottom-1 z-0 rounded-lg bg-white/80 border border-black/[0.05] shadow-sm"
        style={hoverIndicator.indicatorStyle}
      />
      <div
        className="slide-indicator absolute top-1 bottom-1 z-[1] rounded-lg bg-navy-950 shadow-md shadow-navy-950/25"
        style={selectIndicator.indicatorStyle}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          ref={(el) => {
            hoverIndicator.registerItem(opt.value)(el);
            selectIndicator.registerItem(opt.value)(el);
          }}
          type="button"
          onMouseEnter={() => hoverIndicator.focusItem(opt.value)}
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative z-10 px-4 py-1.5 text-xs font-bold rounded-lg transition-colors duration-300 cursor-pointer whitespace-nowrap',
            value === opt.value ? 'text-white' : 'text-navy-600 hover:text-navy-950',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
