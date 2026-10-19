import { NEW_API_BASE_URL } from '@/constant/runtime-config';

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
 * 运行时 NEW_API_BASE_URL（config.js / 环境变量）优先；支持相对路径（如 "/" 生成 "/wallet"）。
 */
const runtimeBase = NEW_API_BASE_URL || import.meta.env.VITE_NEW_API_BASE_URL || '';
const base = runtimeBase ? runtimeBase.replace(/\/+$/, '') : 'https://www.aiplantform.site';

export const NEW_API_LINKS = {
  home: NEW_API_BASE_URL
    ? base
    : import.meta.env.VITE_NEW_API_HOME || base,
  wallet: NEW_API_BASE_URL
    ? `${base}/wallet`
    : import.meta.env.VITE_NEW_API_WALLET || `${base}/wallet`,
  keys: NEW_API_BASE_URL
    ? `${base}/keys`
    : import.meta.env.VITE_NEW_API_KEYS || `${base}/keys`,
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
