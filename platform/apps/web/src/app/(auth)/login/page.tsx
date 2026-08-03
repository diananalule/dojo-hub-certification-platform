'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import DojoHubLogo from '@/components/DojoHubLogo';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

const ROLE_HOME: Record<string, string> = { STUDENT: '/home', EVALUATOR: '/queue', ADMIN: '/metrics' };

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      const user = await login(values.email, values.password);
      router.replace(ROLE_HOME[user.role] ?? '/home');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl border border-black/[0.06] shadow-2xl shadow-black/40 p-6 sm:p-8 z-10 text-left space-y-6 animate-scaleUp">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-crimson-500/50 to-transparent" />
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="bg-white p-2.5 rounded-2xl shadow-md shadow-black/5 border border-black/[0.05] flex items-center justify-center">
            <DojoHubLogo size={72} />
          </div>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">Sign In to Dojo Hub</h2>
        <p className="text-sm text-navy-500 max-w-xs mx-auto">Enter your credentials to access your secure workspace</p>
      </div>

      {error && <div className="p-3.5 bg-crimson-50 border border-crimson-200 text-crimson-700 rounded-xl text-sm font-medium animate-fadeIn">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">Email Address</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
              <Mail className="w-[18px] h-[18px]" />
            </span>
            <input type="email" {...register('email')} className="input input-icon bg-navy-50" placeholder="e.g. alex.mercer@dojo.edu" />
          </div>
          {errors.email && <p className="text-xs text-crimson-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">Password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <input type="password" {...register('password')} className="input input-icon bg-navy-50" placeholder="••••••••" />
          </div>
          {errors.password && <p className="text-xs text-crimson-600">{errors.password.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full py-3.5 text-base">
          <span>Sign In</span>
          <ArrowRight className="w-[18px] h-[18px]" />
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-black/[0.06]">
        <Link href="/register" className="link-sweep text-sm font-semibold text-crimson-600 hover:text-crimson-700">
          Don&apos;t have an account? Sign Up
        </Link>
      </div>
    </div>
  );
}
