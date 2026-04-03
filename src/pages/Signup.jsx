import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import ConfigNotice from '../components/ConfigNotice';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isSupabaseConfigured, loading, supabaseConfigError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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

    if (password.length < 8) {
      setErrorMessage('Use a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      navigate(redirectTo, { replace: true });
      return;
    }

    setSuccessMessage('Account created. Check your email to confirm your account, then sign in.');
    setIsSubmitting(false);
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start logging mistakes to your own private workspace, with revision cards and progress tracking that stay tied to your email."
      footer={(
        <>
          Already have an account? <Link to="/login" className="font-medium text-cyan-300 hover:text-cyan-200">Sign in</Link>
        </>
      )}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white">Sign up</h2>
          <p className="text-sm text-slate-400">Email auth is enough for this app. Add social providers later if you need them.</p>
        </div>

        {!isSupabaseConfigured && (
          <ConfigNotice title="Supabase auth unavailable" message={supabaseConfigError} />
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
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
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="At least 8 characters"
            />
          </label>

          <label className="block space-y-2 text-sm text-slate-300">
            <span>Confirm password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
              placeholder="Repeat your password"
            />
          </label>

          <button
            type="submit"
            disabled={!isSupabaseConfigured || isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-4 py-3 font-medium text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />}
            <span>{isSubmitting ? 'Creating account...' : 'Create account'}</span>
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}
