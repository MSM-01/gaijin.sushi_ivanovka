import { useEffect, useRef } from 'react';
import type { Category } from '../data/menu';
import { useI18n } from '../i18n/useI18n';

interface Props {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
}

export default function CategoryTabs({ categories, active, onSelect }: Props) {
  const { tr } = useI18n();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const scroller = useRef<HTMLDivElement>(null);

  // Держим активную вкладку в видимой области ленты.
  useEffect(() => {
    const btn = refs.current[active];
    const box = scroller.current;
    if (!btn || !box) return;
    const target = btn.offsetLeft - (box.clientWidth - btn.offsetWidth) / 2;
    box.scrollTo({ left: target, behavior: 'smooth' });
  }, [active]);

  return (
    <div className="sticky top-16 z-30 border-b border-line bg-bg/95 shadow-sm backdrop-blur">
      <div ref={scroller} className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-3 sm:px-5" role="tablist">
        {categories.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              refs.current[c.id] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            onClick={() => onSelect(c.id)}
            className={`shrink-0 rounded-2xl px-4 py-2.5 text-[15px] font-bold uppercase tracking-wide transition active:scale-95 ${
              active === c.id ? 'bg-brand text-white shadow-md shadow-brand/30' : 'bg-surface text-mute hover:text-ink'
            }`}
          >
            {tr(c.name)}
          </button>
        ))}
      </div>
    </div>
  );
}
