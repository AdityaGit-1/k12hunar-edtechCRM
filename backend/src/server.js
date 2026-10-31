import app from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

async function start() {
  // Fail fast with a readable message if the database is unreachable,
  // instead of failing later on the first request.
  try {
    await pool.query('SELECT 1');
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Could not connect to the database. Check DATABASE_URL in backend/.env.');
    console.error(err.message);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    console.log(`HunarDesk API running on port ${env.port} (${env.nodeEnv})`);
  });

  // Render sends SIGTERM on redeploy. Finish in-flight requests, then close the pool.
  function shutdown(signal) {
    console.log(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
