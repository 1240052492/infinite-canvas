/**
 * OAuth 2.0 配置
 */
export const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_OAUTH_CLIENT_SECRET || '',
  authorizationUrl: import.meta.env.VITE_OAUTH_AUTHORIZATION_URL || 'https://www.aiplantform.site/oauth/authorize',
  tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL || 'https://www.aiplantform.site/oauth/token',
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || 'https://canvas.aiplantform.site/oauth/callback',
  scope: 'read write',
};

/**
 * New-API 链接配置
 */
export const NEW_API_LINKS = {
  home: import.meta.env.VITE_NEW_API_HOME || 'https://www.aiplantform.site',
  wallet: import.meta.env.VITE_NEW_API_WALLET || 'https://www.aiplantform.site/wallet',
  keys: import.meta.env.VITE_NEW_API_KEYS || 'https://www.aiplantform.site/keys',
};

/**
 * OAuth 响应类型
 */
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}
