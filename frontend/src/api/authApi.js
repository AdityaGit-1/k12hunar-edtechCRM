import { apiRequest } from './client.js';

// POST /api/auth/login (public). Resolves with { token, admin }.
export function loginAdmin({ email, password }) {
  return apiRequest('/api/auth/login', { method: 'POST', body: { email, password } });
}

// GET /api/auth/me (Bearer). Resolves with { admin }. Used to check a stored token on page load.
export function fetchCurrentAdmin() {
  return apiRequest('/api/auth/me', { auth: true });
}
