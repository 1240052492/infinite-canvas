import { describe, it, expect, beforeEach, vi } from 'vitest';
import { OAUTH_CONFIG, NEW_API_LINKS } from '../config/oauth';
import { redirectToAuthorize, exchangeCodeForToken, isTokenExpired } from '../services/oauth-service';

describe('OAuth Integration Tests', () => {
  beforeEach(() => {
    // 清理 localStorage
    localStorage.clear();
    // 清理 location mock
    delete (window as any).location;
    (window as any).location = { href: '', assign: vi.fn() };
  });

  describe('OAuth Configuration', () => {
    it('should have valid OAuth configuration', () => {
      expect(OAUTH_CONFIG.clientId).toBeDefined();
      expect(OAUTH_CONFIG.authorizationUrl).toMatch(/^https?:\/\//);
      expect(OAUTH_CONFIG.tokenUrl).toMatch(/^https?:\/\//);
      expect(OAUTH_CONFIG.redirectUri).toMatch(/^https?:\/\//);
    });

    it('should have valid New-API links', () => {
      expect(NEW_API_LINKS.home).toMatch(/^https?:\/\//);
      expect(NEW_API_LINKS.wallet).toMatch(/^https?:\/\//);
      expect(NEW_API_LINKS.keys).toMatch(/^https?:\/\//);
    });
  });

  describe('OAuth Service', () => {
    describe('redirectToAuthorize', () => {
      it('should construct correct authorization URL', () => {
        const mockAssign = vi.fn();
        window.location.assign = mockAssign;

        redirectToAuthorize();

        expect(mockAssign).toHaveBeenCalled();
        const url = new URL(mockAssign.mock.calls[0][0]);
        expect(url.searchParams.get('client_id')).toBe(OAUTH_CONFIG.clientId);
        expect(url.searchParams.get('response_type')).toBe('code');
        expect(url.searchParams.get('redirect_uri')).toBe(OAUTH_CONFIG.redirectUri);
        expect(url.searchParams.get('state')).toBeTruthy();
      });

      it('should store state in localStorage', () => {
        const mockAssign = vi.fn();
        window.location.assign = mockAssign;

        redirectToAuthorize();

        const url = new URL(mockAssign.mock.calls[0][0]);
        const state = url.searchParams.get('state');
        expect(localStorage.getItem('oauth_state')).toBe(state);
      });
    });

    describe('isTokenExpired', () => {
      it('should return false for valid token', () => {
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        expect(isTokenExpired(futureTime)).toBe(false);
      });

      it('should return true for expired token', () => {
        const pastTime = Math.floor(Date.now() / 1000) - 3600;
        expect(isTokenExpired(pastTime)).toBe(true);
      });

      it('should return true for token expiring within buffer', () => {
        const nearFutureTime = Math.floor(Date.now() / 1000) + 200;
        expect(isTokenExpired(nearFutureTime)).toBe(true);
      });
    });
  });
});
