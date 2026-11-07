import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import type { L10n, Product } from '../data/menu';
import { useMenuStore } from './menu';

export const MAX_QTY = 99;

export interface OrderLine {
  id: string;
  qty: number;
  price: number;
  name?: L10n;
}

export interface Order {
  id: string;
  createdAt: string;
  lines: OrderLine[];
  total: number;
}

interface CartState {
  /** productId -> quantity */
  lines: Record<string, number>;
  order: Order | null;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  createOrder: () => Order | null;
  clearOrder: () => void;
}

export interface CartItemData {
  product: Product;
  qty: number;
  sum: number;
}

export interface CartSummary {
  items: CartItemData[];
  count: number;
  total: number;
}

export function summarize(lines: Record<string, number>): CartSummary {
  const items: CartItemData[] = [];
  for (const [id, qty] of Object.entries(lines)) {
    const product = useMenuStore.getState().products.find((item) => item.id === id);
    if (!product || product.available === false || qty <= 0) continue;
    items.push({ product, qty, sum: product.price * qty });
  }
  return {
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    total: items.reduce((n, i) => n + i.sum, 0),
  };
}

function nextOrderId(): string {
  const now = new Date();
  const day = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  let n = 1;
  try {
    const raw = localStorage.getItem('gaijin-order-seq');
    if (raw) {
      const saved = JSON.parse(raw) as { day: string; n: number };
      if (saved.day === day) n = saved.n + 1;
    }
    localStorage.setItem('gaijin-order-seq', JSON.stringify({ day, n }));
  } catch {
    n = Math.floor(Math.random() * 900) + 100;
  }
  return `G-${day}-${String(n).padStart(3, '0')}`;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: {},
      order: null,

      add: (id, qty = 1) =>
        set((s) => ({
          lines: { ...s.lines, [id]: Math.min(MAX_QTY, (s.lines[id] ?? 0) + qty) },
        })),

      setQty: (id, qty) =>
        set((s) => {
          const next = { ...s.lines };
          if (qty <= 0) delete next[id];
          else next[id] = Math.min(MAX_QTY, qty);
          return { lines: next };
        }),

      remove: (id) =>
        set((s) => {
          const next = { ...s.lines };
          delete next[id];
          return { lines: next };
        }),

      clear: () => set({ lines: {} }),

      createOrder: () => {
        const summary = summarize(get().lines);
        if (summary.items.length === 0) return null;
        const existing = get().order;
        // Если корзина не менялась с момента последнего чека — оставляем тот же номер.
        if (existing) {
          const same =
            existing.lines.length === summary.items.length &&
            existing.lines.every((l) => get().lines[l.id] === l.qty) &&
            existing.total === summary.total;
          if (same) return existing;
        }
        const order: Order = {
          id: nextOrderId(),
          createdAt: new Date().toISOString(),
          lines: summary.items.map((i) => ({
            id: i.product.id,
            qty: i.qty,
            price: i.product.price,
            name: i.product.name,
          })),
          total: summary.total,
        };
        set({ order });
        return order;
      },

      clearOrder: () => set({ order: null }),
    }),
    {
      name: 'gaijin-cart',
      version: 1,
      partialize: (s) => ({ lines: s.lines, order: s.order }),
    },
  ),
);

export function useCartSummary(): CartSummary {
  const lines = useCart((s) => s.lines);
  const products = useMenuStore((s) => s.products);
  return useMemo(() => summarize(lines), [lines, products]);
}
