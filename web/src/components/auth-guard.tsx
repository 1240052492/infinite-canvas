import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { redirectToAuthorize, isTokenExpired } from "@/services/oauth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const token = useAuthStore((state) => state.token);
  const expiresAt = useAuthStore((state) => state.expiresAt);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!token || !expiresAt) {
      redirectToAuthorize();
      return;
    }

    if (isTokenExpired(expiresAt)) {
      redirectToAuthorize();
      return;
    }
  }, [token, expiresAt]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
