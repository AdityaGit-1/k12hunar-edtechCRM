import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { loginAdmin, fetchCurrentAdmin } from '../api/authApi.js';
import { UNAUTHORIZED_EVENT } from '../api/client.js';
import { getToken, setToken, clearToken } from '../lib/authStorage.js';

const AuthContext = createContext(null);

// Holds "who is logged in" for the whole app.
//   status: 'loading'          checking a stored token with the server
//           'authenticated'    admin is set
//           'unauthenticated'  nobody logged in
export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [status, setStatus] = useState(() => (getToken() ? 'loading' : 'unauthenticated'));

  // On first load: if a token is stored, ask the server whether it is still valid.
  useEffect(() => {
    if (!getToken()) return;

    let cancelled = false;
    fetchCurrentAdmin()
      .then((data) => {
        if (cancelled) return;
        setAdmin(data.admin);
        setStatus('authenticated');
      })
      .catch((error) => {
        if (cancelled) return;
        // 401 means the token is bad or expired (client.js already cleared it).
        // For any other failure (e.g. server asleep) we also start logged out; the admin can retry.
        if (error.status !== 401) clearToken();
        setAdmin(null);
        setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Any protected request that gets a 401 later (e.g. token expired) logs the admin out.
  useEffect(() => {
    function handleUnauthorized() {
      setAdmin(null);
      setStatus('unauthenticated');
    }
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
  }, []);

  const login = useCallback(async (credentials) => {
    const { token, admin: loggedInAdmin } = await loginAdmin(credentials);
    setToken(token);
    setAdmin(loggedInAdmin);
    setStatus('authenticated');
  }, []);

  // Logout is client-side only: the API is stateless, so deleting the token ends the session.
  const logout = useCallback(() => {
    clearToken();
    setAdmin(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ admin, status, login, logout }),
    [admin, status, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
