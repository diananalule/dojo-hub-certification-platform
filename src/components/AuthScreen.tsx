import React, { useState } from 'react';
import { UserRole } from '../types';
import { Mail, Lock, User, ShieldCheck, GraduationCap, Sparkles, ArrowRight } from 'lucide-react';
import DojoHubLogo from './DojoHubLogo';

interface AuthScreenProps {
  onAuthSuccess: (user: { name: string; email: string; role: UserRole }) => void;
  onRegisterUser: (user: { name: string; email: string; role: UserRole }) => void;
  existingAccounts: { name: string; email: string; role: string }[];
}

export default function AuthScreen({ onAuthSuccess, onRegisterUser, existingAccounts }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password || (isSignUp && !name.trim())) {
      setError('Please fill in all required fields.');
      return;
    }

    if (isSignUp) {
      // Check if user already exists
      const exists = existingAccounts.some(acc => acc.email.toLowerCase() === normalizedEmail);
      if (exists || normalizedEmail === 'sarah.chen@dojo.edu') {
        setError('An account with this email address already exists.');
        return;
      }

      // Register account (adds to userAccounts in App.tsx)
      onRegisterUser({ name: name.trim(), email: normalizedEmail, role });
      
      // Clean up fields and redirect to Login mode
      setIsSignUp(false);
      setPassword('');
      setSuccessMessage(`Account created successfully for ${name.trim()}! Please sign in using your credentials.`);
      setError(null);
    } else {
      // Check matched user
      let matchedUser = existingAccounts.find(
        (acc) => acc.email.toLowerCase() === normalizedEmail
      );

      // Special fallback for default Sarah Chen admin account
      if (!matchedUser && normalizedEmail === 'sarah.chen@dojo.edu') {
        matchedUser = { name: 'Sarah Chen', email: 'sarah.chen@dojo.edu', role: 'admin' };
      }

      if (matchedUser) {
        const matchedRole = (matchedUser.role === 'evaluator' ? 'evaluator' : matchedUser.role === 'admin' ? 'admin' : 'student') as UserRole;
        onAuthSuccess({
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedRole,
        });
      } else {
        setError('Incorrect email or account not found. Please sign up to create a new account.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden" id="auth-screen-container">
      {/* Dynamic background visual accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-crimson-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card - Designed to fit extremely well on all screen sizes */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200/80 shadow-2xl p-6 sm:p-8 z-10 text-left space-y-6 animate-scaleUp" id="auth-card">
        {/* Header section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center" id="auth-logo-container">
            <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-gray-150 flex items-center justify-center" id="auth-logo-wrapper">
              <DojoHubLogo size={72} />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-extrabold text-navy-950 tracking-tight">
            {isSignUp ? 'Create Dojo Account' : 'Sign In to Dojo Hub'}
          </h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            {isSignUp ? 'Join the secure academy certification platform' : 'Enter your credentials to access your secure workspace'}
          </p>
        </div>

        {/* Dynamic State Feedback Banners */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-sans font-medium">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-sans font-medium">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Input (Sign Up Mode Only) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-500 block">Full Name</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-sans text-navy-950 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:bg-white transition-all"
                  placeholder="e.g. Diana Nalule"
                />
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-500 block">Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-sans text-navy-950 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:bg-white transition-all"
                placeholder="e.g. diana.nalule@dojo.edu"
              />
            </div>
          </div>

          {/* Role Dropdown Selection */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-500 block">Workspace Role</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                {role === 'student' && <GraduationCap className="w-4 h-4 text-yellow-500" />}
                {role === 'admin' && <ShieldCheck className="w-4 h-4 text-red-500" />}
                {role === 'evaluator' && <Sparkles className="w-4 h-4 text-indigo-500" />}
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-sans text-navy-950 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:bg-white font-medium appearance-none transition-all cursor-pointer"
              >
                <option value="student">🎓 Student Candidate</option>
                <option value="evaluator">🛡️ Supervisor / Evaluator</option>
                <option value="admin">⚙️ Platform Administrator</option>
              </select>
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-500 block">Password</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-sans text-navy-950 focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3 bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold text-xs rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle between login and register */}
        <div className="text-center pt-2 border-t border-gray-100">
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
              setSuccessMessage(null);
            }}
            className="text-xs font-sans font-semibold text-crimson-600 hover:text-crimson-700 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
