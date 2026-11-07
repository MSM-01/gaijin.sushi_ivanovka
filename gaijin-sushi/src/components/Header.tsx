import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ShoppingBag } from 'lucide-react';
import Logo from './Logo';
import Drawer from './Drawer';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import { useCartSummary } from '../store/cart';
import { useI18n } from '../i18n/useI18n';

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCartSummary();
  const { t } = useI18n();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur print:hidden">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-3 sm:px-5">
          <button
            type="button"
            className="icon-btn !bg-transparent"
            onClick={() => setOpen(true)}
            aria-label={t('nav.open')}
          >
            <Menu size={26} />
          </button>

          <Link to="/" aria-label="GAIJIN SUSHI" className="shrink-0">
            <Logo height={44} />
          </Link>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
            <Link
              to="/cart"
              aria-label={t('cart.open')}
              className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30 transition active:scale-95"
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span
                  key={count}
                  className="pop absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-bg bg-ink px-1 text-[11px] font-extrabold text-bg"
                >
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <Drawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
