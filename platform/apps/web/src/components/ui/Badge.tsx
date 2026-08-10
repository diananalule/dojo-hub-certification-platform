import { HTMLAttributes } from 'react';
import { cn } from './cn';

type BadgeTone = 'gray' | 'red' | 'green' | 'amber' | 'blue' | 'indigo' | 'navy';

const TONE_CLASSES: Record<BadgeTone, string> = {
  gray: 'bg-navy-950/[0.05] text-navy-600 border-navy-950/[0.08]',
  red: 'bg-crimson-50 text-crimson-700 border-crimson-200/70',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/70',
  blue: 'bg-navy-50 text-navy-700 border-navy-200/70',
  indigo: 'bg-navy-100 text-navy-800 border-navy-300/50',
  navy: 'bg-gradient-to-br from-navy-950 to-navy-800 text-white border-navy-900',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = 'gray', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-mono font-bold uppercase tracking-wider border transition-colors duration-200',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    />
  );
}
