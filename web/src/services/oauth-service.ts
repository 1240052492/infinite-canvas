import { OAUTH_CONFIG, type TokenResponse } from '../config/oauth';

/**
 * 生成随机 state 用于 CSRF 保护
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * 重定向到 OAuth 授权页面
 */
export function redirectToAuthorize(): void {
  const state = generateState();
  localStorage.setItem('oauth_state', state);

  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: OAUTH_CONFIG.redirectUri,
    scope: OAUTH_CONFIG.scope,
    state,
  });

  window.location.assign(`${OAUTH_CONFIG.authorizationUrl}?${params}`);
}

/**
 * 用授权码换取 access token
 */
export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: OAUTH_CONFIG.redirectUri,
    client_id: OAUTH_CONFIG.clientId,
    client_secret: OAUTH_CONFIG.clientSecret,
  });

  const response = await fetch(OAUTH_CONFIG.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * 获取并清除存储的 state
 */
export function getAndClearState(): string | null {
  const state = localStorage.getItem('oauth_state');
  localStorage.removeItem('oauth_state');
  return state;
}

/**
 * 检查 token 是否过期（提前 5 分钟判断为过期）
 */
export function isTokenExpired(expiresAt: number): boolean {
  const now = Math.floor(Date.now() / 1000);
  const buffer = 5 * 60; // 5 分钟缓冲
  return now >= expiresAt - buffer;
}
