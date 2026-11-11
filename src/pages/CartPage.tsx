import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Maximize, MessageCircle, ShoppingBag, Trash2 } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart, useCartSummary } from '../store/cart';
import { useI18n } from '../i18n/useI18n';
import { INFO } from '../data/info';

export default function CartPage() {
  const { t, money, tr } = useI18n();
  const navigate = useNavigate();
  const { items, count, total } = useCartSummary();
  const clear = useCart((s) => s.clear);
  const createOrder = useCart((s) => s.createOrder);
  const [orderComment, setOrderComment] = useState('');
  const whatsappNumber = INFO.whatsapp.replace(/\D/g, '');

  useEffect(() => {
    if (!whatsappNumber) console.warn('WhatsApp is not configured in src/data/info.ts.');
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
    const comment = orderComment.trim();
    const message = [
      'Заказ GAIJIN SUSHI',
      `Номер заказа: ${order.id}`,
      ...order.lines.map((line) => {
        const name = line.name?.ru ?? items.find((item) => item.product.id === line.id)?.product.name.ru ?? line.id;
        const lineTotal = (line.price * line.qty).toLocaleString('ru-RU');
        return `• ${name} × ${line.qty} — ${lineTotal} с`;
      }),
      `Итого: ${order.total.toLocaleString('ru-RU')} с`,
      ...(comment ? [`Комментарий: ${comment}`] : []),
    ].join('\n');

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
  };

  return (
    <div className="px-4 py-5 sm:px-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl">Корзина</h1>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-bold text-mute transition hover:bg-surface hover:text-brand"
        >
          <Trash2 size={17} />
          Очистить корзину
        </button>
      </div>

      <div className="md:grid md:grid-cols-[1fr_24rem] md:items-start md:gap-6">
        
        {/* ЛЕВАЯ КОЛОНКА: Список товаров с кнопками изменения количества */}
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem key={item.product.id} item={item} />
          ))}
        </div>

        {/* ПРАВАЯ КОЛОНКА: Блок "Проверьте заказ" и кнопки отправки */}
        <section className="sticky top-24 z-20 mt-5 space-y-4 md:mt-0">
          
          <div className="rounded-3xl border border-line bg-bg p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold">Проверьте заказ</h2>
            
            <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-line pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm leading-snug">{tr(item.product.name)}</p>
                    <p className="mt-0.5 text-xs text-mute">
                      {item.qty} × {money(item.product.price)}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-extrabold tabular-nums">{money(item.sum)}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-mute text-sm">
              <span>Позиций</span>
              <span className="font-bold tabular-nums">{count} шт.</span>
            </div>
            
            <div className="mt-2 flex items-end justify-between">
              <span className="text-base font-bold">Итого</span>
              <span className="text-2xl font-extrabold text-brand tabular-nums">{money(total)}</span>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-mute">
                Комментарий к заказу
                <textarea
                  value={orderComment}
                  onChange={(event) => setOrderComment(event.target.value.slice(0, 500))}
                  placeholder="Например: позвонить по прибытии, без лука..."
                  maxLength={500}
                  rows={2}
                  className="admin-input mt-1.5 w-full resize-y rounded-2xl border border-line bg-surface p-2.5 text-xs outline-none focus:border-brand"
                />
              </label>
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="rounded-3xl border border-line bg-bg p-5 shadow-2xl">
            {whatsappNumber && (
              <button
                type="button"
                onClick={handleWhatsAppSend}
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-lg font-extrabold text-white shadow-lg transition hover:bg-[#1fb85a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
              >
                <MessageCircle size={22} />
                Отправить заказ в WhatsApp
              </button>
            )}
            <button type="button" onClick={handleCheckout} className="btn-primary mt-3 min-h-14 w-full text-lg">
              <Maximize size={22} />
              Показать кассиру
            </button>
            <p className="mt-3 text-center text-xs leading-relaxed text-mute">Оплата на сайте не принимается. Отправьте заказ в WhatsApp или покажите чек на кассе.</p>
            <Link to="/" className="btn-secondary mt-3 w-full">
              <ArrowLeft size={18} />
              Продолжить покупки
            </Link>
          </div>

        </section>
      </div>
    </div>
  );
}
