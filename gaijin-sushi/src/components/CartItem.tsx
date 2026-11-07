import { Trash2 } from 'lucide-react';
import ProductImage from './ProductImage';
import QtyStepper from './QtyStepper';
import { useCart } from '../store/cart';
import { useI18n } from '../i18n/useI18n';
import type { CartItemData } from '../store/cart';

export default function CartItem({ item }: { item: CartItemData }) {
  const { t, tr, money } = useI18n();
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const { product, qty, sum } = item;
  const name = tr(product.name);

  return (
    <li className="flex gap-3 rounded-3xl bg-surface p-3">
      <ProductImage src={product.image} alt={name} className="h-24 w-24 shrink-0 rounded-2xl sm:h-28 sm:w-28" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 font-bold leading-snug">{name}</h3>
            <p className="mt-0.5 text-sm text-mute">
              {money(product.price)} {t('cart.each')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => remove(product.id)}
            aria-label={`${t('cart.remove')}: ${name}`}
            className="-mr-1 -mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-mute transition hover:bg-line hover:text-brand"
          >
            <Trash2 size={19} />
          </button>
        </div>
        <div className="flex items-center justify-between gap-2">
          <QtyStepper size="sm" min={0} value={qty} onChange={(v) => setQty(product.id, v)} />
          <p className="text-lg font-extrabold tabular-nums">{money(sum)}</p>
        </div>
      </div>
    </li>
  );
}
