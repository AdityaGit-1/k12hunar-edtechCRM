import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

// Every error response from this API has the same shape:
//   { success: false, message: string, errors?: [{ field, message }] }

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

// Express recognises error middleware by its four parameters,
// so `next` must stay in the signature even though it is unused.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Errors we threw on purpose
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.details && { errors: err.details }),
    });
  }

  // Errors raised by express.json()
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body is not valid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }

  // Anything else is unexpected. Log the details for us,
  // but never leak internals to the client.
  console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  return res.status(500).json({
    success: false,
    message: env.isProduction ? 'Something went wrong on our side' : err.message,
  });
}
