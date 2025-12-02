/**
 * Authentication Store
 * Global state management for authentication using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import { removeTokens, setAccessToken, setRefreshToken } from '@/lib/utils';

// ============================================
// STORE INTERFACE
// ============================================

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setUser: (user: User) => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

// ============================================
// CREATE STORE
// ============================================

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,

      // Set user only
      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      // Set full auth (after login)
      setAuth: (user, accessToken, refreshToken) => {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      // Logout
      logout: () => {
        removeTokens();
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      // Set loading state
      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      // Update user details
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist user and isAuthenticated
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ============================================
// SELECTORS (for optimized access)
// ============================================

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useUserRole = () => useAuthStore((state) => state.user?.role);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user is admin
 */
export function useIsAdmin(): boolean {
  const user = useUser();
  return user?.role === 'admin';
}

/**
 * Check if user is captain
 */
export function useIsCaptain(): boolean {
  const user = useUser();
  return user?.role === 'captain';
}

/**
 * Get user full name
 */
export function useUserName(): string {
  const user = useUser();
  return user?.full_name || 'Guest';
}

/**
 * Get user email
 */
export function useUserEmail(): string {
  const user = useUser();
  return user?.email || '';
}
