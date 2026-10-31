import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

// One shared connection pool for the whole app. Opening a new connection
// per request would be slow, so connections are reused.
//
// Supabase requires TLS. rejectUnauthorized is false because Supabase's
// pooler certificate is not in Node's default trust store; the connection
// is still encrypted.
export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// An idle client can error (for example when the database restarts).
// Without this listener the process would crash with an unhandled event.
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client:', err.message);
});

// Parameterised query helper. Every value goes in `params` ($1, $2, ...)
// and is never concatenated into the SQL string, which prevents SQL injection.
export function query(text, params) {
  return pool.query(text, params);
}
