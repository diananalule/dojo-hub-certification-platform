'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardCheck, Search } from 'lucide-react';
import { SubmissionDto, UserRole } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SlidingTabs } from '@/components/ui/SlidingTabs';
import { Skeleton } from '@/components/ui/Skeleton';
import { SubmissionReviewPanel } from '@/components/evaluator/SubmissionReviewPanel';

interface DirectoryEntry {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  studentProfile?: { currentLevel: { name: string } } | null;
  stats: { certificates?: number; cumulativeEnrollments?: number; activeEnrollments?: number; evaluationsDone?: number; pendingPlatformWide?: number };
}

const ROLE_OPTIONS = [
  { value: UserRole.STUDENT, label: 'Disciple Candidates' },
  { value: UserRole.EVALUATOR, label: 'Senior Supervisors' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery<DirectoryEntry[]>({
    queryKey: ['users', 'directory', role, search],
    queryFn: () => api.get<DirectoryEntry[]>(`/users?role=${role}&search=${encodeURIComponent(search)}`),
  });

  const suspend = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/suspend`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'directory'] }),
  });
  const reactivate = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/reactivate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'directory'] }),
  });
  const terminate = useMutation({
    mutationFn: (id: string) => api.post(`/users/${id}/terminate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users', 'directory'] }),
    onError: (e) => alert(e instanceof ApiError ? e.message : 'Failed to terminate account.'),
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">Dojo User Governance</h1>
          <p className="text-sm text-navy-500 mt-1">Manage student and supervisor accounts and access permissions.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-navy-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email..." className="input pl-10 py-2.5" />
        </div>
      </div>

      <SlidingTabs options={ROLE_OPTIONS} value={role} onChange={setRole} />

      <Card className="overflow-hidden">
        {isLoading && (
          <div className="divide-y divide-black/[0.05]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-6">
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/4" />
                  <Skeleton className="h-2.5 w-1/3" />
                </div>
                <Skeleton className="h-2.5 w-16 hidden sm:block" />
                <Skeleton className="h-2.5 w-24 hidden sm:block" />
                <Skeleton className="h-7 w-20 rounded-lg" />
              </div>
            ))}
          </div>
        )}
        {!isLoading && (
        <table className="w-full text-sm">
          <thead className="bg-navy-50 text-[10px] font-mono uppercase text-navy-400">
            <tr>
              <th className="text-left px-6 py-3">Name &amp; Contact</th>
              <th className="text-left px-6 py-3">Joined</th>
              <th className="text-left px-6 py-3">Stats</th>
              <th className="text-right px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {users.map((u) => (
              <tr key={u.id} className="transition-colors hover:bg-black/[0.015]">
                <td className="px-6 py-4">
                  <p className="font-bold text-navy-950">{u.name}</p>
                  <p className="text-xs text-navy-500">{u.email}</p>
                  {u.status === 'SUSPENDED' && (
                    <Badge tone="red" className="mt-1">
                      Suspended
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-xs text-navy-500 font-mono">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-xs text-navy-600 space-y-0.5">
                  {u.role === 'STUDENT' ? (
                    <>
                      <p>
                        Level: <strong className="text-navy-950">{u.studentProfile?.currentLevel.name}</strong>
                      </p>
                      <p>Certificates: {u.stats.certificates ?? 0}</p>
                      <p>
                        Enrollments: {u.stats.activeEnrollments ?? 0} active / {u.stats.cumulativeEnrollments ?? 0} total
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Evaluations completed: {u.stats.evaluationsDone ?? 0}</p>
                      <p>
                        Pending in platform queue: <strong className="text-navy-950">{u.stats.pendingPlatformWide ?? 0}</strong>
                      </p>
                    </>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {u.status === 'ACTIVE' ? (
                      <Button size="sm" variant="secondary" loading={suspend.isPending} onClick={() => suspend.mutate(u.id)}>
                        Suspend
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" loading={reactivate.isPending} onClick={() => reactivate.mutate(u.id)}>
                        Reactivate
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      loading={terminate.isPending}
                      onClick={() => {
                        if (confirm(`Permanently terminate ${u.name}'s account? This cannot be undone.`)) terminate.mutate(u.id);
                      }}
                    >
                      Terminate
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {!isLoading && users.length === 0 && <p className="p-6 text-sm text-navy-400 text-center">No accounts found.</p>}
      </Card>

      {role === UserRole.EVALUATOR && <PendingQueuePanel />}
    </div>
  );
}

function PendingQueuePanel() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: submissions = [], isLoading } = useQuery<(SubmissionDto & { student?: { name: string; email: string } })[]>({
    queryKey: ['submissions', 'queue', 'PENDING'],
    queryFn: () => api.get('/submissions/queue?status=PENDING'),
    refetchInterval: 20_000,
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-bold text-navy-950 uppercase tracking-wide">Platform Pending Queue</h2>
        {submissions.length > 0 && (
          <span className="w-5 h-5 rounded-full bg-crimson-600 text-white text-[10px] font-bold flex items-center justify-center">
            {submissions.length}
          </span>
        )}
      </div>
      <p className="text-xs text-navy-500 mb-4 -mt-2">
        Any supervisor can pick up work from this shared queue. As an admin, you can review and decide on any of it directly.
      </p>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      )}

      {!isLoading && submissions.length === 0 && (
        <Card className="p-6 text-center">
          <p className="text-sm text-navy-400">The queue is empty — nothing pending review right now.</p>
        </Card>
      )}

      <div className="space-y-3">
        {submissions.map((sub) => (
          <Card key={sub.id} className="overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-800 to-navy-950 text-white flex items-center justify-center text-xs font-bold shrink-0 ring-2 ring-white shadow-sm">
                  {sub.student?.name.split(' ').map((n) => n[0]).join('') ?? '??'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-navy-950 truncate">{sub.student?.name ?? 'Unknown'}</p>
                  <p className="text-xs text-navy-500 truncate">{sub.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge tone={sub.type === 'CAPSTONE' ? 'red' : 'blue'}>{sub.type === 'CAPSTONE' ? 'Capstone' : 'Topic Unit'}</Badge>
                <span className="text-[10px] text-navy-400 hidden sm:inline font-mono">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                <Button size="sm" variant={expandedId === sub.id ? 'dark' : 'outline'} onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}>
                  <ClipboardCheck className="w-3.5 h-3.5" /> Review
                </Button>
              </div>
            </div>
            {expandedId === sub.id && <SubmissionReviewPanel submission={sub} />}
          </Card>
        ))}
      </div>
    </div>
  );
}
