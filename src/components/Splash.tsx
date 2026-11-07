import Logo from './Logo';
import { useI18n } from '../i18n/useI18n';

export default function Splash({ visible }: { visible: boolean }) {
  const { t } = useI18n();
  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-bg transition-opacity duration-500 ${
        visible ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="animate-pulse">
        <Logo height={150} />
      </div>
      <p className="font-display text-sm tracking-[0.3em] text-mute">GAIJIN SUSHI</p>
      <span className="sr-only">{t('loading')}</span>
    </div>
  );
}
