import 'dotenv/config';
import { z } from 'zod';

// All configuration is read and validated once, here. The rest of the app
// imports `env` instead of touching process.env, so a missing or malformed
// variable stops the server at startup with a clear message.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  DATABASE_URL: z
    .string({ required_error: 'DATABASE_URL is required' })
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL must be a PostgreSQL connection string'),
  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required' })
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('8h'),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('Copy backend/.env.example to backend/.env and fill in the values.');
  process.exit(1);
}

const config = result.data;

// CLIENT_URL may hold several comma-separated origins (local + deployed).
// Trailing slashes are removed because browsers send origins without them.
const clientOrigins = config.CLIENT_URL.split(',')
  .map((origin) => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

export const env = {
  nodeEnv: config.NODE_ENV,
  isProduction: config.NODE_ENV === 'production',
  port: config.PORT,
  databaseUrl: config.DATABASE_URL,
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  bcryptSaltRounds: config.BCRYPT_SALT_ROUNDS,
  clientOrigins,
};
