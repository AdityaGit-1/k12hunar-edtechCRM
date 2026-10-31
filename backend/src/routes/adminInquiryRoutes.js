import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  listInquiriesQuerySchema,
  inquiryIdParamSchema,
  updateStatusSchema,
} from '../validators/inquiryValidators.js';
import {
  listAllInquiries,
  getStats,
  getInquiry,
  changeInquiryStatus,
} from '../controllers/adminInquiryController.js';

const router = Router();

// Every route in this file requires a valid admin token.
router.use(requireAuth);

router.get('/', validate(listInquiriesQuerySchema, 'query'), listAllInquiries);

// Must be declared before any "/:id" route, otherwise "stats" would be read as an id.
router.get('/stats', getStats);

router.get('/:id', validate(inquiryIdParamSchema, 'params'), getInquiry);

router.patch(
  '/:id/status',
  validate(inquiryIdParamSchema, 'params'),
  validate(updateStatusSchema),
  changeInquiryStatus
);

export default router;
