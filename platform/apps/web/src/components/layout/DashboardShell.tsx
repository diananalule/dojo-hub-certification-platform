'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserRole, SubmissionDto, CredentialDto } from '@dojo-hub/shared';
import { api } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';

const TITLES: Record<UserRole, { title: string; subtitle: string }> = {
  STUDENT: { title: 'Student Learning Center', subtitle: 'Dojo Hub Certifications • Secure Client Terminal' },
  ADMIN: { title: 'Platform Governance Panel', subtitle: 'Dojo Hub Certifications • Secure Client Terminal' },
  EVALUATOR: { title: 'Supervisor & Grading Sandbox', subtitle: 'Dojo Hub Certifications • Secure Client Terminal' },
};

export function DashboardShell({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const { data: pendingQueue = [] } = useQuery<SubmissionDto[]>({
    queryKey: ['submissions', 'queue', 'PENDING'],
    queryFn: () => api.get<SubmissionDto[]>('/submissions/queue?status=PENDING'),
    enabled: role === 'EVALUATOR' && !!user,
    refetchInterval: 30_000,
  });

  const { data: credentials = [] } = useQuery<CredentialDto[]>({
    queryKey: ['credentials', 'me'],
    queryFn: () => api.get<CredentialDto[]>('/credentials/me'),
    enabled: role === 'STUDENT' && !!user,
  });

  const { title, subtitle } = TITLES[role];

  return (
    <div className="min-h-screen bg-navy-50 flex">
      <Sidebar
        role={role}
        pendingCount={pendingQueue.length}
        credentialsCount={credentials.length}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen min-w-0">
        <TopNavbar title={title} subtitle={subtitle} onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0">{children}</main>
      </div>
    </div>
  );
}
