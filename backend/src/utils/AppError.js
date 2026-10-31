// An error we throw on purpose (bad input, wrong password, missing record).
// The error handler turns it into a JSON response with the right status code.
// Anything that is NOT an AppError is treated as an unexpected server error.
export class AppError extends Error {
  /**
   * @param {string} message  Safe, user-facing message.
   * @param {number} statusCode  HTTP status code.
   * @param {Array<{field: string, message: string}>} [details]  Per-field validation errors.
   */
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}
