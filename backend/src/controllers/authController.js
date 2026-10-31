import { loginAdmin } from '../services/authService.js';

// POST /api/auth/login (public)
export async function login(req, res) {
  const { token, admin } = await loginAdmin(req.validated.body);
  res.json({ success: true, data: { token, admin } });
}

// GET /api/auth/me (admin only)
// The frontend calls this on page load to check a stored token is still valid.
export function getCurrentAdmin(req, res) {
  res.json({ success: true, data: { admin: req.admin } });
}
