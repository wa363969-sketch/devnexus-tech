import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-sky-600 dark:text-electric-400" />
        <p className="text-xs font-mono">Verifying authenticated session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}

export function GuestOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
        <Loader2 className="w-7 h-7 animate-spin text-sky-600 dark:text-electric-400" />
        <p className="text-xs font-mono">Checking session status...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.isAdmin ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
