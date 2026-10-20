import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useAuthStore } from '../stores/use-auth-store';

const AUTH_STORAGE_KEY = 'canvas.auth.session';

function tokenWithRole(role: number | undefined) {
  const payload: Record<string, unknown> = { user_id: 1, username: 'u' };
  if (role !== undefined) payload.role = role;
  return ['a', btoa(JSON.stringify(payload)), 'sig'].join('.');
}

describe('auth store role handling', () => {
  let previousSessionStorage: Storage | undefined;

  beforeEach(() => {
    const values = new Map<string, string>();
    previousSessionStorage = globalThis.sessionStorage;
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    });
    useAuthStore.getState().clearToken();
  });

  afterEach(() => {
    useAuthStore.getState().clearToken();
    if (previousSessionStorage) {
      Object.defineProperty(globalThis, 'sessionStorage', {
        configurable: true,
        value: previousSessionStorage,
      });
    } else {
      Reflect.deleteProperty(globalThis, 'sessionStorage');
    }
  });

  it('treats role 10 and above as administrator', () => {
    useAuthStore.getState().setToken({ token: tokenWithRole(10), expiresIn: 3600 });
    expect(useAuthStore.getState().role).toBe(10);
    expect(useAuthStore.getState().isAdmin()).toBe(true);

    useAuthStore.getState().setToken({ token: tokenWithRole(100), expiresIn: 3600 });
    expect(useAuthStore.getState().isAdmin()).toBe(true);
  });

  it('treats normal users and tokens without a role as non-admin', () => {
    useAuthStore.getState().setToken({ token: tokenWithRole(1), expiresIn: 3600 });
    expect(useAuthStore.getState().isAdmin()).toBe(false);

    useAuthStore.getState().setToken({ token: tokenWithRole(undefined), expiresIn: 3600 });
    expect(useAuthStore.getState().role).toBeNull();
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('guests are never administrators', () => {
    expect(useAuthStore.getState().isAdmin()).toBe(false);
  });

  it('persists the session for page reloads and clears it on logout', () => {
    useAuthStore.getState().setToken({ token: tokenWithRole(1), expiresIn: 3600 });

    const raw = sessionStorage.getItem(AUTH_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const persisted = JSON.parse(raw as string) as { token: string; expiresAt: number; role: number | null };
    expect(persisted.token).toBe(useAuthStore.getState().token);
    expect(persisted.expiresAt).toBe(useAuthStore.getState().expiresAt);
    expect(persisted.role).toBe(1);

    useAuthStore.getState().clearToken();
    expect(sessionStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});
