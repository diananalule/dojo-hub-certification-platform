'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmail />
    </Suspense>
  );
}

function VerifyEmail() {
  const token = useSearchParams().get('token');
  const [state, setState] = useState<'working' | 'done' | 'failed'>('working');
  const [message, setMessage] = useState('');
  // React runs effects twice in development; a single-use token must only be spent once.
  const attempted = useRef(false);

  useEffect(() => {
    if (attempted.current) return;
    attempted.current = true;

    if (!token) {
      setState('failed');
      setMessage('This link is missing its confirmation code. Please use the link from your email.');
      return;
    }

    api
      .post('/auth/verify-email', { token })
      .then(() => setState('done'))
      .catch((e) => {
        setState('failed');
        setMessage(e instanceof ApiError ? e.message : 'We could not confirm this link. Please try again.');
      });
  }, [token]);

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.06] shadow-2xl shadow-black/40 p-8 z-10 text-center space-y-5 animate-scaleUp">
      {state === 'working' && (
        <>
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-navy-200 border-t-crimson-600 animate-spin" />
          <h2 className="text-xl font-extrabold text-navy-950">Confirming your email…</h2>
        </>
      )}

      {state === 'done' && (
        <>
          <CheckCircle2 className="w-12 h-12 mx-auto text-green-600" />
          <h2 className="text-2xl font-extrabold text-navy-950 tracking-tight">Email confirmed</h2>
          <p className="text-sm text-navy-500">Your account is active. You can sign in now.</p>
          <Link href="/login" className="block">
            <Button className="w-full">Sign in</Button>
          </Link>
        </>
      )}

      {state === 'failed' && (
        <>
          <XCircle className="w-12 h-12 mx-auto text-crimson-600" />
          <h2 className="text-2xl font-extrabold text-navy-950 tracking-tight">We couldn&apos;t confirm this link</h2>
          <p className="text-sm text-navy-500">{message}</p>
          <p className="text-xs text-navy-400">
            Confirmation links can only be used once. If you have already confirmed, just sign in.
          </p>
          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Go to sign in
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}
