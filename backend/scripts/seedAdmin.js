// Creates an admin account, or resets the password if the email already exists.
//
// Usage (from the backend folder):
//   1. Set ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env
//   2. npm run seed:admin
//
// There is no public "sign up" endpoint on purpose: only people with access
// to the server and database can create admins.

import bcrypt from 'bcrypt';
import { z } from 'zod';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/db.js';

const adminSchema = z.object({
  ADMIN_NAME: z.string().trim().min(2, 'ADMIN_NAME must be at least 2 characters').max(100),
  ADMIN_EMAIL: z.string().trim().email('ADMIN_EMAIL must be a valid email').toLowerCase(),
  // bcrypt only uses the first 72 bytes of a password, hence the upper limit.
  ADMIN_PASSWORD: z
    .string()
    .min(8, 'ADMIN_PASSWORD must be at least 8 characters')
    .max(72, 'ADMIN_PASSWORD must be at most 72 characters'),
});

async function seedAdmin() {
  const parsed = adminSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Cannot create admin. Fix these in backend/.env:');
    for (const issue of parsed.error.issues) {
      console.error(`  - ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = parsed.data;
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, env.bcryptSaltRounds);

  const { rows } = await pool.query(
    `INSERT INTO admins (name, email, password_hash)
     VALUES ($1, $2, $3)
     ON CONFLICT (email)
     DO UPDATE SET name = EXCLUDED.name, password_hash = EXCLUDED.password_hash
     RETURNING id, email, (xmax = 0) AS created`,
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash]
  );

  const { email, created } = rows[0];
  console.log(created ? `Admin created: ${email}` : `Admin already existed, password updated: ${email}`);
}

seedAdmin()
  .catch((err) => {
    console.error('Failed to create admin:', err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
