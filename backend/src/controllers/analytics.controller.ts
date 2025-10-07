import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { TransactionType } from '../models/Category';

interface AuthRequest extends Request {
  userId?: string;
}

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    const dateFilter: any = { userId: req.userId };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate as string);
      if (endDate) dateFilter.date.$lte = new Date(endDate as string);
    }

    // Aggregate financial data
    const summary = await Transaction.aggregate([
      { $match: { ...dateFilter, userId: new mongoose.Types.ObjectId(req.userId) } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Process results
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    summary.forEach(item => {
      if (item._id === TransactionType.INCOME) {
        totalIncome = item.total;
        incomeCount = item.count;
      } else if (item._id === TransactionType.EXPENSE) {
        totalExpenses = item.total;
        expenseCount = item.count;
      }
    });

    const balance = totalIncome - totalExpenses;
    const totalTransactions = incomeCount + expenseCount;

    res.json({
      income: totalIncome,
      expense: totalExpenses,
      balance,
      transactionCount: totalTransactions,
      incomeCount,
      expenseCount
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getExpensesByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = { 
      userId: new mongoose.Types.ObjectId(req.userId),
      type: TransactionType.EXPENSE
    };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate as string);
      if (endDate) dateFilter.date.$lte = new Date(endDate as string);
    }

    const expensesByCategory = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: 'categories',
          localField: 'categoryId',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$categoryId',
          categoryName: { $first: '$category.name' },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { amount: -1 } }
    ]);

    res.json(expensesByCategory);
  } catch (error) {
    console.error('Get expenses by category error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransactionsByDate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter: any = { userId: new mongoose.Types.ObjectId(req.userId) };
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate as string);
      if (endDate) dateFilter.date.$lte = new Date(endDate as string);
    }

    const transactionsByDate = await Transaction.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', TransactionType.INCOME] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', TransactionType.EXPENSE] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(transactionsByDate);
  } catch (error) {
    console.error('Get transactions by date error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getMonthlyTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year = new Date().getFullYear() } = req.query;

    const startOfYear = new Date(`${year}-01-01`);
    const endOfYear = new Date(`${year}-12-31`);

    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: startOfYear, $lte: endOfYear }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type'
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: '$_id.month',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', TransactionType.INCOME] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', TransactionType.EXPENSE] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing months with 0 values
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const result = monthNames.map((month, index) => {
      const monthData = monthlyTrends.find(item => item._id === index + 1);
      return {
        month,
        income: monthData?.income || 0,
        expenses: monthData?.expenses || 0
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get monthly trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
