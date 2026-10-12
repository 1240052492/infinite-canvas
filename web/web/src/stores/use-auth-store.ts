import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthState {
  accessToken: string | null;
  expiresAt: number | null;
  setAuth: (accessToken: string, expiresIn: number) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      setAuth: (accessToken: string, expiresIn: number) => {
        const expiresAt = Date.now() + expiresIn * 1000;
        set({ accessToken, expiresAt });
      },
      clearAuth: () => {
        set({ accessToken: null, expiresAt: null });
      },
      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        return accessToken !== null && expiresAt !== null && Date.now() < expiresAt;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
