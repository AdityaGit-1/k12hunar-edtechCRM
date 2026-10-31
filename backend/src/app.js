import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Render (and most hosts) put a reverse proxy in front of the app.
// Trusting it lets rate limiting see the real client IP.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
// Inquiry and login payloads are tiny, so a small limit is plenty.
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { service: 'hunardesk-api', status: 'ok', timestamp: new Date().toISOString() },
  });
});

// Route modules (inquiries, auth, admin) are mounted here in Batch 2.

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
