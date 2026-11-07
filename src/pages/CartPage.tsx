import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ReceiptText, ShoppingBag, Trash2 } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart, useCartSummary } from '../store/cart';
import { useI18n } from '../i18n/useI18n';

export default function CartPage() {
  const { t, money } = useI18n();
  const navigate = useNavigate();
  const { items, count, total } = useCartSummary();
  const clear = useCart((s) => s.clear);
  const createOrder = useCart((s) => s.createOrder);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-surface text-brand">
          <ShoppingBag size={44} />
        </div>
        <h1 className="font-display text-2xl">{t('cart.empty.title')}</h1>
        <p className="max-w-xs text-mute">{t('cart.empty.text')}</p>
        <Link to="/" className="btn-primary mt-2">
          {t('cart.toMenu')}
        </Link>
      </div>
    );
  }

  const handleClear = () => {
    if (window.confirm(t('cart.confirmClear'))) clear();
  };

  const handleCheckout = () => {
    const order = createOrder();
    if (order) navigate('/receipt');
  };

  return (
    <div className="px-4 py-5 sm:px-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl">{t('cart.title')}</h1>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-mute transition hover:bg-surface hover:text-brand"
        >
          <Trash2 size={17} />
          {t('cart.clear')}
        </button>
      </div>

      <div className="md:grid md:grid-cols-[1fr_22rem] md:items-start md:gap-6">
        <ul className="space-y-3">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </ul>

        <section className="sticky bottom-3 z-20 mt-5 rounded-3xl border border-line bg-bg p-5 shadow-2xl md:top-24 md:bottom-auto md:mt-0">
          <dl className="space-y-2">
            <div className="flex justify-between text-mute">
              <dt>{t('cart.positions')}</dt>
              <dd className="font-bold tabular-nums">
                {count} {t('cart.pcs')}
              </dd>
            </div>
            <div className="flex items-end justify-between">
              <dt className="text-lg font-bold">{t('cart.total')}</dt>
              <dd className="text-3xl font-extrabold tabular-nums">{money(total)}</dd>
            </div>
          </dl>

          <button type="button" onClick={handleCheckout} className="btn-primary mt-4 min-h-14 w-full text-lg">
            <ReceiptText size={22} />
            {t('cart.checkout')}
          </button>
          <p className="mt-3 text-center text-xs leading-relaxed text-mute">{t('cart.checkoutHint')}</p>
          <Link to="/" className="btn-secondary mt-3 w-full">
            <ArrowLeft size={18} />
            {t('cart.continue')}
          </Link>
        </section>
      </div>
    </div>
  );
}
