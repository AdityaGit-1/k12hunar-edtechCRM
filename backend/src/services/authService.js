import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { toAdminDto } from '../utils/formatters.js';

// When the email is unknown we still run bcrypt.compare against this hash.
// Otherwise "unknown email" would respond noticeably faster than
// "wrong password", which would let an attacker discover which emails
// belong to admins.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', env.bcryptSaltRounds);

const JWT_ALGORITHM = 'HS256';

export function signToken(admin) {
  return jwt.sign({ email: admin.email }, env.jwtSecret, {
    subject: admin.id,
    expiresIn: env.jwtExpiresIn,
    algorithm: JWT_ALGORITHM,
  });
}

// Throws if the token is expired, tampered with, or signed with another secret.
// Pinning the algorithm stops tokens that claim a different (e.g. "none") algorithm.
export function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret, { algorithms: [JWT_ALGORITHM] });
}

export async function getAdminById(id) {
  const { rows } = await query('SELECT id, name, email FROM admins WHERE id = $1', [id]);
  return rows[0] ? toAdminDto(rows[0]) : null;
}

export async function loginAdmin({ email, password }) {
  const { rows } = await query(
    'SELECT id, name, email, password_hash FROM admins WHERE email = $1',
    [email]
  );
  const admin = rows[0];

  const passwordMatches = await bcrypt.compare(password, admin ? admin.password_hash : DUMMY_HASH);

  // Same message for "no such admin" and "wrong password" on purpose.
  if (!admin || !passwordMatches) {
    throw new AppError('Invalid email or password', 401);
  }

  return { token: signToken(admin), admin: toAdminDto(admin) };
}
