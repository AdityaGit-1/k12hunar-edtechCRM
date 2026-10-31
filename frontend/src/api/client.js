import { getToken, clearToken } from '../lib/authStorage.js';

// Fired when a protected request is rejected with 401, so AuthContext can log the
// admin out of the UI (the token itself is already cleared below).
export const UNAUTHORIZED_EVENT = 'hunardesk:unauthorized';

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/+$/, '');

// Thrown for every failed request, so components only need one catch block.
//   status       HTTP status, or 0 when the server could not be reached
//   fieldErrors  [{ field, message }] from the API's validation errors
export class ApiError extends Error {
  constructor(message, status, fieldErrors = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

// Small wrapper around fetch for the HunarDesk API.
//   auth    true for protected routes: adds "Authorization: Bearer <token>"
//   params  query string values; empty ones are left out
// Resolves with the response's `data` field, or throws ApiError.
export async function apiRequest(path, { method = 'GET', body, params, auth = false } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  }
  const queryString = searchParams.toString();
  const url = `${API_URL}${path}${queryString ? `?${queryString}` : ''}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  // The API always answers with JSON, but a proxy or crash page might not.
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    // A rejected token on a protected route means the session is over.
    if (response.status === 401 && auth) {
      clearToken();
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }

    throw new ApiError(
      payload?.message ?? 'Something went wrong. Please try again.',
      response.status,
      payload?.errors ?? []
    );
  }

  return payload?.data ?? null;
}
