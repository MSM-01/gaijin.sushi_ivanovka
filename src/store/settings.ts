import { create } from 'zustand';

export type Theme = 'light' | 'dark';
export type Lang = 'ru' | 'ky' | 'en';

const THEME_KEY = 'gaijin-theme';
const LANG_KEY = 'gaijin-lang';

function read<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return allowed.includes(v as T) ? (v as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* localStorage может быть недоступен (приватный режим) */
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0e0e10' : '#E8283C');
}

function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
}

interface SettingsState {
  theme: Theme;
  lang: Lang;
  toggleTheme: () => void;
  setLang: (lang: Lang) => void;
}

const initialTheme = read<Theme>(THEME_KEY, ['light', 'dark'], 'light');
const initialLang = read<Lang>(LANG_KEY, ['ru', 'ky', 'en'], 'ru');
applyTheme(initialTheme);
applyLang(initialLang);

export const useSettings = create<SettingsState>((set, get) => ({
  theme: initialTheme,
  lang: initialLang,
  toggleTheme: () => {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light';
    write(THEME_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },
  setLang: (lang) => {
    write(LANG_KEY, lang);
    applyLang(lang);
    set({ lang });
  },
}));
