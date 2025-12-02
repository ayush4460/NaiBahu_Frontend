/**
 * Theme Store
 * Global state management for dark/light theme using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ============================================
// TYPES
// ============================================

export type Theme = 'light' | 'dark';

interface ThemeStore {
  // State
  theme: Theme;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

// ============================================
// CREATE STORE
// ============================================

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Initial state - default to dark theme
      theme: 'dark',

      // Set theme
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      // Toggle between light and dark
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        applyTheme(newTheme);
      },

      // Initialize theme (call on app load)
      initTheme: () => {
        const { theme } = get();
        applyTheme(theme);
      },
    }),
    {
      name: 'theme-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// THEME APPLICATION
// ============================================

/**
 * Apply theme to document
 */
function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
  }
}

// ============================================
// SELECTORS
// ============================================

export const useTheme = () => useThemeStore((state) => state.theme);
export const useIsDarkTheme = () => useThemeStore((state) => state.theme === 'dark');
export const useIsLightTheme = () => useThemeStore((state) => state.theme === 'light');

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get theme from system preference
 */
export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';

  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return isDark ? 'dark' : 'light';
}

/**
 * Set theme based on system preference
 */
export function useSystemTheme(): void {
  const systemTheme = getSystemTheme();
  useThemeStore.getState().setTheme(systemTheme);
}
