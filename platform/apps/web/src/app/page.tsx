'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

const ROLE_HOME: Record<string, string> = {
  STUDENT: '/home',
  EVALUATOR: '/queue',
  ADMIN: '/metrics',
};

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? (ROLE_HOME[user.role] ?? '/login') : '/login');
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-950">
      <div className="text-sm text-navy-400 font-mono animate-pulse">Loading Dojo Hub...</div>
    </div>
  );
}
