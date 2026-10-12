export const OAUTH_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID || "",
  AUTHORIZE_URL: import.meta.env.VITE_OAUTH_AUTHORIZE_URL || "",
  TOKEN_URL: import.meta.env.VITE_OAUTH_TOKEN_URL || "",
  REDIRECT_URI: import.meta.env.VITE_OAUTH_REDIRECT_URI || "",
};

export const NEW_API_LINKS = {
  HOME: import.meta.env.VITE_NEW_API_HOME || "",
  WALLET: import.meta.env.VITE_NEW_API_WALLET || "",
  KEYS: import.meta.env.VITE_NEW_API_KEYS || "",
};

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}
