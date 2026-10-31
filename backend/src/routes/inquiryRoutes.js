import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { inquiryLimiter } from '../middleware/rateLimiters.js';
import { createInquirySchema } from '../validators/inquiryValidators.js';
import { submitInquiry } from '../controllers/inquiryController.js';

const router = Router();

// Public: anyone can submit an inquiry.
router.post('/', inquiryLimiter, validate(createInquirySchema), submitInquiry);

export default router;
