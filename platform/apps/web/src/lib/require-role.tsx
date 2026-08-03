'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@dojo-hub/shared';
import { useAuth } from './auth-context';

const ROLE_HOME: Record<UserRole, string> = {
  STUDENT: '/home',
  EVALUATOR: '/queue',
  ADMIN: '/metrics',
};

export function RequireRole({ role, children }: { role: UserRole; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role !== role) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [user, isLoading, role, router]);

  if (isLoading || !user || user.role !== role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-navy-50">
        <div className="text-sm text-navy-400 font-mono animate-pulse">Loading secure workspace...</div>
      </div>
    );
  }

  return <>{children}</>;
}
