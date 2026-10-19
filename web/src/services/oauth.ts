import axios from 'axios';
import { OAUTH_CONFIG } from '../constants/oauth-config';
import type { TokenResponse } from '../types/auth';

const STATE_KEY = 'oauth_state';
const CODE_VERIFIER_KEY = 'oauth_code_verifier';

const NEW_API_ORIGIN = new URL(OAUTH_CONFIG.tokenUrl).origin;

let cachedClientId: string | null = null;
let clientIdRequest: Promise<string> | null = null;

// Resolve the client_id at runtime from the New API console, so a new OAuth
// application created there takes effect on the next page load without
// editing .env.local or restarting the dev server. The build-time
// VITE_OAUTH_CLIENT_ID stays as a fallback when discovery is unavailable.
async function resolveClientId(): Promise<string> {
  if (cachedClientId) return cachedClientId;

  clientIdRequest ??= axios
    .get<{ client_id: string }>(`${NEW_API_ORIGIN}/api/oauth/client-config`, {
      params: { redirect_uri: OAUTH_CONFIG.redirectUri },
    })
    .then((response) => {
      const clientId = response.data?.client_id;
      if (!clientId) throw new Error('client config response missing client_id');
      cachedClientId = clientId;
      return clientId;
    })
    .catch((error) => {
      clientIdRequest = null;
      if (OAUTH_CONFIG.clientId) return OAUTH_CONFIG.clientId;
      throw error;
    });

  return clientIdRequest;
}

// Test fixture: clears the memoized discovery result so each test starts from
// a cold cache.
export function resetResolvedClientId(): void {
  cachedClientId = null;
  clientIdRequest = null;
}

export function createOAuthCallbackGuard(): () => boolean {
  let handled = false;
  return () => {
    if (handled) return false;
    handled = true;
    return true;
  };
}

export function generateState(): string {
  return crypto.randomUUID();
}

export function saveState(state: string): void {
  sessionStorage.setItem(STATE_KEY, state);
}

export function getAndClearState(): string | null {
  const state = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return state;
}

function generateCodeVerifier(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

export function getAndClearCodeVerifier(): string | null {
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);
  sessionStorage.removeItem(CODE_VERIFIER_KEY);
  return verifier;
}

export async function redirectToAuthorize(
  navigate: (url: string) => void = (url) => window.location.assign(url)
): Promise<void> {
  const clientId = await resolveClientId();
  const state = sessionStorage.getItem(STATE_KEY) || generateState();
  const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY) || generateCodeVerifier();
  saveState(state);
  sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);
  const codeChallenge = await createCodeChallenge(verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.scope,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  navigate(`${OAUTH_CONFIG.authorizationUrl}?${params.toString()}`);
}

export async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
  const clientId = await resolveClientId();
  const params = new URLSearchParams({
    client_id: clientId,
    code,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    grant_type: 'authorization_code',
    code_verifier: codeVerifier,
  });

  const response = await axios.post<TokenResponse>(
    OAUTH_CONFIG.tokenUrl,
    params.toString(),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  return response.data;
}

export function isTokenExpired(expiresAt: number | null): boolean {
  if (!expiresAt) return true;
  // Consider expired 60 seconds early
  return Date.now() >= expiresAt - 60000;
}
