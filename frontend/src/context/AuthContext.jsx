import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

function getJwtPayload(token) {
  if (!token) return null;
  try {
    const [, payloadBase64] = token.split('.');
    if (!payloadBase64) return null;
    const payload = JSON.parse(atob(payloadBase64));
    return payload;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutTimer = useRef(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimer.current) {
      window.clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('fm_user');
    localStorage.removeItem('fm_token');
    clearLogoutTimer();
  }, [clearLogoutTimer]);

  const scheduleAutoLogout = useCallback(
    (jwtToken) => {
      clearLogoutTimer();
      const payload = getJwtPayload(jwtToken);
      if (!payload?.exp) return;

      const expiresAt = payload.exp * 1000;
      const delay = expiresAt - Date.now() - 5000;
      if (delay <= 0) {
        logout();
        return;
      }

      logoutTimer.current = window.setTimeout(() => {
        logout();
        window.location.href = '/auth/login';
      }, delay);
    },
    [clearLogoutTimer, logout],
  );

  useEffect(() => {
    const savedUser = localStorage.getItem('fm_user');
    const savedToken = localStorage.getItem('fm_token');

    if (savedUser && savedToken) {
      const payload = getJwtPayload(savedToken);
      if (payload?.exp && payload.exp * 1000 > Date.now()) {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
        setAuthToken(savedToken);
        scheduleAutoLogout(savedToken);
      } else {
        logout();
      }
    }

    setLoading(false);
  }, [logout, scheduleAutoLogout]);

  const login = useCallback(
    (userData, jwtToken) => {
      setUser(userData);
      setToken(jwtToken);
      setAuthToken(jwtToken);
      localStorage.setItem('fm_user', JSON.stringify(userData));
      localStorage.setItem('fm_token', jwtToken);
      scheduleAutoLogout(jwtToken);
    },
    [scheduleAutoLogout],
  );

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
