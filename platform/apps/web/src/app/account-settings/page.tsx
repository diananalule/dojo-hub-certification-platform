'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AccountSettingsPage } from '@/components/account/AccountSettingsPage';

export default function AccountSettingsRoute() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-sm text-navy-400 font-mono animate-pulse">Loading secure workspace...</div>
      </div>
    );
  }

  return (
    <DashboardShell role={user.role}>
      <AccountSettingsPage />
    </DashboardShell>
  );
}
