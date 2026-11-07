import { Plus } from 'lucide-react';
import ProductImage from './ProductImage';
import QtyStepper from './QtyStepper';
import { useCart } from '../store/cart';
import { useToast } from '../store/toast';
import { useI18n } from '../i18n/useI18n';
import type { Product } from '../data/menu';

interface Props {
  product: Product;
  onOpen: (product: Product) => void;
}

export default function ProductCard({ product, onOpen }: Props) {
  const { t, tr, money } = useI18n();
  const qty = useCart((s) => s.lines[product.id] ?? 0);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const showToast = useToast((s) => s.show);
  const name = tr(product.name);

  const handleAdd = () => {
    if (product.available === false) {
      showToast(t('product.unavailableToast'), 'warning');
      return;
    }
    add(product.id, 1);
    showToast(t('product.added', { name }));
  };

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(product)}
          aria-label={`${t('product.details')}: ${name}`}
          className="block aspect-square w-full overflow-hidden rounded-[1.75rem] bg-surface"
        >
          <ProductImage
            src={product.image}
            alt={name}
            className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          />
        </button>

        <div className="absolute bottom-3 right-3">
          {product.available === false ? (
            <button
              type="button"
              onClick={handleAdd}
              className="rounded-full bg-ink/85 px-3 py-2 text-xs font-extrabold text-bg shadow-lg backdrop-blur"
            >
              {t('product.unavailable')}
            </button>
          ) : qty === 0 ? (
            <button
              type="button"
              onClick={handleAdd}
              aria-label={`${t('product.add')}: ${name}`}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-neutral-800 shadow-lg backdrop-blur transition hover:bg-white active:scale-90"
            >
              <Plus size={26} strokeWidth={2} />
            </button>
          ) : (
            <QtyStepper
              size="sm"
              value={qty}
              onChange={(v) => setQty(product.id, v)}
              className="bg-white/90 shadow-lg backdrop-blur [&>span]:text-neutral-900 [&>button:first-child]:bg-neutral-100 [&>button:first-child]:text-neutral-900"
            />
          )}
        </div>
      </div>

      <button type="button" onClick={() => onOpen(product)} className="mt-3 text-left">
        <h3 className="line-clamp-2 text-[17px] font-extrabold leading-snug text-ink">{name}</h3>
        <p className="mt-1 text-sm font-medium tabular-nums text-mute">
          {money(product.price)}
          {product.available === false && <span className="ml-2 text-brand">{t('product.unavailable')}</span>}
        </p>
      </button>
    </article>
  );
}
