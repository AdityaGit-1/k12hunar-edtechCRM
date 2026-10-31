// The admin's JWT lives in localStorage under one key. It is sent to the API as
// "Authorization: Bearer <token>" (see api/client.js). Logging out must call
// clearToken(). Storage can throw (private mode, blocked site data),
// so every access is wrapped and fails quietly.

const TOKEN_KEY = 'hunardesk_token';

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Without storage the admin simply has to log in again after a refresh.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Nothing to clear.
  }
}
