import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOAuthCallbackGuard, exchangeCodeForToken, getAndClearCodeVerifier, getAndClearState } from '@/services/oauth';
import { useAuthStore } from '@/stores/use-auth-store';

export function OAuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const callbackGuard = useRef(createOAuthCallbackGuard());

  useEffect(() => {
    if (!callbackGuard.current()) return;

    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const savedState = getAndClearState();
        const codeVerifier = getAndClearCodeVerifier();

        if (!code) {
          setError('缺少授权码');
          return;
        }

        if (!state || state !== savedState) {
          setError('无效的 state 参数');
          return;
        }

        if (!codeVerifier) {
          setError('缺少 PKCE verifier');
          return;
        }

        const tokenResponse = await exchangeCodeForToken(code, codeVerifier);
        setToken({
          token: tokenResponse.access_token,
          expiresIn: tokenResponse.expires_in,
        });

        // Redirect to original location or home
        const redirectPath = sessionStorage.getItem('auth_redirect') || '/';
        sessionStorage.removeItem('auth_redirect');
        navigate(redirectPath, { replace: true });
      } catch (err) {
        console.error('OAuth callback failed');
        setError('登录失败，请重试');
      }
    };

    handleCallback();
  }, [navigate, setToken]);

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>登录失败</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>返回首页</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>正在登录...</h2>
    </div>
  );
}
