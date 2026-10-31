import { z } from 'zod';
import { USER_TYPES, CATEGORIES, STATUSES } from '../constants/inquiry.js';

// Treat an empty string as "not provided". The dashboard sends
// ?category= when the filter is set to "All".
const emptyToUndefined = (value) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

function requiredText(label, { min, max }) {
  return z
    .string({ required_error: `${label} is required`, invalid_type_error: `${label} must be text` })
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label} must be at least ${min} characters`)
    .max(max, `${label} must be at most ${max} characters`);
}

// ---------- POST /api/inquiries ----------
export const createInquirySchema = z.object({
  userType: z.enum(USER_TYPES, {
    errorMap: () => ({ message: 'Please select who you are' }),
  }),
  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  name: requiredText('Name', { min: 2, max: 100 }).regex(
    /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u,
    'Name can only contain letters, spaces, apostrophes, dots and hyphens'
  ),
  email: requiredText('Email', { min: 5, max: 255 })
    .email('Enter a valid email address')
    .toLowerCase(),
  phone: requiredText('Phone number', { min: 7, max: 20 })
    .regex(/^\+?[0-9\s\-()]+$/, 'Enter a valid phone number')
    .refine((value) => {
      const digits = value.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 15;
    }, 'Phone number must contain 10 to 15 digits'),
  message: requiredText('Message', { min: 10, max: 2000 }),
});

// ---------- GET /api/admin/inquiries ----------
export const listInquiriesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  category: z.preprocess(emptyToUndefined, z.enum(CATEGORIES).optional()),
  userType: z.preprocess(emptyToUndefined, z.enum(USER_TYPES).optional()),
  status: z.preprocess(emptyToUndefined, z.enum(STATUSES).optional()),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
});

// ---------- PATCH /api/admin/inquiries/:id/status ----------
export const inquiryIdParamSchema = z.object({
  id: z.string().uuid('Invalid inquiry id'),
});

export const updateStatusSchema = z.object({
  status: z.enum(STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${STATUSES.join(', ')}` }),
  }),
});
