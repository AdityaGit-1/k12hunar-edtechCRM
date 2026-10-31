import { createInquiry } from '../services/inquiryService.js';

// POST /api/inquiries (public)
export async function submitInquiry(req, res) {
  const inquiry = await createInquiry(req.validated.body);

  // The public form only needs confirmation, so internal
  // fields such as status are not sent back.
  res.status(201).json({
    success: true,
    message: 'Inquiry submitted successfully',
    data: { id: inquiry.id, createdAt: inquiry.createdAt },
  });
}
