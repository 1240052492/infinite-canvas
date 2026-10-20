import axios from "axios";
import { OAUTH_CONFIG } from "@/constants/oauth-config";
import { isTokenExpired, redirectToAuthorize } from "@/services/oauth";
import { useAuthStore } from "@/stores/use-auth-store";

// sessionStorage key read by the OAuth callback page to return the user to
// the page that triggered login.
export const AUTH_REDIRECT_KEY = "auth_redirect";

// Guard against silent-SSO redirect loops: when a redirect was attempted
// recently but the visitor came back without a token, stop retrying for a
// while and surface the explicit login prompt instead.
const SSO_ATTEMPT_KEY = "canvas.sso_attempt_at";
const SSO_RETRY_MS = 10 * 60 * 1000;

export function isAuthenticated(): boolean {
    const { token, expiresAt } = useAuthStore.getState();
    return Boolean(token && expiresAt && !isTokenExpired(expiresAt));
}

// Guest-mode gate: browsing is open to everyone, internal features require
// login. Returns true when authenticated; otherwise saves the current
// location for the OAuth callback, starts the authorization redirect, and
// returns false so callers can stop before doing work.
export function ensureAuthenticated(navigate: (url: string) => void = (url) => window.location.assign(url)): boolean {
    if (isAuthenticated()) return true;
    sessionStorage.setItem(AUTH_REDIRECT_KEY, `${window.location.pathname}${window.location.search}`);
    void redirectToAuthorize(navigate);
    return false;
}

export type PlatformSession = { authenticated: boolean; role?: number; username?: string };

let platformSessionPromise: Promise<PlatformSession> | null = null;

// One check per SPA session: reports whether a live New API dashboard
// session exists (cookie based). Platform-logged-in visitors can then be
// signed in to Canvas silently; true guests are never redirected.
//
// The request must target /api/user/auth/*, which is the path the console's
// refresh cookie is scoped to. Probing any other path sends no cookie, so the
// server can only ever answer "anonymous".
export function checkPlatformSession(): Promise<PlatformSession> {
    platformSessionPromise ??= axios
        .get<PlatformSession>(`${new URL(OAUTH_CONFIG.tokenUrl).origin}/api/user/auth/session-status`, {
            withCredentials: true,
        })
        .then((response) => response.data)
        .catch(() => ({ authenticated: false }));
    return platformSessionPromise;
}

export function shouldAttemptSilentSso(): boolean {
    try {
        const attemptedAt = Number(sessionStorage.getItem(SSO_ATTEMPT_KEY) || 0);
        return !(Number.isFinite(attemptedAt) && attemptedAt > 0 && Date.now() - attemptedAt < SSO_RETRY_MS);
    } catch {
        return true;
    }
}

export function markSilentSsoAttempt(): void {
    try {
        sessionStorage.setItem(SSO_ATTEMPT_KEY, String(Date.now()));
    } catch {
        /* storage unavailable; the redirect just may repeat */
    }
}

// Silent SSO: when the visitor is already logged in to the New API console,
// complete the OAuth authorization without any interaction and return to the
// current page. Callers must have verified the platform session first.
export function startSilentSso(): void {
    if (!shouldAttemptSilentSso()) return;
    markSilentSsoAttempt();
    ensureAuthenticated();
}
