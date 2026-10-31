import { apiRequest } from './client.js';

// POST /api/inquiries (public). Resolves with { id, createdAt }.
export function submitInquiry(values) {
  return apiRequest('/api/inquiries', { method: 'POST', body: values });
}
