'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { jsPDF } from 'jspdf';
import { Users, ShieldAlert, Award, Download } from 'lucide-react';
import { PlatformMetricsDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonTile } from '@/components/ui/Skeleton';

interface UsageReportData {
  metrics: PlatformMetricsDto;
  auditLogCount: number;
  candidates: { name: string; email: string; level: string; status: string; joinedAt: string }[];
}

export default function AdminMetricsPage() {
  const { data: metrics, isLoading } = useQuery<PlatformMetricsDto>({
    queryKey: ['reports', 'platform-metrics'],
    queryFn: () => api.get<PlatformMetricsDto>('/reports/platform-metrics'),
  });

  const generateReport = useMutation({
    mutationFn: () => api.get<UsageReportData>('/reports/usage-report'),
    onSuccess: (data) => {
      const doc = new jsPDF();
      doc.setFillColor(30, 37, 51);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text('Dojo Hub Learning Platform — Usage Report', 14, 18);
      doc.setFontSize(9);
      doc.text(new Date().toLocaleDateString(), 14, 25);

      doc.setTextColor(20, 20, 20);
      doc.setFontSize(11);
      let y = 42;
      const lines = [
        `Total students: ${data.metrics.totalStudents}`,
        `Total evaluators: ${data.metrics.totalEvaluators}`,
        `Suspended accounts: ${data.metrics.suspendedAccounts}`,
        `Pending submissions: ${data.metrics.pendingSubmissions}`,
        `Certificates awarded: ${data.metrics.certificatesAwarded}`,
        `Platform completion rate: ${data.metrics.platformCompletionRate}%`,
        `Total audit log entries: ${data.auditLogCount}`,
      ];
      lines.forEach((line) => {
        doc.text(line, 14, y);
        y += 7;
      });

      y += 6;
      doc.setFontSize(12);
      doc.text('Candidate Directory', 14, y);
      y += 8;
      doc.setFontSize(8);
      data.candidates.forEach((c) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }
        doc.text(`${c.name}  |  ${c.email}  |  ${c.level}  |  ${c.status}`, 14, y);
        y += 6;
      });

      doc.save('DojoHub_Platform_Usage_Report.pdf');
    },
  });

  if (isLoading || !metrics) {
    return (
      <div className="space-y-8 animate-fadeIn">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonTile key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatTile label="Students vs Supervisors" value={`${metrics.totalStudents} vs ${metrics.totalEvaluators}`} icon={Users} sublabel={`${metrics.totalStudents + metrics.totalEvaluators + metrics.totalAdmins} total registered users`} />
        <StatTile label="Pending Grading Tasks" value={metrics.pendingSubmissions} icon={ShieldAlert} tone={metrics.pendingSubmissions > 0 ? 'amber' : 'default'} sublabel="Awaiting evaluator review" />
        <StatTile label="Certificates Awarded" value={metrics.certificatesAwarded} icon={Award} sublabel={`${metrics.certificatesPending} capstones pending`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-navy-950 mb-4">Course-Specific Analytics</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            {metrics.perTrack.map((t) => (
              <div key={t.trackId} className="border border-navy-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-sm text-navy-950">{t.trackTitle}</p>
                  <span className="text-[12px] font-mono uppercase text-navy-400">{t.category}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Enrollments" value={t.enrollments} />
                  <Stat label="Active" value={t.activeLearners} />
                  <Stat label="Completion" value={`${t.completionRate}%`} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-bold text-navy-950">Platform-Wide Certification Metrics</h3>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Completion Rate" value={`${metrics.platformCompletionRate}%`} big />
            <Stat label="Awarded" value={metrics.certificatesAwarded} big />
            <Stat label="Pending" value={metrics.certificatesPending} big />
          </div>
          <div className="pt-4 border-t border-navy-100 space-y-2">
            <p className="text-[12px] font-mono uppercase text-navy-400">Governance Shortcuts</p>
            <Button variant="dark" className="w-full" loading={generateReport.isPending} onClick={() => generateReport.mutate()}>
              <Download className="w-4 h-4" /> Generate Progress &amp; Usage Report (PDF)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string | number; big?: boolean }) {
  return (
    <div className="bg-navy-50 rounded-lg p-2.5 text-center">
      <p className="text-[12px] uppercase text-navy-400 font-mono">{label}</p>
      <p className={big ? 'text-lg font-extrabold text-navy-950' : 'text-sm font-bold text-navy-950'}>{value}</p>
    </div>
  );
}
