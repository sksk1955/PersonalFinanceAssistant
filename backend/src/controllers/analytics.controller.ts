import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { TransactionType } from '../models/Category';
import { User } from '../models/User';
import { currencyService } from '../services/currency.service';

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

export const getWeeklyTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { weeks = 12 } = req.query;
    const weeksBack = parseInt(weeks as string);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (weeksBack * 7));

    const weeklyData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            week: { $week: '$date' },
            year: { $year: '$date' },
            type: '$type'
          },
          amount: { $sum: '$amount' }
        }
      },
      {
        $group: {
          _id: { week: '$_id.week', year: '$_id.year' },
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
      { $sort: { '_id.year': 1, '_id.week': 1 } },
      { $limit: weeksBack }
    ]);

    const result = weeklyData.map((item, index) => ({
      week: `Week ${item._id.week}`,
      weekNum: index + 1,
      income: item.income || 0,
      expenses: item.expenses || 0,
      net: (item.income || 0) - (item.expenses || 0)
    }));

    res.json(result);
  } catch (error) {
    console.error('Get weekly trends error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDailyPatterns = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { days = 30 } = req.query;
    const daysBack = parseInt(days as string);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const dailyData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: '$date' },
            type: '$type'
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.dayOfWeek',
          income: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', TransactionType.INCOME] }, '$amount', 0]
            }
          },
          expenses: {
            $sum: {
              $cond: [{ $eq: ['$_id.type', TransactionType.EXPENSE] }, '$amount', 0]
            }
          },
          transactions: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = dayNames.map((day, index) => {
      const dayData = dailyData.find(item => item._id === index + 1);
      return {
        day,
        income: dayData?.income || 0,
        expenses: dayData?.expenses || 0,
        transactions: dayData?.transactions || 0,
        net: (dayData?.income || 0) - (dayData?.expenses || 0)
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get daily patterns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSpendingHeatmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { months = 12 } = req.query;
    const monthsBack = parseInt(months as string);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const heatmapData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          type: TransactionType.EXPENSE,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            day: { $dayOfMonth: '$date' },
            month: { $month: '$date' },
            year: { $year: '$date' }
          },
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          amount: 1,
          count: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json(heatmapData);
  } catch (error) {
    console.error('Get spending heatmap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransactionVolume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = 'week', periods = 12 } = req.query;
    const periodsCount = parseInt(periods as string);
    
    let groupBy: any;
    let sortKey: string;
    let periodName: string;
    
    if (period === 'week') {
      groupBy = {
        week: { $week: '$date' },
        year: { $year: '$date' }
      };
      sortKey = 'week';
      periodName = 'Week';
    } else if (period === 'month') {
      groupBy = {
        month: { $month: '$date' },
        year: { $year: '$date' }
      };
      sortKey = 'month';
      periodName = 'Month';
    } else {
      // Daily
      groupBy = {
        day: { $dayOfMonth: '$date' },
        month: { $month: '$date' },
        year: { $year: '$date' }
      };
      sortKey = 'day';
      periodName = 'Day';
    }

    const endDate = new Date();
    const startDate = new Date();
    
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - (periodsCount * 7));
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - periodsCount);
    } else {
      startDate.setDate(startDate.getDate() - periodsCount);
    }

    const volumeData = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: groupBy,
          transactionCount: { $sum: 1 },
          totalVolume: { $sum: '$amount' },
          incomeVolume: {
            $sum: {
              $cond: [{ $eq: ['$type', TransactionType.INCOME] }, '$amount', 0]
            }
          },
          expenseVolume: {
            $sum: {
              $cond: [{ $eq: ['$type', TransactionType.EXPENSE] }, '$amount', 0]
            }
          }
        }
      },
      {
        $addFields: {
          avgAmount: { $divide: ['$totalVolume', '$transactionCount'] }
        }
      },
      { $sort: { [`_id.year`]: 1, [`_id.${sortKey}`]: 1 } },
      { $limit: periodsCount }
    ]);

    const result = volumeData.map((item, index) => {
      let periodLabel: string;
      
      if (period === 'week') {
        periodLabel = `${periodName} ${item._id.week}`;
      } else if (period === 'month') {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                           'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        periodLabel = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      } else {
        periodLabel = `${item._id.day}/${item._id.month}`;
      }
      
      return {
        period: periodLabel,
        transactionCount: item.transactionCount || 0,
        totalVolume: Math.round(item.totalVolume || 0),
        avgAmount: Math.round(item.avgAmount || 0),
        incomeVolume: Math.round(item.incomeVolume || 0),
        expenseVolume: Math.round(item.expenseVolume || 0)
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get transaction volume error:', error);
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
