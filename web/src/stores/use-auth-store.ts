import { create } from 'zustand';
import type { AuthState } from '../types/auth';
import { isTokenExpired } from '../services/oauth';

interface AuthStore extends AuthState {
  setToken: (tokenData: { token: string; expiresIn: number }) => void;
  clearToken: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      expiresAt: null,

      setToken: (tokenData) => {
        const expiresAt = Date.now() + tokenData.expiresIn * 1000;
        set({
          token: tokenData.token,
          expiresAt,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearToken: () => {
        set({
          token: null,
          expiresAt: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      checkAuth: () => {
        const { expiresAt, clearToken } = get();
        if (isTokenExpired(expiresAt)) {
          clearToken();
        }
      },
    })
);
