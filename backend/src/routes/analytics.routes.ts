import { Router } from 'express';
import {
  getSummary,
  getExpensesByCategory,
  getTransactionsByDate,
  getMonthlyTrends,
  getWeeklyTrends,
  getDailyPatterns,
  getSpendingHeatmap,
  getTransactionVolume
} from '../controllers/analytics.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/summary', getSummary);
router.get('/expenses-by-category', getExpensesByCategory);
router.get('/transactions-by-date', getTransactionsByDate);
router.get('/monthly-trends', getMonthlyTrends);
router.get('/weekly-trends', getWeeklyTrends);
router.get('/daily-patterns', getDailyPatterns);
router.get('/spending-heatmap', getSpendingHeatmap);
router.get('/transaction-volume', getTransactionVolume);

export default router;
