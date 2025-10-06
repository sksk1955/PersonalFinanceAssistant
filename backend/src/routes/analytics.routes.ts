import { Router } from 'express';
import {
  getSummary,
  getExpensesByCategory,
  getTransactionsByDate,
  getMonthlyTrends
} from '../controllers/analytics.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/transactions-by-date', getTransactionsByDate);
router.get('/monthly-trends', getMonthlyTrends);

export default router;
