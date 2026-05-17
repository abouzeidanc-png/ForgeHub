import type { AuthSession } from "../types/auth";

const SESSION_KEY = "forgehub.admin.session";

export function readSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthSession) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: AuthSession) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function getAccessToken() {
  return readSession()?.accessToken ?? null;
}
