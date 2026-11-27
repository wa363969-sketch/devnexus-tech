import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, LogIn, Mail, Lock } from 'lucide-react';
import AuthSplitShell from '../components/AuthSplitShell';
import GoogleSignInButton from '../components/GoogleSignInButton';
import SeoHead from '../components/SeoHead';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const {
    loginWithGoogle,
    loginWithEmail,
    requestPasswordReset,
    oauthLoading,
    appwriteReady,
    error,
    clearError,
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [forgotMode, setForgotMode] = useState(false);
  const [resetFeedback, setResetFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    clearError();
    const errParam = searchParams.get('error');
    if (errParam === 'oauth_cancelled') {
      setLocalError('Google Sign-In was cancelled or rejected. Please try again when ready.');
    }
  }, [clearError, searchParams]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }
    setSubmitting(true);
    const res = await loginWithEmail(email, password);
    setSubmitting(false);

    if (res.ok) {
      const from = (location.state as { from?: string } | null)?.from;
      navigate(from || (res.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } else {
      setLocalError(res.error || 'Sign in failed.');
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setResetFeedback({ ok: false, text: 'Enter your registered email address first.' });
      return;
    }
    setSubmitting(true);
    const res = await requestPasswordReset(email);
    setSubmitting(false);
    setResetFeedback({ ok: res.ok, text: res.message });
  };

  const activeError = localError || error;

  return (
    <>
      <SeoHead
        title="Sign In — DEVNEXUS TECH Client Portal"
        description="Sign in securely to DEVNEXUS TECH using Google OAuth 2.0 or email and password via Appwrite Authentication."
      />
      <AuthSplitShell
        headline="Welcome Back to DEVNEXUS TECH."
        subheadline="Access your project workspace, review inquiries, inspect milestones, and collaborate with our engineering team."
      >
        <div className="architectural-card rounded-3xl p-7 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              {forgotMode ? 'Reset Your Password' : 'Sign In to Your Account'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {forgotMode
                ? 'Receive a secure Appwrite recovery link via email.'
                : 'Authenticate via official Google OAuth or email credentials.'}
            </p>
          </div>

          {!appwriteReady && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-800 dark:text-amber-200 leading-relaxed">
              <strong>Appwrite Configuration Pending:</strong> Set <code>VITE_APPWRITE_ENDPOINT</code> and{' '}
              <code>VITE_APPWRITE_PROJECT_ID</code> in <code>client/.env</code> and configure Google OAuth in Appwrite
              Console to activate real sign-in.
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

          {resetFeedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                resetFeedback.ok
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-200'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-200'
              }`}
            >
              {resetFeedback.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <span>{resetFeedback.text}</span>
            </div>
          )}

          {!forgotMode ? (
            <>
              <GoogleSignInButton
                onClick={() => void loginWithGoogle()}
                loading={oauthLoading}
                label="Continue with Google"
              />

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                <span className="shrink mx-3 text-[11px] font-mono uppercase text-slate-400">or email sign in</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-mono text-slate-600 dark:text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode(true);
                        setLocalError(null);
                      }}
                      className="text-xs text-sky-600 dark:text-electric-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl pl-10 pr-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-sky-600 to-blue-600 dark:from-electric-400 dark:to-electric-500 text-white dark:text-navy-950 shadow-glow-sm hover:opacity-95 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                  <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300 mb-1.5">
                  Account Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer"
              >
                {submitting ? 'Sending Recovery Link...' : 'Send Reset Link'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false);
                  setResetFeedback(null);
                }}
                className="w-full text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-600 dark:text-slate-400">
            New to DEVNEXUS TECH?{' '}
            <Link to="/register" className="font-semibold text-sky-600 dark:text-electric-400 hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </AuthSplitShell>
    </>
  );
}
