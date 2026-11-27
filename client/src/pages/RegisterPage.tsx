import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Building2, Loader2, Lock, Mail, User, UserPlus } from 'lucide-react';
import AuthSplitShell from '../components/AuthSplitShell';
import GoogleSignInButton from '../components/GoogleSignInButton';
import SeoHead from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { loginWithGoogle, registerWithEmail, oauthLoading, appwriteReady, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (name.trim().length < 2) {
      setLocalError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[\w.+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim())) {
      setLocalError('Please provide a valid email address.');
      return;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    const res = await registerWithEmail(name, email, password, company);
    setSubmitting(false);

    if (res.ok) {
      navigate('/dashboard', { replace: true });
    } else {
      setLocalError(res.error || 'Could not create account.');
    }
  };

  const activeError = localError || error;

  return (
    <>
      <SeoHead
        title="Create Account — DEVNEXUS TECH"
        description="Register a DEVNEXUS TECH client workspace using Google OAuth 2.0 or email and password."
      />
      <AuthSplitShell
        headline="Launch Your Digital Workspace."
        subheadline="Create a verified client account to submit project requirements, track milestones, and collaborate with DEVNEXUS TECH."
      >
        <div className="architectural-card rounded-3xl p-7 sm:p-8 space-y-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Create Your Account</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sign up quickly with Google or register via work email.
            </p>
          </div>

          {!appwriteReady && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>Appwrite Configuration Pending:</strong> Configure <code>VITE_APPWRITE_ENDPOINT</code> and{' '}
              <code>VITE_APPWRITE_PROJECT_ID</code> to enable live registration & Google OAuth.
            </div>
          )}

          {activeError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{activeError}</span>
            </div>
          )}

          <GoogleSignInButton
            onClick={() => void loginWithGoogle()}
            loading={oauthLoading}
            label="Continue with Google"
          />

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="shrink mx-3 text-[11px] font-mono uppercase text-slate-400">or create with email</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">Company</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Optional"
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">
                  Password (8+ chars) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl pl-9 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 text-white dark:text-navy-950 shadow-glow-sm hover:opacity-95 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-sky-600 dark:text-electric-400 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </AuthSplitShell>
    </>
  );
}
