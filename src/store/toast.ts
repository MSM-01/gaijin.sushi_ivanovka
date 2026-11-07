import { create } from 'zustand';

interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'warning';
  show: (message: string, type?: 'success' | 'warning') => void;
  hide: () => void;
}

export const useToast = create<ToastState>((set) => ({
  id: 0,
  message: '',
  type: 'success',
  show: (message, type = 'success') => set((s) => ({ id: s.id + 1, message, type })),
  hide: () => set({ message: '' }),
}));
