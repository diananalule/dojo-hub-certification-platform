'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AuditLogDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

const SEVERITY_TONE: Record<string, 'gray' | 'green' | 'amber' | 'red'> = {
  INFO: 'gray',
  SUCCESS: 'green',
  WARNING: 'amber',
  ERROR: 'red',
};

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery<{ items: AuditLogDto[]; total: number; page: number; pageSize: number }>({
    queryKey: ['audit-logs', page],
    queryFn: () => api.get(`/audit-logs?page=${page}&pageSize=25`),
  });

  const totalPages = data ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Platform Audit Log</h1>
        <p className="text-sm text-navy-500 mt-1">A complete, tamper-evident history of every meaningful action on the platform.</p>
      </div>

      <Card className="divide-y divide-navy-100">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="p-4 flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-2.5 w-2/3" />
              </div>
              <div className="space-y-1.5 items-end flex flex-col shrink-0">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-2.5 w-20" />
              </div>
            </div>
          ))}
        {data?.items.map((log) => (
          <div key={log.id} className="p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-navy-950">
                <span className="font-bold">{log.actorName}</span> <span className="text-navy-400 text-xs">({log.actorRole})</span>
              </p>
              <p className="text-xs text-navy-600 mt-0.5">{log.action}</p>
            </div>
            <div className="text-right shrink-0">
              <Badge tone={SEVERITY_TONE[log.severity]}>{log.severity}</Badge>
              <p className="text-[12px] text-navy-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {!isLoading && data?.items.length === 0 && <p className="p-6 text-sm text-navy-400 text-center">No audit entries yet.</p>}
      </Card>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-navy-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 py-1.5 text-xs text-navy-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-bold rounded-lg border border-navy-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
