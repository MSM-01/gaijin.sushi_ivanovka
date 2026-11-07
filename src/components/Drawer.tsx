import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Info, Phone, UtensilsCrossed, X } from 'lucide-react';
import Logo from './Logo';
import { useI18n } from '../i18n/useI18n';
import { scrollToId } from '../lib/scroll';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function Drawer({ open, onClose }: Props) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const goMenu = () => {
    onClose();
    if (location.pathname !== '/') navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goSection = (id: string) => {
    onClose();
    window.setTimeout(() => scrollToId(id, 70), 50);
  };

  const items = [
    { label: t('nav.menu'), icon: UtensilsCrossed, onClick: goMenu },
    { label: t('nav.about'), icon: Info, onClick: () => goSection('about') },
    { label: t('nav.contacts'), icon: Phone, onClick: () => goSection('contacts') },
  ];

  return (
    <div className="fixed inset-0 z-[60] print:hidden" role="dialog" aria-modal="true">
      <div className="fade-in absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className="slide-right absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-bg p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <Logo height={52} />
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('nav.close')}>
            <X size={22} />
          </button>
        </div>
        <nav className="mt-8 flex flex-col gap-2">
          {items.map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className="flex min-h-14 items-center gap-4 rounded-2xl bg-surface px-4 text-left text-lg font-bold transition hover:bg-line active:scale-[0.98]"
            >
              <Icon size={22} className="text-brand" />
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </div>
  );
}
