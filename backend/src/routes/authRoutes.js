import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { loginLimiter } from '../middleware/rateLimiters.js';
import { loginSchema } from '../validators/authValidators.js';
import { login, getCurrentAdmin } from '../controllers/authController.js';

const router = Router();

router.post('/login', loginLimiter, validate(loginSchema), login);
router.get('/me', requireAuth, getCurrentAdmin);

export default router;
