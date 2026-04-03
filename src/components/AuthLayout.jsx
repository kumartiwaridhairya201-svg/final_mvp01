import { Link } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';
import { cn } from '../lib/utils';

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-5xl items-center justify-center overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.14),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.95),_rgba(3,7,18,1))]" />
      <div className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-[0_30px_80px_rgba(2,8,23,0.6)] backdrop-blur md:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col justify-between gap-8 border-b border-white/10 p-6 sm:p-8 md:border-b-0 md:border-r lg:p-10">
          <div className="space-y-6">
            <Link to="/" className="inline-flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-cyan-200 uppercase">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-300">
                <BrainCircuit className="h-5 w-5" />
              </span>
              Mistake Ledger
            </Link>
            <div className="space-y-3">
              <h1 className="max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</h1>
              <p className="max-w-lg text-sm leading-6 text-slate-300 sm:text-base">{subtitle}</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              'Keep every mistake tied to one account.',
              'Revise weak concepts on your phone between classes.',
              'Track subject trends without sharing data across users.',
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-8 lg:p-10">
          <div className={cn('rounded-[1.75rem] border border-white/10 bg-slate-900/90 p-5 shadow-2xl shadow-slate-950/50 sm:p-8')}>
            {children}
            {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
