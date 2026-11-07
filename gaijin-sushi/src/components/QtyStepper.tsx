import { Minus, Plus } from 'lucide-react';
import { MAX_QTY } from '../store/cart';
import { useI18n } from '../i18n/useI18n';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function QtyStepper({ value, onChange, min = 0, size = 'md', className = '' }: Props) {
  const { t } = useI18n();
  const btn = size === 'md' ? 'h-11 w-11' : 'h-9 w-9';
  return (
    <div
      className={`inline-flex items-center rounded-full bg-surface p-1 ${className}`}
      role="group"
      aria-label={t('product.quantity')}
    >
      <button
        type="button"
        className={`${btn} inline-flex items-center justify-center rounded-full bg-bg text-ink shadow-sm transition active:scale-90 disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={t('product.decrease')}
      >
        <Minus size={size === 'md' ? 18 : 16} strokeWidth={2.5} />
      </button>
      <span className="min-w-9 select-none text-center text-base font-extrabold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={`${btn} inline-flex items-center justify-center rounded-full bg-brand text-white shadow-sm transition active:scale-90 disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label={t('product.increase')}
      >
        <Plus size={size === 'md' ? 18 : 16} strokeWidth={2.5} />
      </button>
    </div>
  );
}
