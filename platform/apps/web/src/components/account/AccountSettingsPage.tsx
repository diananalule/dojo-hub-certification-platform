'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { KeyRound, ShieldCheck, User as UserIcon } from 'lucide-react';
import { UserRole } from '@dojo-hub/shared';
import { api, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '../ui/PasswordInput';
import { Badge } from '@/components/ui/Badge';

const ROLE_STATUS: Record<UserRole, string> = {
  STUDENT: 'Certification Candidate',
  EVALUATOR: 'Senior Certification Supervisor',
  ADMIN: 'Platform Superuser',
};

export function AccountSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState(user?.name ?? '');
  // Announcements default on; transactional email is always sent regardless.
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaved, setProfileSaved] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const updateProfile = useMutation({
    mutationFn: () => api.patch('/auth/me', { name: name.trim(), emailNotifications }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    },
    onError: (e) => setProfileError(e instanceof ApiError ? e.message : 'Failed to update profile.'),
  });

  const changePassword = useMutation({
    mutationFn: () => api.post('/auth/change-password', { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
    },
    onError: (e) => setPasswordError(e instanceof ApiError ? e.message : 'Failed to change password.'),
  });

  if (!user) return null;

  const initials = user.name.split(' ').map((n) => n[0]).join('');

  return (
    <div className="space-y-8 animate-fadeIn max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold text-navy-950">Account Settings</h1>
        <p className="text-sm text-navy-500 mt-1">Manage your profile identity and secure session credentials.</p>
      </div>

      <Card className="p-6 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-crimson-500/40 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-navy-950 to-navy-800 text-white flex items-center justify-center font-bold text-lg ring-2 ring-white shadow-sm shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-navy-950 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-navy-400" /> Profile
            </h3>
            <Badge tone="navy" className="mt-1.5">
              {ROLE_STATUS[user.role]}
            </Badge>
          </div>
        </div>

        {profileError && <p className="text-xs text-crimson-600">{profileError}</p>}
        {profileSaved && <p className="text-xs text-emerald-600 font-semibold">Profile updated successfully.</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1.5">Full Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1.5">Email Address</label>
            <input value={user.email} disabled className="input opacity-60 cursor-not-allowed" />
          </div>
        </div>

        <div className="border-t border-navy-100 pt-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-crimson-600 cursor-pointer"
            />
            <span>
              <span className="text-sm font-semibold text-navy-950 block">Email me about new courses</span>
              <span className="text-xs text-navy-500">
                Only for categories you are already studying. Emails about your own submissions,
                results and certificates are always sent.
              </span>
            </span>
          </label>
        </div>

        <Button
          size="sm"
          loading={updateProfile.isPending}
          disabled={!name.trim() || (name.trim() === user.name && emailNotifications === (user.emailNotifications ?? true))}
          onClick={() => {
            setProfileError(null);
            updateProfile.mutate();
          }}
        >
          Save Profile
        </Button>
      </Card>

      <Card className="p-6 space-y-5">
        <h3 className="font-bold text-navy-950 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-navy-400" /> Change Password
        </h3>

        {passwordError && <p className="text-xs text-crimson-600">{passwordError}</p>}
        {passwordSaved && (
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Password changed. Other active sessions have been signed out.
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1.5">Current Password</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              autoComplete="current-password"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1.5">New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                autoComplete="new-password"
              />
            </div>
            <div>
              <label className="text-[12px] font-mono uppercase tracking-wider font-bold text-navy-500 block mb-1.5">Confirm New Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                autoComplete="new-password"
              />
            </div>
          </div>
        </div>

        <Button
          size="sm"
          variant="dark"
          loading={changePassword.isPending}
          disabled={!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
          onClick={() => {
            setPasswordError(null);
            if (newPassword !== confirmPassword) {
              setPasswordError('New password and confirmation do not match.');
              return;
            }
            changePassword.mutate();
          }}
        >
          Update Password
        </Button>
      </Card>
    </div>
  );
}
