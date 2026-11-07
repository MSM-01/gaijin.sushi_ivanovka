import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import ProductImage from './ProductImage';
import QtyStepper from './QtyStepper';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';
import { useI18n } from '../i18n/useI18n';
import type { Product } from '../data/menu';

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductDetails({ product, onClose }: Props) {
  const { t, tr, money } = useI18n();
  const [qty, setQty] = useState(1);
  const inCart = useCart((s) => s.lines[product.id] ?? 0);
  const add = useCart((s) => s.add);
  const showToast = useToast((s) => s.show);
  const name = tr(product.name);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const handleAdd = () => {
    if (product.available === false) {
      showToast(t('product.unavailableToast'), 'warning');
      return;
    }
    add(product.id, qty);
    showToast(t('product.added', { name }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={name}>
      <div className="fade-in absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="sheet-up relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-bg shadow-2xl sm:rounded-[2rem]">
        <button
          type="button"
          onClick={onClose}
          aria-label={t('nav.close')}
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-neutral-900 shadow backdrop-blur"
        >
          <X size={22} />
        </button>

        <div className="overflow-y-auto">
          <ProductImage src={product.image} alt={name} eager className="aspect-square w-full" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="font-display text-xl leading-tight">{name}</h2>
              <p className="shrink-0 text-xl font-extrabold tabular-nums text-brand">{money(product.price)}</p>
            </div>
            <p className="mt-3 leading-relaxed text-mute">{tr(product.description)}</p>
            {product.available === false && (
              <p className="mt-3 rounded-xl bg-brand/10 px-3 py-2 text-sm font-bold text-brand">
                {t('product.unavailable')}
              </p>
            )}
            {inCart > 0 && (
              <p className="mt-3 text-sm font-semibold text-brand">
                {t('product.inCart')}: {inCart} {t('cart.pcs')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line bg-bg p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <QtyStepper value={qty} min={1} onChange={setQty} />
          <button type="button" className="btn-primary flex-1" onClick={handleAdd}>
            {product.available === false ? t('product.unavailable') : t('product.addFor', { sum: money(product.price * qty) })}
          </button>
        </div>
      </div>
    </div>
  );
}
