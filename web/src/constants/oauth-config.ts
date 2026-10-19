const defaultOrigin =
  typeof window === 'undefined' ? 'http://localhost:5173' : window.location.origin;

export const OAUTH_CONFIG = {
  clientId: import.meta.env.VITE_OAUTH_CLIENT_ID || '',
  authorizationUrl: import.meta.env.VITE_OAUTH_AUTHORIZATION_URL || 'https://www.aiplantform.site/oauth/authorize',
  tokenUrl: import.meta.env.VITE_OAUTH_TOKEN_URL || 'https://www.aiplantform.site/api/oauth/token',
  redirectUri: import.meta.env.VITE_OAUTH_REDIRECT_URI || defaultOrigin + '/oauth/callback',
  scope: 'user:read',
};

export const NEW_API_LINKS = {
  home: 'https://www.aiplantform.site',
  wallet: 'https://www.aiplantform.site/wallet',
  keys: 'https://www.aiplantform.site/keys',
};
