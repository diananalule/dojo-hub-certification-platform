'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LandingPage } from '@/components/landing/LandingPage';

const ROLE_HOME: Record<string, string> = {
  STUDENT: '/home',
  EVALUATOR: '/queue',
  ADMIN: '/metrics',
};

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Signed-in users have no use for the marketing page; send them to their work.
    if (!isLoading && user) router.replace(ROLE_HOME[user.role] ?? '/home');
  }, [user, isLoading, router]);

  return <LandingPage />;
}
