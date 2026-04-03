import { Link, NavLink, useLocation } from 'react-router-dom';
import { Home, Upload, RefreshCw, BarChart2, LogOut, BrainCircuit } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/useAuth';

export default function Navigation() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthRoute) {
    return null;
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Feed' },
    { to: '/upload', icon: Upload, label: 'Add Mistake' },
    { to: '/revision', icon: RefreshCw, label: 'Revise' },
    { to: '/dashboard', icon: BarChart2, label: 'Stats' },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur md:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
              <BrainCircuit className="h-4 w-4" />
            </span>
            Tracker
          </Link>

          {user && (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          )}
        </div>

      </header>

      <header className="fixed inset-x-0 top-0 z-40 hidden border-b border-white/10 bg-slate-950/80 backdrop-blur md:block">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link to="/" className="inline-flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <BrainCircuit className="h-5 w-5" />
              </span>
              Mistake Ledger
            </Link>

            <div className="flex items-center gap-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-cyan-500/15 text-cyan-300'
                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Signed in</p>
              <p className="max-w-[220px] truncate text-sm text-slate-200">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/90 px-2 py-2 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-6xl grid-cols-4 gap-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium transition-colors',
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
