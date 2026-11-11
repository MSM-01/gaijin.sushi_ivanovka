import { useCallback } from 'react';
import { useSettings } from '../store/settings';
import { translations, type TKey } from './translations';
import type { L10n } from '../data/menu';

export type TFunction = (key: TKey, vars?: Record<string, string | number>) => string;

export function useI18n() {
  const lang = useSettings((s) => s.lang);

  const t: TFunction = useCallback(
    (key, vars) => {
      let text: string = translations[lang][key] ?? translations.ru[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          text = text.split(`{${k}}`).join(String(v));
        }
      }
      return text;
    },
    [lang],
  );

  /** Выбирает нужный язык из { ru, en, ky }; если перевода нет — показывает русский. */
  const tr = useCallback((value: L10n) => value[lang] || value.ru, [lang]);

  /** Форматирует цену: «1 099 с» / «1,099 KGS». */
  const money = useCallback(
    (value: number) =>
      `${value.toLocaleString(lang === 'en' ? 'en-US' : 'ru-RU')} ${translations[lang]['currency']}`,
    [lang],
  );

  return { lang, t, tr, money };
}
