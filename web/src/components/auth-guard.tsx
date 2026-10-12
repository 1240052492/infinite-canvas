import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { redirectToAuthorize } from '../services/oauth';
import { useAuthStore } from '../stores/use-auth-store';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    // Save the current path to redirect back after login
    sessionStorage.setItem('auth_redirect', location.pathname + location.search);
    redirectToAuthorize();
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>正在跳转到登录页...</h2>
      </div>
    );
  }

  return <>{children}</>;
}
