import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ConfigNotice from '../components/ConfigNotice';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isSupabaseConfigured, loading, supabaseConfigError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = location.state?.from || '/';

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage(supabaseConfigError);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    navigate(redirectTo, { replace: true });
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your NEET mistake tracker so your feed, revision queue, and stats stay synced across devices."
      footer={(
        <>
          New here? <Link to="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">Create an account</Link>
        </>
      )}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Login</h2>
          <p className="text-sm text-slate-400">Use your email and password to access your private dashboard.</p>
        </div>

        {!isSupabaseConfigured && (
          <ConfigNotice title="Supabase auth unavailable" message={supabaseConfigError} />
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block space-y-2 text-sm text-slate-300">
            <span>Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="you@example.com"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="Enter your password"
            />
          </label>

          <button
            type="submit"
            disabled={!isSupabaseConfigured || isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
            <span>{isSubmitting ? 'Signing in...' : 'Sign in'}</span>
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
