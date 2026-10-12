import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken, getAndClearState } from "@/services/oauth";
import { useAuthStore } from "@/stores/use-auth-store";

export function OAuthCallback() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const storedState = getAndClearState();

      if (!code) {
        setError("Missing authorization code");
        return;
      }

      if (!state || state !== storedState) {
        setError("Invalid state parameter");
        return;
      }

      try {
        const tokenResponse = await exchangeCodeForToken(code);
        setAuth(tokenResponse.access_token, tokenResponse.expires_in);
        navigate("/", { replace: true });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Token exchange failed");
      }
    };

    handleCallback();
  }, [navigate, setAuth]);

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Authentication Error</h1>
        <p>{error}</p>
        <button onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <p>Completing authentication...</p>
    </div>
  );
}
