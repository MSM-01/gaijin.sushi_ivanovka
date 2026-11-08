import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCartSummary } from '../store/cart';
import { useI18n } from '../i18n/useI18n';

/**
 * Плавающая кнопка корзины. Рендерится в document.body (portal), поэтому
 * не зависит от контейнера меню и всегда закреплена внизу экрана.
 */
export default function CartBar() {
  const { count, total } = useCartSummary();
  const { t, money } = useI18n();
  if (count === 0) return null;

  return createPortal(
    <Link to="/cart" className="cart-float print:hidden" aria-label={`${t('cart.bar')}: ${count}, ${money(total)}`}>
      <span className="flex items-center gap-2 font-bold">
        <ShoppingBag size={20} />
        {t('cart.bar')} · {count}
      </span>
      <span className="text-lg font-extrabold tabular-nums">{money(total)}</span>
    </Link>,
    document.body,
  );
}
