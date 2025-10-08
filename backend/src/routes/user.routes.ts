import { Router } from 'express';
import {
  getUserProfile,
  updateUserProfile,
  getSupportedCurrencies,
  convertCurrency
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication except currency info
router.get('/profile', authenticateToken, getUserProfile);
router.put('/profile', authenticateToken, updateUserProfile);
router.get('/currencies', getSupportedCurrencies);
router.post('/convert-currency', convertCurrency);

export default router;