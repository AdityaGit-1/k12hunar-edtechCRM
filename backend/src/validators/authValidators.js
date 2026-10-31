import { z } from 'zod';

// ---------- POST /api/auth/login ----------
// Only checks the shape of the input. Whether the credentials are
// correct is decided by the auth service.
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(1, 'Email is required')
    .max(255)
    .email('Enter a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});
