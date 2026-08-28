'use client';

import { useQuery } from '@tanstack/react-query';
import { Database, TriangleAlert } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Read-only view of what is actually in the database, with seed data flagged.
 *
 * Exists so the decision to delete production data is made against real numbers rather
 * than assumptions. Nothing here removes anything.
 */
interface Inventory {
  accounts: { id: string; name: string; email: string; role: string; isSeed: boolean }[];
  courses: {
    id: string;
    title: string;
    status: string;
    moduleCount: number;
    isSeed: boolean;
    enrolments: number;
  }[];
  submissions: {
    id: string;
    title: string;
    status: string;
    evaluatorName: string | null;
    owner: 'seed' | 'real' | 'orphaned';
  }[];
  credentials: { id: string; kind: string; owner: 'seed' | 'real' | 'orphaned' }[];
  totals: Record<string, number>;
}

const OWNER_TONE = { seed: 'amber', real: 'green', orphaned: 'red' } as const;

export function DataInventory() {
  const { data, isLoading } = useQuery<Inventory>({
    queryKey: ['reports', 'inventory'],
    queryFn: () => api.get<Inventory>('/reports/inventory'),
  });

  if (isLoading) return <Skeleton className="h-64 rounded-2xl" />;
  if (!data) return null;

  const seedSubmissions = data.submissions.filter((s) => s.owner === 'seed').length;
  const orphanedSubmissions = data.submissions.filter((s) => s.owner === 'orphaned').length;

  return (
    <Card className="p-6 space-y-5">
      <div className="flex items-start gap-3">
        <Database className="w-5 h-5 text-crimson-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="font-extrabold text-navy-950 tracking-tight">Data Inventory</h2>
          <p className="text-xs text-navy-500 mt-0.5">
            Everything currently in the database. Sample data shipped with the platform is
            flagged as <span className="font-semibold">seed</span>. Nothing here deletes anything.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Accounts', value: data.totals.accounts, sub: `${data.totals.seedAccounts} seed` },
          { label: 'Courses', value: data.totals.courses, sub: `${data.totals.seedCourses} seed` },
          { label: 'Submissions', value: data.totals.submissions, sub: `${seedSubmissions} seed` },
          { label: 'Certificates', value: data.totals.credentials, sub: `${data.totals.enrolments} enrolments` },
        ].map((t) => (
          <div key={t.label} className="bg-navy-50 rounded-xl p-3">
            <p className="text-[11px] font-mono uppercase tracking-wider text-navy-400">{t.label}</p>
            <p className="text-2xl font-extrabold text-navy-950 tabular-nums">{t.value}</p>
            <p className="text-[11px] text-navy-500">{t.sub}</p>
          </div>
        ))}
      </div>

      {orphanedSubmissions > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
          <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900">
            <span className="font-bold">{orphanedSubmissions} submission(s) belong to deleted accounts.</span>{' '}
            Submissions are kept when a student is removed, so these stay in the evaluator&apos;s
            totals even though the student is gone.
          </p>
        </div>
      )}

      <Section title="Accounts">
        {data.accounts.map((a) => (
          <Row
            key={a.id}
            left={a.name}
            mid={a.email}
            right={<Badge tone={a.isSeed ? 'amber' : 'green'}>{a.isSeed ? 'seed' : 'real'}</Badge>}
            note={a.role}
          />
        ))}
      </Section>

      <Section title="Courses">
        {data.courses.map((c) => (
          <Row
            key={c.id}
            left={c.title}
            mid={`${c.moduleCount} module(s) · ${c.enrolments} enrolment(s)`}
            right={<Badge tone={c.isSeed ? 'amber' : 'green'}>{c.isSeed ? 'seed' : 'real'}</Badge>}
            note={c.status}
          />
        ))}
      </Section>

      <Section title="Submissions">
        {data.submissions.length === 0 && <p className="text-xs text-navy-400 px-1">None.</p>}
        {data.submissions.map((s) => (
          <Row
            key={s.id}
            left={s.title}
            mid={s.evaluatorName ? `graded by ${s.evaluatorName}` : 'ungraded'}
            right={<Badge tone={OWNER_TONE[s.owner]}>{s.owner}</Badge>}
            note={s.status}
          />
        ))}
      </Section>
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-mono uppercase tracking-wider font-bold text-navy-500 mb-2">
        {title}
      </p>
      <div className="divide-y divide-navy-100 border border-navy-100 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function Row({
  left,
  mid,
  right,
  note,
}: {
  left: string;
  mid: string;
  right: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5 bg-white">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-navy-950 truncate">{left}</p>
        <p className="text-[11px] text-navy-500 truncate">{mid}</p>
      </div>
      {note && <span className="text-[11px] font-mono text-navy-400 shrink-0">{note}</span>}
      <div className="shrink-0">{right}</div>
    </div>
  );
}
