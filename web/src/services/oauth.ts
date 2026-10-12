import axios from 'axios';
import { OAUTH_CONFIG } from '../constants/oauth-config';
import type { TokenResponse } from '../types/auth';

const STATE_KEY = 'oauth_state';

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

export function redirectToAuthorize(): void {
  const state = generateState();
  saveState(state);

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.scope,
    state,
  });

  window.location.href = `${OAUTH_CONFIG.authorizationUrl}?${params.toString()}`;
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    client_secret: OAUTH_CONFIG.clientSecret,
    code,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    grant_type: 'authorization_code',
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
