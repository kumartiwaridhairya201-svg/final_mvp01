import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import ConfigNotice from './ConfigNotice';

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated, isSupabaseConfigured, loading, supabaseConfigError } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto max-w-2xl py-10 sm:py-16">
        <ConfigNotice
          title="Supabase not configured"
          message={supabaseConfigError}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-sm text-slate-400">Checking your session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export function AuthOnlyMessage() {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-center shadow-2xl shadow-cyan-950/30 backdrop-blur">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
        <Lock className="h-6 w-6" />
      </div>
      <h2 className="text-xl font-semibold text-white">Sign in to continue</h2>
      <p className="mt-2 text-sm text-slate-400">Your mistake feed, revision queue, and dashboard are private to your account.</p>
    </div>
  );
}
