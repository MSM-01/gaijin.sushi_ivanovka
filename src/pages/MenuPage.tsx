import { useEffect, useMemo, useState } from 'react';
import { Search, SearchX, X } from 'lucide-react';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';
import ProductDetails from '../components/ProductDetails';
import CartBar from '../components/CartBar';
import type { Product } from '../data/menu';
import { useI18n } from '../i18n/useI18n';
import { scrollToId } from '../lib/scroll';
import { useMenuStore } from '../store/menu';

/** Высота липких шапки (64px) и ленты категорий (~62px). */
const STICKY_OFFSET = 132;

const GRID = 'grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4 lg:grid-cols-4 xl:grid-cols-5';

export default function MenuPage() {
  const { t, tr } = useI18n();
  const categories = useMenuStore((s) => s.categories);
  const products = useMenuStore((s) => s.products);
  const menuError = useMenuStore((s) => s.error);
  const refreshMenu = useMenuStore((s) => s.refresh);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);

  const searching = query.trim().length > 0;

  useEffect(() => {
    void refreshMenu();
  }, [refreshMenu]);

  useEffect(() => {
    if (categories.length && !categories.some((category) => category.id === active)) {
      setActive(categories[0].id);
    }
  }, [active, categories]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products.filter((p) =>
      [p.name.ru, p.name.en, p.name.ky, p.description.ru, p.description.en, p.description.ky].some(
        (s) => s?.toLowerCase().includes(q),
      ),
    );
  }, [products, query]);

  // Подсветка категории при прокрутке страницы.
  useEffect(() => {
    if (searching) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = categories[0]?.id ?? '';
      for (const c of categories) {
        const el = document.getElementById(`cat-${c.id}`);
        if (el && el.getBoundingClientRect().top <= STICKY_OFFSET + 8) current = c.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [categories, searching]);

  const selectCategory = (id: string) => {
    setActive(id);
    scrollToId(`cat-${id}`, STICKY_OFFSET);
  };

  const closeDetails = () => setSelected(null);

  return (
    <div>
      {menuError && (
        <div role="status" className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-ink sm:mx-5">
          <span>
            {t('menu.connectionWarning')} {menuError}
          </span>
          <button type="button" onClick={() => void refreshMenu()} className="font-bold text-brand">
            {t('menu.retry')}
          </button>
        </div>
      )}
      <div className="px-4 pb-1 pt-4 sm:px-5">
        <label className="relative block">
          <span className="sr-only">{t('search.placeholder')}</span>
          <Search size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="h-12 w-full rounded-2xl bg-surface pl-12 pr-12 text-base font-medium text-ink outline-none ring-brand/40 transition placeholder:text-mute focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
          />
          {searching && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label={t('search.clear')}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-mute hover:bg-line"
            >
              <X size={18} />
            </button>
          )}
        </label>
      </div>

      {!searching && <CategoryTabs categories={categories.filter((c) => products.some((p) => p.category === c.id))} active={active} onSelect={selectCategory} />}

      <div className="px-4 pb-4 sm:px-5">
        {searching ? (
          results.length > 0 ? (
            <div className={`${GRID} pt-5`}>
              {results.map((p) => (
                <ProductCard key={p.id} product={p} onOpen={setSelected} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <SearchX size={44} className="text-mute" />
              <p className="text-lg font-bold">{t('search.empty')}</p>
              <p className="text-mute">{t('search.emptyHint')}</p>
            </div>
          )
        ) : (
          categories.map((c) => {
            const items = products.filter((p) => p.category === c.id);
            if (items.length === 0) return null;
            return (
              <section key={c.id} id={`cat-${c.id}`} className="pt-7">
                <h2 className="mb-4 font-display text-xl sm:text-2xl">{tr(c.name)}</h2>
                <div className={GRID}>
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} onOpen={setSelected} />
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>

      {selected && <ProductDetails key={selected.id} product={selected} onClose={closeDetails} />}
      <CartBar />
    </div>
  );
}
