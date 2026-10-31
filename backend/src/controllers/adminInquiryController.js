import {
  listInquiries,
  getInquiryById,
  getInquiryStats,
  updateInquiryStatus,
} from '../services/inquiryService.js';

// GET /api/admin/inquiries
export async function listAllInquiries(req, res) {
  const data = await listInquiries(req.validated.query);
  res.json({ success: true, data });
}

// GET /api/admin/inquiries/stats
export async function getStats(req, res) {
  const stats = await getInquiryStats();
  res.json({ success: true, data: { stats } });
}

// GET /api/admin/inquiries/:id
export async function getInquiry(req, res) {
  const inquiry = await getInquiryById(req.validated.params.id);
  res.json({ success: true, data: { inquiry } });
}

// PATCH /api/admin/inquiries/:id/status
export async function changeInquiryStatus(req, res) {
  const inquiry = await updateInquiryStatus(req.validated.params.id, req.validated.body.status);
  res.json({ success: true, message: 'Status updated', data: { inquiry } });
}
