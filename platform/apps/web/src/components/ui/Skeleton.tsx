import { cn } from './cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-lg', className)} />;
}

export function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-black/[0.06] overflow-hidden', className)}>
      <Skeleton className="h-32 rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-4 w-4/5" />
        <SkeletonText lines={2} />
      </div>
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 p-4', className)}>
      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-2.5 w-1/2" />
      </div>
    </div>
  );
}

export function SkeletonTile({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white rounded-2xl border border-black/[0.06] p-5 space-y-3', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-2.5 w-2/5" />
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>
      <Skeleton className="h-7 w-1/3" />
      <Skeleton className="h-2.5 w-3/5" />
    </div>
  );
}
