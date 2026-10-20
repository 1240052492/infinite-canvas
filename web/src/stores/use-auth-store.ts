import { create } from 'zustand';
import type { AuthState } from '../types/auth';
import { NEW_API_ADMIN_ROLE } from '../types/auth';
import { isTokenExpired } from '../services/oauth';

interface AuthStore extends AuthState {
  setToken: (tokenData: { token: string; expiresIn: number }) => void;
  clearToken: () => void;
  checkAuth: () => void;
  isAdmin: () => boolean;
}

// New API issues the OAuth access token as a JWT whose payload carries the
// account role. Decoding here is presentation-level only: it drives UI
// visibility (hidden top-bar entries, config tabs), never security.
function decodeTokenRole(token: string): number | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const claims = JSON.parse(atob(padded)) as { role?: unknown };
    return typeof claims.role === 'number' ? claims.role : null;
  } catch {
    return null;
  }
}

// The token lives in sessionStorage so a full page reload (e.g. returning
// from the New API console) keeps the visitor logged in until the token
// actually expires. sessionStorage keeps the tab isolated; every storage
// access is guarded because tests and non-browser runs have none.
const AUTH_STORAGE_KEY = 'canvas.auth.session';

type PersistedAuth = { token: string; expiresAt: number; role: number | null };

function persistAuth(auth: PersistedAuth | null): void {
  try {
    if (auth) sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
    else sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    /* storage unavailable; keep the in-memory state only */
  }
}

function loadPersistedAuth(): PersistedAuth | null {
  try {
    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedAuth>;
    if (!parsed.token || typeof parsed.expiresAt !== 'number') return null;
    if (isTokenExpired(parsed.expiresAt)) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
    return { token: parsed.token, expiresAt: parsed.expiresAt, role: typeof parsed.role === 'number' ? parsed.role : null };
  } catch {
    return null;
  }
}

const persisted = loadPersistedAuth();

export const useAuthStore = create<AuthStore>()(
    (set, get) => ({
      token: persisted?.token ?? null,
      isAuthenticated: Boolean(persisted),
      isLoading: false,
      expiresAt: persisted?.expiresAt ?? null,
      role: persisted?.role ?? null,

      setToken: (tokenData) => {
        const expiresAt = Date.now() + tokenData.expiresIn * 1000;
        const role = decodeTokenRole(tokenData.token);
        persistAuth({ token: tokenData.token, expiresAt, role });
        set({
          token: tokenData.token,
          expiresAt,
          role,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearToken: () => {
        persistAuth(null);
        set({
          token: null,
          expiresAt: null,
          role: null,
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

      isAdmin: () => {
        const { role } = get();
        return role !== null && role >= NEW_API_ADMIN_ROLE;
      },
    })
);
