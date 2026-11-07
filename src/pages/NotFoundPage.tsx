import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/useI18n';

export default function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <p className="font-display text-6xl text-brand">404</p>
      <h1 className="font-display text-2xl">{t('notfound.title')}</h1>
      <p className="text-mute">{t('notfound.text')}</p>
      <Link to="/" className="btn-primary mt-2">
        {t('cart.toMenu')}
      </Link>
    </div>
  );
}
