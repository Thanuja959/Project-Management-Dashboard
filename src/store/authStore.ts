import { create } from 'zustand';
import type { User } from '@/types';
import { loadState, saveState, removeState } from '@/utils/storage';
import { mockUsers } from '@/data/mockData';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: loadState<User | null>('currentUser', null),
  loading: false,
  error: null,
  login: async (email, password) => {
    set({ loading: true, error: null });
    await new Promise((r) => setTimeout(r, 600));
    const users = loadState<User[]>('users', mockUsers);
    const found = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!found) {
      set({ loading: false, error: 'Invalid email or password.' });
      return false;
    }
    if (!found.active) {
      set({ loading: false, error: 'This account has been deactivated. Contact your administrator.' });
      return false;
    }
    saveState('currentUser', found);
    set({ user: found, loading: false, error: null });
    return true;
  },
  logout: () => {
    removeState('currentUser');
    set({ user: null });
  },
  clearError: () => set({ error: null }),
}));
