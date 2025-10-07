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
    const { year, startDate, endDate } = req.query;

    let startOfPeriod: Date;
    let endOfPeriod: Date;

    if (startDate && endDate) {
      startOfPeriod = new Date(startDate as string);
      endOfPeriod = new Date(endDate as string);
    } else {
      const targetYear = year || new Date().getFullYear();
      startOfPeriod = new Date(`${targetYear}-01-01`);
      endOfPeriod = new Date(`${targetYear}-12-31`);
    }

    const monthlyTrends = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: startOfPeriod, $lte: endOfPeriod }
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

    // If filtering by specific date range, return daily data instead of monthly for short periods
    if (startDate && endDate) {
      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);
      const daysDiff = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff <= 31) {
        // For periods <= 31 days, return daily data
        const dailyData = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.userId),
              date: { $gte: startOfPeriod, $lte: endOfPeriod }
            }
          },
          {
            $group: {
              _id: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                type: '$type'
              },
              amount: { $sum: '$amount' }
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

        const result = dailyData.map(item => ({
          month: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          income: item.income || 0,
          expenses: item.expenses || 0
        }));

        res.json(result);
        return;
      }
    }

    // For longer periods, show monthly data
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
