import { create } from 'zustand';
import { loadState, saveState } from '@/utils/storage';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  toasts: ToastItem[];
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  showToast: (t: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: loadState<Theme>('theme', 'light'),
  sidebarOpen: false,
  commandPaletteOpen: false,
  toasts: [],

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    saveState('theme', next);
    set({ theme: next });
  },

  setTheme: (t) => {
    saveState('theme', t);
    set({ theme: t });
  },

  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  showToast: (t) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => {
      get().dismissToast(id);
    }, 3500);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
