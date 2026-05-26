import { useState, useCallback } from 'react';
import type { AuthState } from '@cadence/shared';

const AUTH_KEY = 'ft_auth';
const API_BASE = import.meta.env.VITE_API_URL ?? '';

function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useAuth() {
  const [auth, setAuthState] = useState<AuthState | null>(loadAuth);

  const saveAuth = (state: AuthState) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(state));
    setAuthState(state);
  };

  const clearAuth = () => {
    localStorage.removeItem(AUTH_KEY);
    setAuthState(null);
  };

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Login failed');
    }
    const data = await res.json() as AuthState;
    saveAuth(data);
    return data;
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error ?? 'Registration failed');
    }
    const data = await res.json() as AuthState;
    saveAuth(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  return { auth, login, register, logout };
}
