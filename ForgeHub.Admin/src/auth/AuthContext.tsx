import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "../api/authApi";
import { clearSession, readSession, saveSession } from "./tokenStorage";
import type { AuthSession } from "../types/auth";

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  login(email: string, password: string): Promise<{ ok: boolean; message?: string }>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onUnauthorized = () => {
      clearSession();
      setSession(null);
    };
    const onSessionRefreshed = () => setSession(readSession());
    window.addEventListener("forgehub:unauthorized", onUnauthorized);
    window.addEventListener("forgehub:session-refreshed", onSessionRefreshed);
    return () => {
      window.removeEventListener("forgehub:unauthorized", onUnauthorized);
      window.removeEventListener("forgehub:session-refreshed", onSessionRefreshed);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const next = await authApi.adminLogin({ email, password });
      saveSession(next);
      setSession(next);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error instanceof Error ? error.message : "Login failed." };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = session?.refreshToken;
    clearSession();
    setSession(null);
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Local cleanup is the reliable part; backend logout can fail if the token is already expired.
      }
    }
  }, [session]);

  const value = useMemo(() => ({ session, loading, login, logout }), [session, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
