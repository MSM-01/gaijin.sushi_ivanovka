import { useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';
import { useToast } from '../store/toast';

export default function Toast() {
  const { id, message, type, hide } = useToast();

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(hide, 2000);
    return () => window.clearTimeout(timer);
  }, [id, message, hide]);

  if (!message) return null;
  return (
    <div
      key={id}
      role="status"
      aria-live="polite"
      className="toast-in fixed bottom-28 left-1/2 z-[70] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-bg shadow-2xl print:hidden"
    >
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-white">
        {type === 'warning' ? <AlertCircle size={15} /> : <Check size={14} strokeWidth={3} />}
      </span>
      <span className="truncate">{message}</span>
    </div>
  );
}
