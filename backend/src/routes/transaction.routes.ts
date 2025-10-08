import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  uploadReceipt,
  createTransactionFromReceipt,
  uploadTransactionHistory,
  createTransactionsFromHistory
} from '../controllers/transaction.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/upload-receipt', upload.single('receipt'), uploadReceipt);
router.post('/create-from-receipt', createTransactionFromReceipt);
router.post('/upload-history', upload.single('historyFile'), uploadTransactionHistory);
router.post('/create-from-history', createTransactionsFromHistory);

export default router;
