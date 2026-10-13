import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TokenResponse } from '../config/oauth';
import { isTokenExpired } from '../services/oauth-service';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isAuthenticated: boolean;

  setTokens: (tokenResponse: TokenResponse) => void;
  clearAuth: () => void;
  isTokenValid: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isAuthenticated: false,

      setTokens: (tokenResponse: TokenResponse) => {
        const expiresAt = Math.floor(Date.now() / 1000) + tokenResponse.expires_in;
        set({
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token || null,
          expiresAt,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          expiresAt: null,
          isAuthenticated: false,
        });
      },

      isTokenValid: () => {
        const { expiresAt, isAuthenticated } = get();
        return isAuthenticated && expiresAt !== null && !isTokenExpired(expiresAt);
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
