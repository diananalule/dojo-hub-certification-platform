'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, GraduationCap, ArrowRight, ChevronDown } from 'lucide-react';
import { UserRole } from '@dojo-hub/shared';
import { useAuth } from '@/lib/auth-context';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import DojoHubLogo from '@/components/DojoHubLogo';
import { PasswordInput } from '@/components/ui/PasswordInput';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum([UserRole.STUDENT, UserRole.EVALUATOR]),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: UserRole.STUDENT } });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await registerUser(values.name, values.email, values.password, values.role);
      // Account created but not signed in — send them to sign in explicitly.
      router.replace(`/login?registered=1&email=${encodeURIComponent(values.email)}`);
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
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">Create Dojo Account</h2>
        <p className="text-sm text-navy-500 max-w-xs mx-auto">Join the secure academy certification platform</p>
      </div>

      {error && <div className="p-3.5 bg-crimson-50 border border-crimson-200 text-crimson-700 rounded-xl text-sm font-medium animate-fadeIn">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">Full Name</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-navy-400 pointer-events-none">
              <User className="w-[18px] h-[18px]" />
            </span>
            <input type="text" {...register('name')} className="input input-icon bg-navy-50" placeholder="e.g. Diana Nalule" />
          </div>
          {errors.name && <p className="text-xs text-crimson-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">Email Address</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-navy-400 pointer-events-none">
              <Mail className="w-[18px] h-[18px]" />
            </span>
            <input type="email" {...register('email')} className="input input-icon bg-navy-50" placeholder="e.g. diana.nalule@dojo.edu" />
          </div>
          {errors.email && <p className="text-xs text-crimson-600">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">Workspace Role</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none z-10">
              <GraduationCap className="w-[18px] h-[18px]" />
            </span>
            <select {...register('role')} className="input input-icon input-icon-right bg-navy-50 font-medium appearance-none cursor-pointer">
              <option value={UserRole.STUDENT}>🎓 Student Candidate</option>
              <option value={UserRole.EVALUATOR}>🛡️ Supervisor / Evaluator</option>
            </select>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
              <ChevronDown className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs text-navy-400">Platform administrator accounts are provisioned separately and cannot self-register.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase tracking-wider font-bold text-navy-500 block">Password</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-navy-400 pointer-events-none">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <PasswordInput {...register('password')} className="input input-icon bg-navy-50" placeholder="Minimum 8 characters" />
          </div>
          {errors.password && <p className="text-xs text-crimson-600">{errors.password.message}</p>}
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full py-3.5 text-base">
          <span>Create Account</span>
          <ArrowRight className="w-[18px] h-[18px]" />
        </Button>
      </form>

      <div className="text-center pt-3 border-t border-black/[0.06]">
        <Link href="/login" className="link-sweep text-sm font-semibold text-crimson-600 hover:text-crimson-700">
          Already have an account? Sign In
        </Link>
      </div>
    </div>
  );
}
