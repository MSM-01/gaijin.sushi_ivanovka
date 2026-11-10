import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart, useCartSummary } from '../store/cart';
import { useI18n } from '../i18n/useI18n';
import { whatsappNumber as getWhatsappNumber, whatsappUrl } from '../lib/whatsapp';

export default function CartPage() {
  const { t, money } = useI18n();
  const navigate = useNavigate();
  const { items, count, total } = useCartSummary();
  const clear = useCart((s) => s.clear);
  const createOrder = useCart((s) => s.createOrder);
  
  const [orderComment, setOrderComment] = useState('');
  const whatsappNumber = getWhatsappNumber();

  useEffect(() => {
    if (!whatsappNumber) console.warn('WhatsApp не настроен в src/data/info.ts.');
  }, [whatsappNumber]);

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

  const handleWhatsAppSend = () => {
    const order = createOrder();
    if (!order) return;
    window.open(whatsappUrl(order, orderComment), '_blank', 'noopener');
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
        {/* Левая колонка: теперь сверху идёт блок «Проверьте заказ», а под ним список товаров */}
        <div className="space-y-6">
          {/* Блок «Проверьте заказ» сверху */}
          <section className="rounded-3xl border border-line bg-bg p-5 shadow-sm">
            <h2 className="font-display text-xl mb-3">{t('cart.whatsappTitle')}</h2>
            <div className="flex items-center justify-between text-base font-bold text-mute mb-1">
              <span>{t('cart.positions')}</span>
              <span className="tabular-nums">{count} {t('cart.pcs')}</span>
            </div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-lg font-bold">{t('cart.total')}</span>
              <span className="text-3xl font-extrabold text-brand tabular-nums">{money(total)}</span>
            </div>

            <label className="block text-sm font-bold">
              {t('cart.orderComment')}
              <textarea
                value={orderComment}
                onChange={(event) => setOrderComment(event.target.value.slice(0, 500))}
                maxLength={500}
                rows={3}
                placeholder="Например: позвонить по прибытии, без лука..."
                className="admin-input mt-2 resize-y"
              />
            </label>
          </section>

          {/* Список товаров */}
          <ul className="space-y-3">
            {items.map((item) => (
              <CartItem key={item.key} item={item} />
            ))}
          </ul>
        </div>

        {/* Правая колонка: кнопки действий */}
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

          {whatsappNumber && (
            <button
              type="button"
              onClick={handleWhatsAppSend}
              className="mt-4 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-lg font-extrabold text-white shadow-lg transition hover:bg-[#1fb85a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
            >
              <MessageCircle size={22} />
              {t('cart.sendWhatsApp')}
            </button>
          )}
          <button type="button" onClick={handleCheckout} className="btn-primary mt-3 min-h-14 w-full text-lg">
            <Maximize size={22} />
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
