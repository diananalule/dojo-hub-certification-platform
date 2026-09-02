'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowRight, TriangleAlert } from 'lucide-react';
import { api, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import DojoHubLogo from '@/components/DojoHubLogo';
import { PasswordInput } from '@/components/ui/PasswordInput';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, {
    message: 'Both passwords must match',
    path: ['confirm'],
  });
type FormValues = z.infer<typeof schema>;

// useSearchParams needs a Suspense boundary in this Next.js version.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token');
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await api.post('/auth/reset-password', { token, newPassword: values.newPassword });
      // The reset also signs out every existing session, so signing in is the next step
      // whether or not they were signed in somewhere already.
      router.replace('/login?reset=1');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  // A link pasted without its token cannot do anything, so say so rather than showing a
  // form that is guaranteed to fail on submit.
  if (!token) {
    return (
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.06] shadow-2xl shadow-black/40 p-8 z-10 text-center space-y-5 animate-scaleUp">
        <TriangleAlert className="w-12 h-12 mx-auto text-amber-500" />
        <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
          This link is incomplete
        </h1>
        <p className="text-sm text-navy-500">
          Open the reset link directly from your email rather than copying part of it. If it
          keeps failing, request a new one.
        </p>
        <Link href="/forgot-password" className="block">
          <Button className="w-full">Request a new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.06] shadow-2xl shadow-black/40 p-6 sm:p-8 z-10 text-left space-y-6 animate-scaleUp">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-crimson-500/50 to-transparent" />

      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="bg-white p-2.5 rounded-2xl shadow-md shadow-black/5 border border-black/[0.05] flex items-center justify-center">
            <DojoHubLogo size={72} />
          </div>
        </div>
        <h1 className="text-2xl sm:text-[1.75rem] font-extrabold text-navy-950 tracking-tight leading-tight text-balance">
          Choose a new password
        </h1>
        <p className="text-sm text-navy-500 max-w-xs mx-auto">
          Once saved, you&apos;ll be signed out everywhere and can sign in with it.
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-crimson-50 border border-crimson-200 text-crimson-700 rounded-xl text-sm font-medium animate-fadeIn space-y-2">
          <p>{error}</p>
          <Link href="/forgot-password" className="underline font-bold hover:text-crimson-900">
            Request a new link
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">
            New Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-navy-400 pointer-events-none">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <PasswordInput
              {...register('newPassword')}
              className="input input-icon bg-navy-50"
              placeholder="Minimum 8 characters"
            />
          </div>
          {errors.newPassword && (
            <p className="text-xs text-crimson-600">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">
            Confirm Password
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-navy-400 pointer-events-none">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <PasswordInput
              {...register('confirm')}
              className="input input-icon bg-navy-50"
              placeholder="Type it again"
            />
          </div>
          {errors.confirm && <p className="text-xs text-crimson-600">{errors.confirm.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full py-3.5 text-base">
          <span>Save new password</span>
          <ArrowRight className="w-[18px] h-[18px]" />
        </Button>
      </form>
    </div>
  );
}
