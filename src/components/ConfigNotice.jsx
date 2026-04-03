import { AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ConfigNotice({ title, message, className }) {
  return (
    <div className={cn('rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-50', className)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-amber-500/20 p-2 text-amber-300">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-amber-200">{title}</h2>
          <p className="text-sm text-amber-100/90">{message}</p>
        </div>
      </div>
    </div>
  );
}