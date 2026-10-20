import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import axios from 'axios';

import { ensureAuthenticated, isAuthenticated, AUTH_REDIRECT_KEY } from '../services/auth-gate';
import { useAuthStore } from '../stores/use-auth-store';

describe('guest mode auth gate', () => {
  let previousSessionStorage: Storage | undefined;
  let previousGet: typeof axios.get;
  let previousWindow: typeof globalThis.window | undefined;
  let getCalls: Array<[string, Record<string, string>]>;

  beforeEach(() => {
    const values = new Map<string, string>();
    previousSessionStorage = globalThis.sessionStorage;
    previousGet = axios.get;
    previousWindow = globalThis.window;
    getCalls = [];
    useAuthStore.getState().clearToken();
    axios.get = ((url: string, config?: { params?: Record<string, string> }) => {
      getCalls.push([url, config?.params ?? {}]);
      return Promise.resolve({ data: { client_id: 'client_discovered' } });
    }) as typeof axios.get;
    Object.defineProperty(globalThis, 'sessionStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
        clear: () => values.clear(),
      },
    });
    (globalThis as { window?: unknown }).window = {
      location: { pathname: '/canvas', search: '?tab=recent', assign: () => {} },
    };
  });

  afterEach(() => {
    axios.get = previousGet;
    if (previousWindow !== undefined) {
      (globalThis as { window?: unknown }).window = previousWindow;
    } else {
      Reflect.deleteProperty(globalThis, 'window');
    }
    if (previousSessionStorage) {
      Object.defineProperty(globalThis, 'sessionStorage', {
        configurable: true,
        value: previousSessionStorage,
      });
    } else {
      Reflect.deleteProperty(globalThis, 'sessionStorage');
    }
  });

  it('treats visitors without a token as guests', () => {
    expect(isAuthenticated()).toBe(false);
  });

  it('keeps guests on the page but remembers the login redirect target', async () => {
    const navigated: string[] = [];
    const allowed = ensureAuthenticated((url) => navigated.push(url));

    expect(allowed).toBe(false);
    expect(sessionStorage.getItem(AUTH_REDIRECT_KEY)).toBe('/canvas?tab=recent');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(navigated).toHaveLength(1);
    const url = new URL(navigated[0]);
    expect(url.pathname).toBe('/oauth/authorize');
    expect(url.searchParams.get('response_type')).toBe('code');
  });

  it('lets authenticated users through without redirecting', () => {
    useAuthStore.getState().setToken({ token: 'canvas-token', expiresIn: 3600 });
    const navigated: string[] = [];

    expect(isAuthenticated()).toBe(true);
    expect(ensureAuthenticated((url) => navigated.push(url))).toBe(true);
    expect(navigated).toHaveLength(0);
    expect(sessionStorage.getItem(AUTH_REDIRECT_KEY)).toBeNull();
  });
});
