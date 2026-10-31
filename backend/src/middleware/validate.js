import { AppError } from '../utils/AppError.js';

// Validates part of the request (body, query or params) against a zod schema.
// On success the cleaned data is available as req.validated[source].
// Controllers read from req.validated, never from the raw req.body,
// so only checked and trimmed values are ever used.
//
//   router.post('/', validate(createInquirySchema), controller);
//   router.get('/', validate(listQuerySchema, 'query'), controller);
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      throw new AppError('Validation failed', 400, errors);
    }

    req.validated = { ...req.validated, [source]: result.data };
    next();
  };
}
