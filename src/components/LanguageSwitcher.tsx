import { useSettings, type Lang } from '../store/settings';
import { useI18n } from '../i18n/useI18n';

const LANGS: Lang[] = ['ru', 'en'];

export default function LanguageSwitcher() {
  const lang = useSettings((s) => s.lang);
  const setLang = useSettings((s) => s.setLang);
  const { t } = useI18n();
  return (
    <div
      role="group"
      aria-label={t('lang.switch')}
      className="flex h-11 items-center rounded-full bg-surface p-1"
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`h-9 rounded-full px-2.5 text-xs font-extrabold uppercase transition ${
            lang === l ? 'bg-brand text-white shadow' : 'text-mute hover:text-ink'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
