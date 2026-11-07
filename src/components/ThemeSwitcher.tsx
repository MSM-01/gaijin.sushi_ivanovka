import { Moon, Sun } from 'lucide-react';
import { useSettings } from '../store/settings';
import { useI18n } from '../i18n/useI18n';

export default function ThemeSwitcher() {
  const theme = useSettings((s) => s.theme);
  const toggle = useSettings((s) => s.toggleTheme);
  const { t } = useI18n();
  const label = theme === 'dark' ? t('theme.toLight') : t('theme.toDark');
  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label} title={label}>
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
