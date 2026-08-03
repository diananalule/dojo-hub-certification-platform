'use client';

import { useQuery } from '@tanstack/react-query';
import { EvaluatorInsightsDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function EvaluatorInsightsPage() {
  const { data, isLoading } = useQuery<EvaluatorInsightsDto>({
    queryKey: ['reports', 'my-insights'],
    queryFn: () => api.get<EvaluatorInsightsDto>('/reports/my-insights'),
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <Card className="p-6">
        <h1 className="text-lg font-extrabold text-navy-950">Student Grade Insights</h1>
        <p className="text-sm text-navy-500 mt-1">Performance benchmarking of your graded submissions.</p>
      </Card>

      {isLoading || !data ? (
        <Card className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </Card>
      ) : (
        <Card className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Metric label="Average Grading Score" value={`${data.averageGradingScore}%`} sublabel={`Across ${data.totalGraded} evaluations`} />
          <Metric label="Average Resolution Time" value={`${data.averageResolutionHours}h`} sublabel="From submission to decision" />
          <Metric label="First Attempt Pass Rate" value={`${data.firstAttemptPassRate}%`} sublabel="Submissions approved" />
        </Card>
      )}
    </div>
  );
}

function Metric({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="bg-navy-50 rounded-xl p-5 text-center">
      <p className="text-[10px] font-mono uppercase text-navy-400 font-bold">{label}</p>
      <p className="text-3xl font-extrabold text-navy-950 mt-1">{value}</p>
      <p className="text-xs text-navy-500 mt-1">{sublabel}</p>
    </div>
  );
}
