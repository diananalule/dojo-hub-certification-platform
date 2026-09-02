'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight, MailCheck } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import DojoHubLogo from '@/components/DojoHubLogo';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    // The endpoint reports success whether or not the address has an account, so there is
    // no failure case to show here — treating a transport error as sent too keeps this
    // from becoming a way to discover which addresses are registered.
    try {
      await api.post('/auth/forgot-password', { email: values.email });
    } catch {
      /* deliberately ignored — see above */
    }
    setSent(values.email);
  };

  if (sent) {
    return (
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.06] shadow-2xl shadow-black/40 p-6 sm:p-8 z-10 text-center space-y-5 animate-scaleUp">
        <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-crimson-500/50 to-transparent" />
        <MailCheck className="w-12 h-12 mx-auto text-green-600" />
        <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">Check your email</h1>
        <p className="text-sm text-navy-500">
          If <span className="font-semibold text-navy-700">{sent}</span> has an account, a link
          to choose a new password is on its way. It works once and expires in an hour.
        </p>
        <p className="text-xs text-navy-400">
          Nothing arrived? Check your spam folder, or try again in a few minutes.
        </p>
        <Link href="/login" className="block pt-1">
          <Button variant="outline" className="w-full">
            Back to sign in
          </Button>
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
          Forgot your password?
        </h1>
        <p className="text-sm text-navy-500 max-w-xs mx-auto">
          Enter the email address on your account and we&apos;ll send you a link to choose a
          new one.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">
            Email Address
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-navy-400 pointer-events-none">
              <Mail className="w-[18px] h-[18px]" />
            </span>
            <input
              type="email"
              autoFocus
              {...register('email')}
              className="input input-icon bg-navy-50"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="text-xs text-crimson-600">{errors.email.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full py-3.5 text-base">
          <span>Send reset link</span>
          <ArrowRight className="w-[18px] h-[18px]" />
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-black/[0.06]">
        <Link
          href="/login"
          className="link-sweep text-sm font-semibold text-crimson-600 hover:text-crimson-700"
        >
          Remembered it? Sign In
        </Link>
      </div>
    </div>
  );
}
