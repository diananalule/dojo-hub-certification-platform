import { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { cn } from './cn';

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'green' | 'amber' | 'red';
}) {
  const toneClasses = {
    default: 'text-navy-950',
    green: 'text-emerald-600',
    amber: 'text-amber-600',
    red: 'text-crimson-600',
  }[tone];

  const iconToneClasses = {
    default: 'text-navy-500 bg-navy-50 border-navy-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    red: 'text-crimson-600 bg-crimson-50 border-crimson-100',
  }[tone];

  return (
    <Card hover className="p-6 flex items-start justify-between gap-4 group">
      <div>
        <p className="text-[10px] font-mono uppercase tracking-wider text-navy-400 font-bold">{label}</p>
        <p className={cn('text-3xl font-extrabold mt-1.5 tracking-tight', toneClasses)}>{value}</p>
        {sublabel && <p className="text-xs text-navy-500 mt-1">{sublabel}</p>}
      </div>
      {Icon && (
        <div
          className={cn(
            'w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6',
            iconToneClasses,
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}
    </Card>
  );
}
