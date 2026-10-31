import rateLimit from 'express-rate-limit';

// Responds in the same JSON shape as every other error in the API.
function createLimiter({ windowMs, limit, message, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({ success: false, message });
    },
  });
}

// Public form: stops one visitor from flooding the database with spam.
export const inquiryLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: 'Too many inquiries submitted. Please try again in a few minutes.',
});

// Login: slows down password guessing. Successful logins are not counted,
// so a real admin is not locked out by their own valid sessions.
export const loginLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Too many failed login attempts. Please try again in 15 minutes.',
});
