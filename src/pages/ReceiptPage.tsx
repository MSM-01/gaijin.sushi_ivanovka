import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Maximize,
  MessageCircle,
  Pencil,
  Printer,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import Logo from '../components/Logo';
import { useCart, type Order } from '../store/cart';
import { useMenuStore } from '../store/menu';
import { useI18n } from '../i18n/useI18n';

const SIZES = [14, 16, 18, 20, 24, 28, 32];
const SIZE_KEY = 'gaijin-receipt-size';

function loadSizeIndex(): number {
  try {
    const n = Number(localStorage.getItem(SIZE_KEY));
    if (Number.isInteger(n) && n >= 0 && n < SIZES.length) return n;
  } catch {
    /* ignore */
  }
  return 2;
}

function ReceiptBody({ order, size, large }: { order: Order; size: number; large?: boolean }) {
  const { t, tr, lang, money } = useI18n();
  const products = useMenuStore((s) => s.products);
  const date = new Date(order.createdAt).toLocaleString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div style={{ fontSize: size }} className="text-neutral-900">
      <div className="flex flex-col items-center text-center">
        {!large && <Logo height={72} />}
        <h1 className="mt-3 font-display text-[1.25em] tracking-[0.18em]">GAIJIN SUSHI</h1>
        <p className="text-[0.8em] text-neutral-500">{t('receipt.title')}</p>
      </div>

      <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-y border-dashed border-neutral-300 py-3 text-[0.85em]">
        <dt className="text-neutral-500">{t('receipt.order')}</dt>
        <dd className="text-right text-[1.15em] font-extrabold tracking-wide">{order.id}</dd>
        <dt className="text-neutral-500">{t('receipt.date')}</dt>
        <dd className="text-right font-semibold">{date}</dd>
      </dl>

      <p className="mt-4 text-[0.75em] font-bold uppercase tracking-widest text-neutral-500">{t('receipt.items')}</p>
      <ul className="mt-1">
        {order.lines.map((line) => {
          const product = products.find((item) => item.id === line.id);
          const name = line.name ? tr(line.name) : product ? tr(product.name) : line.id;
          return (
            <li key={line.id} className="flex items-start gap-3 border-b border-dashed border-neutral-300 py-3">
              <span className="min-w-[2.4em] text-[1.15em] font-extrabold tabular-nums">{line.qty}×</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.05em] font-bold leading-snug">{name}</span>
                <span className="block text-[0.75em] text-neutral-500">
                  {line.qty} × {money(line.price)}
                </span>
              </span>
              <span className="text-[1.05em] font-extrabold tabular-nums">{money(line.price * line.qty)}</span>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-end justify-between gap-3">
        <span className="text-[1em] font-bold">{t('receipt.total')}</span>
        <span className="text-[1.9em] font-extrabold leading-none tabular-nums">{money(order.total)}</span>
      </div>

      <div className="mt-5 rounded-2xl border-2 border-amber-400 bg-amber-100 p-3 text-center text-[0.95em] font-extrabold text-amber-950">
        {t('receipt.status')}
      </div>
      <p className="mt-3 text-center text-[0.75em] leading-relaxed text-neutral-500">{t('receipt.notice')}</p>
    </div>
  );
}

export default function ReceiptPage() {
  const { t, tr, money } = useI18n();
  const navigate = useNavigate();
  const order = useCart((s) => s.order);
  const products = useMenuStore((s) => s.products);
  const clear = useCart((s) => s.clear);
  const clearOrder = useCart((s) => s.clearOrder);
  const [sizeIndex, setSizeIndex] = useState(loadSizeIndex);
  const [present, setPresent] = useState(false);

  if (!order) return <Navigate to="/cart" replace />;

  const whatsappMessage = [
    t('receipt.whatsappTitle'),
    `${t('receipt.order')} ${order.id}`,
    ...order.lines.map((line) => {
      const product = products.find((item) => item.id === line.id);
      const name = line.name ? tr(line.name) : product ? tr(product.name) : line.id;
      return `${name} — ${line.qty} × ${money(line.price)} = ${money(line.price * line.qty)}`;
    }),
    `${t('receipt.total')}: ${money(order.total)}`,
  ].join('\n');
  const whatsappUrl = `https://wa.me/996554600554?text=${encodeURIComponent(whatsappMessage)}`;

  const changeSize = (delta: number) => {
    const next = Math.min(SIZES.length - 1, Math.max(0, sizeIndex + delta));
    setSizeIndex(next);
    try {
      localStorage.setItem(SIZE_KEY, String(next));
    } catch {
      /* ignore */
    }
  };

  const newOrder = () => {
    if (!window.confirm(t('receipt.confirmNew'))) return;
    clear();
    clearOrder();
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-5">
      <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/5 print:shadow-none print:ring-0">
        <ReceiptBody order={order} size={SIZES[sizeIndex]} />
      </div>

      <div className="mt-5 space-y-3 print:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 text-lg font-extrabold text-white shadow-lg transition hover:bg-[#1fb85a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <MessageCircle size={22} />
          {t('receipt.sendWhatsApp')}
        </a>

        <button
          type="button"
          onClick={() => setPresent(true)}
          className="btn-primary min-h-16 w-full text-xl"
        >
          <Maximize size={24} />
          {t('receipt.show')}
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            className="btn-secondary !px-2"
            onClick={() => changeSize(-1)}
            disabled={sizeIndex === 0}
            aria-label={t('receipt.smallerText')}
            title={t('receipt.smallerText')}
          >
            <ZoomOut size={22} />
          </button>
          <button
            type="button"
            className="btn-secondary !px-2"
            onClick={() => changeSize(1)}
            disabled={sizeIndex === SIZES.length - 1}
            aria-label={t('receipt.biggerText')}
            title={t('receipt.biggerText')}
          >
            <ZoomIn size={22} />
          </button>
          <button type="button" className="btn-secondary !px-2" onClick={() => window.print()}>
            <Printer size={20} />
            <span className="text-sm">{t('receipt.print')}</span>
          </button>
        </div>

        <Link to="/" className="btn-secondary w-full">
          <ArrowLeft size={18} />
          {t('receipt.backToMenu')}
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/cart" className="btn-secondary !px-3 text-sm">
            <Pencil size={16} />
            {t('receipt.edit')}
          </Link>
          <button type="button" className="btn-secondary !px-3 text-sm" onClick={newOrder}>
            <RotateCcw size={16} />
            {t('receipt.newOrder')}
          </button>
        </div>
      </div>

      {present && (
        <div className="fade-in fixed inset-0 z-[80] overflow-y-auto bg-white p-5 print:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setPresent(false)}
            className="fixed right-4 top-4 z-10 flex h-12 items-center gap-2 rounded-full bg-neutral-900 px-5 font-bold text-white shadow-xl"
          >
            <X size={20} />
            {t('receipt.hide')}
          </button>
          <div className="mx-auto max-w-2xl pb-10 pt-12">
            <ReceiptBody order={order} size={Math.max(SIZES[sizeIndex], 20)} large />
          </div>
        </div>
      )}
    </div>
  );
}
