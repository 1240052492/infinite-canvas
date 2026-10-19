import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import axios from 'axios';

import { OAUTH_CONFIG } from '../constants/oauth-config';
import {
  createOAuthCallbackGuard,
  exchangeCodeForToken,
  getAndClearCodeVerifier,
  redirectToAuthorize,
  resetResolvedClientId,
} from '../services/oauth';

describe('OAuth public client', () => {
  let previousSessionStorage: Storage | undefined;
  let previousPost: typeof axios.post;
  let previousGet: typeof axios.get;
  let postCalls: Array<[string, URLSearchParams]>;
  let getCalls: Array<[string, Record<string, string>]>;

  beforeEach(() => {
    const values = new Map<string, string>();
    previousSessionStorage = globalThis.sessionStorage;
    previousPost = axios.post;
    previousGet = axios.get;
    postCalls = [];
    getCalls = [];
    resetResolvedClientId();
    axios.post = ((url: string, body: URLSearchParams) => {
      postCalls.push([url, body]);
      return Promise.resolve({ data: { access_token: 'canvas-token', expires_in: 3600 } });
    }) as typeof axios.post;
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
  });

  afterEach(() => {
    axios.post = previousPost;
    axios.get = previousGet;
    if (previousSessionStorage) {
      Object.defineProperty(globalThis, 'sessionStorage', {
        configurable: true,
        value: previousSessionStorage,
      });
    } else {
      Reflect.deleteProperty(globalThis, 'sessionStorage');
    }
  });

  it('starts authorization through the local New API browser bridge with PKCE', async () => {
    let navigatedUrl = '';
    await redirectToAuthorize((url) => {
      navigatedUrl = url;
    });

    const authorizationUrl = new URL(navigatedUrl);
    const verifier = getAndClearCodeVerifier();
    expect(authorizationUrl.origin).toBe(new URL(OAUTH_CONFIG.authorizationUrl).origin);
    expect(authorizationUrl.pathname).toBe('/oauth/authorize');
    expect(authorizationUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizationUrl.searchParams.get('state')).toBeTruthy();
    expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(verifier).toBeTruthy();
    expect(OAUTH_CONFIG.tokenUrl).toMatch(/\/api\/oauth\/token$/);
    expect(OAUTH_CONFIG).not.toHaveProperty('clientSecret');
  });

  it('discovers the client_id at runtime from the redirect_uri', async () => {
    let navigatedUrl = '';
    await redirectToAuthorize((url) => {
      navigatedUrl = url;
    });

    expect(getCalls).toHaveLength(1);
    const [configUrl, params] = getCalls[0];
    expect(configUrl).toBe(`${new URL(OAUTH_CONFIG.tokenUrl).origin}/api/oauth/client-config`);
    expect(params.redirect_uri).toBe(OAUTH_CONFIG.redirectUri);
    expect(new URL(navigatedUrl).searchParams.get('client_id')).toBe('client_discovered');
  });

  it('exchanges the code with its verifier and no browser client secret', async () => {
    await exchangeCodeForToken('auth-code', 'pkce-verifier');

    const [url, body] = postCalls[0];
    expect(url).toBe(OAUTH_CONFIG.tokenUrl);
    expect(body).toContain('code_verifier=pkce-verifier');
    expect(body).toContain('client_id=client_discovered');
    expect(body).not.toContain('client_secret');
  });

  it('guards the callback against React StrictMode duplicate effects', () => {
    const guard = createOAuthCallbackGuard();
    expect(guard()).toBe(true);
    expect(guard()).toBe(false);
  });
});
