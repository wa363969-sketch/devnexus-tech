import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SeoHead from '../components/SeoHead';

export function AuthCallbackPage() {
  const { handleOAuthCallback } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing Google OAuth authentication via Appwrite...');

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam) {
      setStatus('error');
      setMessage(`Google sign-in returned an error: ${errParam}`);
      return;
    }

    let cancelled = false;
    void (async () => {
      const res = await handleOAuthCallback();
      if (cancelled) return;
      if (res.ok && res.user) {
        setStatus('success');
        setMessage(`Authenticated as ${res.user.name}. Redirecting to your workspace...`);
        window.setTimeout(() => {
          navigate(res.user?.isAdmin ? '/admin' : '/dashboard', { replace: true });
        }, 650);
      } else {
        setStatus('error');
        setMessage(res.error || 'Could not establish authenticated Appwrite session.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleOAuthCallback, navigate, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SeoHead title="Authenticating — DEVNEXUS TECH" description="Completing OAuth 2.0 session verification." />
      <div className="architectural-card rounded-3xl p-8 max-w-md w-full text-center space-y-4">
        {status === 'loading' && <Loader2 className="w-10 h-10 animate-spin text-sky-600 dark:text-electric-400 mx-auto" />}
        {status === 'success' && <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />}
        {status === 'error' && <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />}
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
          {status === 'loading'
            ? 'Verifying Google Session'
            : status === 'success'
            ? 'Sign-In Verified'
            : 'Authentication Incomplete'}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{message}</p>
        {status === 'error' && (
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950"
            >
              Return to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function EmailVerifyPage() {
  const { completeVerification } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const userId = searchParams.get('userId') || '';
    const secret = searchParams.get('secret') || '';
    if (!userId || !secret) {
      setStatus('error');
      setMessage('Missing verification parameters in URL.');
      return;
    }
    void completeVerification(userId, secret).then((res) => {
      setStatus(res.ok ? 'success' : 'error');
      setMessage(res.message);
    });
  }, [completeVerification, searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SeoHead title="Email Verification — DEVNEXUS TECH" description="Confirming account email ownership." />
      <div className="architectural-card rounded-3xl p-8 max-w-md w-full text-center space-y-4">
        {status === 'loading' && <Loader2 className="w-10 h-10 animate-spin text-sky-600 mx-auto" />}
        {status === 'success' && <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />}
        {status === 'error' && <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />}
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Email Verification</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        <Link
          to="/dashboard"
          className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const { completePasswordReset } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const userId = searchParams.get('userId') || '';
  const secret = searchParams.get('secret') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !secret) {
      setFeedback({ ok: false, text: 'Invalid or missing password reset token in URL.' });
      return;
    }
    if (password.length < 8 || password !== confirm) {
      setFeedback({ ok: false, text: 'Passwords must match and be at least 8 characters long.' });
      return;
    }
    setLoading(true);
    const res = await completePasswordReset(userId, secret, password);
    setLoading(false);
    setFeedback({ ok: res.ok, text: res.message });
    if (res.ok) {
      window.setTimeout(() => navigate('/login'), 1500);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <SeoHead title="Set New Password — DEVNEXUS TECH" description="Complete password recovery." />
      <form onSubmit={handleSubmit} className="architectural-card rounded-3xl p-8 max-w-md w-full space-y-4">
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Choose a New Password</h1>
        {feedback && (
          <div
            className={`p-3 rounded-xl text-xs border ${
              feedback.ok
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-200'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-200'
            }`}
          >
            {feedback.text}
          </div>
        )}
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password (min 8 chars)"
          className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
        />
        <input
          type="password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
          className="w-full rounded-xl px-4 py-3 text-sm bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-semibold text-sm bg-sky-600 dark:bg-electric-500 text-white dark:text-navy-950 cursor-pointer"
        >
          {loading ? 'Updating Password...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
