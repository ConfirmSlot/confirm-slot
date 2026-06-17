import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token,       setToken]       = useState(() => localStorage.getItem('cs_token') || null);
  const [user,        setUser]        = useState(() => {
    try { return JSON.parse(localStorage.getItem('cs_user') || 'null'); } catch { return null; }
  });
  const [authChecked, setAuthChecked] = useState(false);
  const onUnauthorizedRef             = useRef(null);

  // On mount — verify stored token is still valid
  useEffect(() => {
    if (!token) { setAuthChecked(true); return; }
    fetch(`${API_BASE_URL}/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        return r.json();
      })
      .then(data => {
        if (data?.success && data.phoneNo) {
          // Refresh user data from backend
          setUser(prev => ({ ...prev, ...data }));
          localStorage.setItem('cs_user', JSON.stringify({ ...user, ...data }));
        }
      })
      .catch(() => { /* network error — keep session, will fail on next API call */ })
      .finally(() => setAuthChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('cs_token', newToken);
    localStorage.setItem('cs_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Central fetch wrapper — auto-handles 401
  const apiFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (res.status === 401) {
      clearSession();
      // Trigger redirect via the ref callback set by ProtectedRoute
      if (onUnauthorizedRef.current) onUnauthorizedRef.current();
      throw new Error('SESSION_EXPIRED');
    }

    return res;
  }, [token, clearSession]);

  return (
    <AuthContext.Provider value={{
      token, user, login, logout,
      isLoggedIn: !!token,
      authChecked,
      apiFetch,
      onUnauthorizedRef,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
