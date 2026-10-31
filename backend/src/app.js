import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import inquiryRoutes from './routes/inquiryRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminInquiryRoutes from './routes/adminInquiryRoutes.js';

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

app.use('/api/inquiries', inquiryRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin/inquiries', adminInquiryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
