import { AppError } from '../utils/AppError.js';
import { verifyToken, getAdminById } from '../services/authService.js';

// Protects a route. This API uses Bearer tokens everywhere (no cookies).
// The client must send on every protected request:
//   Authorization: Bearer <jwt>
// Logout is handled by the client deleting its stored token; the server
// keeps no session. On success the admin is available as req.admin.
export async function requireAuth(req, res, next) {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new AppError('Authentication required', 401);
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError'
        ? 'Your session has expired. Please log in again.'
        : 'Invalid authentication token';
    throw new AppError(message, 401);
  }

  // Check the admin still exists, so deleting an admin
  // immediately revokes any token already issued to them.
  const admin = await getAdminById(payload.sub);
  if (!admin) {
    throw new AppError('Invalid authentication token', 401);
  }

  req.admin = admin;
  next();
}
