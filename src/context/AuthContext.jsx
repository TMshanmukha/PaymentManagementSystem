import { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '../services/auth.service.js';
import { api, setAccessToken, registerAuthFailureHandler } from '../config/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we attempt silent refresh on load

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerAuthFailureHandler(clearSession);
  }, [clearSession]);

  // On app load, try to silently refresh using the HTTP-only cookie so a
  // page reload doesn't force a re-login.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.data.accessToken);
        const me = await authApi.me();
        if (!cancelled) setUser(me.data.data);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const { data } = await authApi.login(credentials);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
