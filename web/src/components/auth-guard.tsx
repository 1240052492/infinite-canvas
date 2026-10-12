import { useEffect } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { redirectToAuthorize, isTokenExpired } from "@/services/oauth";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { accessToken, expiresAt, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!accessToken || !expiresAt) {
      redirectToAuthorize();
      return;
    }

    if (isTokenExpired(expiresAt)) {
      redirectToAuthorize();
      return;
    }
  }, [accessToken, expiresAt]);

  if (!isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
}
