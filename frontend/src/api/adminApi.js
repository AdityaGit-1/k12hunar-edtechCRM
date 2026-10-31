import { apiRequest } from './client.js';

// All of these call protected routes, so they send "Authorization: Bearer <token>".

// GET /api/admin/inquiries. Resolves with { inquiries, pagination }.
// params: { page, limit, category, userType, status, search } (empty values are skipped).
export function fetchInquiries(params) {
  return apiRequest('/api/admin/inquiries', { params, auth: true });
}

// GET /api/admin/inquiries/stats. Resolves with { stats }.
export function fetchInquiryStats() {
  return apiRequest('/api/admin/inquiries/stats', { auth: true });
}

// PATCH /api/admin/inquiries/:id/status. Resolves with { inquiry }.
export function updateInquiryStatus(id, status) {
  return apiRequest(`/api/admin/inquiries/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}
