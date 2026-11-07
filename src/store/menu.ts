import { create } from 'zustand';
import { CATEGORIES, PRODUCTS, type Category, type Product } from '../data/menu';
import { apiRequest } from '../lib/api';

interface MenuState {
  categories: Category[];
  products: Product[];
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}

export const useMenuStore = create<MenuState>((set) => ({
  categories: CATEGORIES,
  products: PRODUCTS,
  loading: true,
  error: '',
  refresh: async () => {
    set({ loading: true, error: '' });
    try {
      const menu = await apiRequest<{ categories: Category[]; products: Product[] }>('/menu');
      set({ categories: menu.categories, products: menu.products, loading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось загрузить меню.';
      set({ loading: false, error: message });
    }
  },
}));
