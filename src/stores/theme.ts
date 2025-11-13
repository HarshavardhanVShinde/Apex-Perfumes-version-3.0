import { create } from 'zustand';
import { storage } from '@/lib/storage';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

const THEME_KEY = 'apex-theme';

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  
  setTheme: (theme: Theme) => {
    set({ theme });
    storage.set(THEME_KEY, theme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  },

  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },

  initializeTheme: () => {
    const savedTheme = storage.get<Theme>(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    get().setTheme(theme);
  },
}));