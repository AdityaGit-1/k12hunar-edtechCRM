import { USER_TYPE_OPTIONS, CATEGORY_OPTIONS } from './constants.js';

// These rules mirror backend/src/validators/inquiryValidators.js so a visitor
// sees problems immediately. The backend validates again regardless, because
// anyone can call the API without using this form.

export const MESSAGE_MAX_LENGTH = 2000;

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]+$/;

// Each rule gets the trimmed value and returns an error message, or null if valid.
const rules = {
  userType: (value) =>
    USER_TYPE_OPTIONS.some((option) => option.value === value) ? null : 'Please select who you are',

  category: (value) =>
    CATEGORY_OPTIONS.some((option) => option.value === value) ? null : 'Please select a category',

  name: (value) => {
    if (!value) return 'Name is required';
    if (value.length < 2) return 'Name must be at least 2 characters';
    if (value.length > 100) return 'Name must be at most 100 characters';
    if (!NAME_PATTERN.test(value)) {
      return 'Name can only contain letters, spaces, apostrophes, dots and hyphens';
    }
    return null;
  },

  email: (value) => {
    if (!value) return 'Email is required';
    if (value.length > 255) return 'Email must be at most 255 characters';
    if (!EMAIL_PATTERN.test(value)) return 'Enter a valid email address';
    return null;
  },

  phone: (value) => {
    if (!value) return 'Phone number is required';
    if (value.length > 20) return 'Phone number must be at most 20 characters';
    if (!PHONE_PATTERN.test(value)) return 'Enter a valid phone number';
    const digitCount = value.replace(/\D/g, '').length;
    if (digitCount < 10 || digitCount > 15) return 'Phone number must contain 10 to 15 digits';
    return null;
  },

  message: (value) => {
    if (!value) return 'Message is required';
    if (value.length < 10) return 'Message must be at least 10 characters';
    if (value.length > MESSAGE_MAX_LENGTH) {
      return `Message must be at most ${MESSAGE_MAX_LENGTH} characters`;
    }
    return null;
  },
};

// Order matters: it is the order fields appear in the form, which decides
// which invalid field receives focus first.
export const INQUIRY_FIELDS = ['userType', 'category', 'name', 'email', 'phone', 'message'];

export function validateField(field, rawValue) {
  return rules[field](String(rawValue ?? '').trim());
}

// Returns an object like { email: 'Enter a valid email address' }.
// An empty object means the whole form is valid.
export function validateInquiry(values) {
  const errors = {};
  for (const field of INQUIRY_FIELDS) {
    const error = validateField(field, values[field]);
    if (error) errors[field] = error;
  }
  return errors;
}
