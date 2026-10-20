export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  expiresAt: number | null;
  /** Role value from the New API user account carried in the OAuth token claims. */
  role: number | null;
}

/** New API role threshold: 10 (admin) and above are administrators (root is 100). */
export const NEW_API_ADMIN_ROLE = 10;
