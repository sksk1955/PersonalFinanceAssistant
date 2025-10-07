import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { Category, TransactionType } from '../models/Category';
import { extractReceiptData, extractTransactionHistory } from '../services/tesseract-ocr.service';

interface AuthRequest extends Request {
  userId?: string;
}

export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type, categoryId, date, description } = req.body;

    // Validation
    if (!amount || !type || !categoryId || !date) {
      res.status(400).json({ error: 'Amount, type, category, and date are required' });
      return;
    }

    if (!Object.values(TransactionType).includes(type)) {
      res.status(400).json({ error: 'Invalid transaction type' });
      return;
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      res.status(400).json({ error: 'Category not found' });
      return;
    }

    // Verify category type matches transaction type
    if (category.type !== type) {
      res.status(400).json({ error: 'Category type does not match transaction type' });
      return;
    }

    const transaction = await Transaction.create({
      amount: parseFloat(amount),
      type,
      categoryId,
      userId: req.userId,
      date: new Date(date),
      description
    });

    // Populate category for response
    await transaction.populate('categoryId', 'name type');

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
      categoryId
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { userId: req.userId };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    if (type && Object.values(TransactionType).includes(type as TransactionType)) {
      filter.type = type;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .populate({
        path: 'categoryId',
        select: 'name type',
        // Handle case where category is deleted
        options: { strictPopulate: false }
      })
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Transform transactions to ensure category data is always available
    const transformedTransactions = transactions.map(transaction => {
      const transactionObj = transaction.toObject();
      return {
        ...transactionObj,
        // Ensure category is always an object with name and type
        category: transactionObj.categoryId || {
          _id: 'unknown',
          name: 'Unknown Category',
          type: transactionObj.type
        },
        // Keep original categoryId for reference
        categoryId: transactionObj.categoryId?._id || transactionObj.categoryId
      };
    });

    // Get total count
    const total = await Transaction.countDocuments(filter);

    console.log('📄 Returning transactions:', transformedTransactions.length);
    console.log('📄 Sample transaction:', transformedTransactions[0] ? {
      id: transformedTransactions[0]._id,
      category: transformedTransactions[0].category,
      amount: transformedTransactions[0].amount
    } : 'No transactions');

    res.json({
      transactions: transformedTransactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOne({
      _id: id,
      userId: req.userId
    }).populate({
      path: 'categoryId',
      select: 'name type',
      options: { strictPopulate: false }
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    // Transform transaction similar to getTransactions
    const transactionObj = transaction.toObject();
    const transformedTransaction = {
      ...transactionObj,
      category: transactionObj.categoryId || {
        _id: 'unknown',
        name: 'Unknown Category',
        type: transactionObj.type
      },
      categoryId: transactionObj.categoryId?._id || transactionObj.categoryId
    };

    res.json(transformedTransaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, type, categoryId, date, description } = req.body;

    // If categoryId is provided, verify it exists and matches type
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        res.status(400).json({ error: 'Category not found' });
        return;
      }
      if (type && category.type !== type) {
        res.status(400).json({ error: 'Category type does not match transaction type' });
        return;
      }
    }

    const updateData: any = {};
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (type) updateData.type = type;
    if (categoryId) updateData.categoryId = categoryId;
    if (date) updateData.date = new Date(date);
    if (description !== undefined) updateData.description = description;

    const transaction = await Transaction.findOneAndUpdate(
      { _id: id, userId: req.userId },
      updateData,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name type');

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.userId
    });

    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const uploadReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract data from receipt
    const extractedData = await extractReceiptData(filePath, mimeType);

    res.json({
      message: 'Receipt processed successfully',
      data: extractedData
    });
  } catch (error) {
    console.error('Upload receipt error:', error);
    res.status(500).json({ error: 'Failed to process receipt' });
  }
};

export const createTransactionFromReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { extractedData, userInputs } = req.body;
    
    if (!extractedData || !extractedData.amount) {
      res.status(400).json({ error: 'Invalid extracted data' });
      return;
    }

    // Merge extracted data with user inputs, prioritizing user inputs
    const transactionData = {
      type: userInputs?.type || 'EXPENSE',
      amount: userInputs?.amount || extractedData.amount || extractedData.total,
      date: userInputs?.date || extractedData.date || new Date().toISOString(),
      description: userInputs?.description || buildDescription(extractedData),
      categoryId: userInputs?.categoryId, // This must be provided by user
      userId: req.userId,
      metadata: {
        source: 'receipt',
        confidence: extractedData.confidence,
        merchant: extractedData.merchant,
        receiptNumber: extractedData.receiptNumber,
        items: extractedData.items,
        subtotal: extractedData.subtotal,
        tax: extractedData.tax,
        tip: extractedData.tip
      }
    };

    if (!transactionData.categoryId) {
      res.status(400).json({ error: 'Category must be selected' });
      return;
    }

    const transaction = new Transaction(transactionData);
    await transaction.save();
    
    // Populate category for response
    await transaction.populate('categoryId');

    res.status(201).json({
      message: 'Transaction created successfully from receipt',
      transaction
    });
  } catch (error) {
    console.error('Create transaction from receipt error:', error);
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Helper function to build description from extracted data
const buildDescription = (extractedData: any): string => {
  const parts: string[] = [];
  
  if (extractedData.merchant) {
    parts.push(extractedData.merchant);
  }
  
  if (extractedData.receiptNumber) {
    parts.push(`Receipt #${extractedData.receiptNumber}`);
  }
  
  if (extractedData.items && extractedData.items.length > 0) {
    const itemCount = extractedData.items.length;
    parts.push(`${itemCount} item${itemCount > 1 ? 's' : ''}`);
  }
  
  return parts.length > 0 ? parts.join(' - ') : 'Receipt transaction';
};

export const uploadTransactionHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;

    // Extract transaction history using Tesseract OCR
    const extractedHistory = await extractTransactionHistory(filePath, mimeType);

    res.json({
      message: 'Transaction history processed successfully',
      data: extractedHistory
    });
  } catch (error) {
    console.error('Upload transaction history error:', error);
    res.status(500).json({ error: 'Failed to process transaction history' });
  }
};

export const createTransactionsFromHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { transactions, categoryMappings } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      res.status(400).json({ error: 'Invalid transaction data' });
      return;
    }

    const createdTransactions: any[] = [];
    const errors: string[] = [];

    console.log('Creating transactions from history:', {
      transactionCount: transactions.length,
      categoryMappings,
      userId: req.userId
    });

    for (let i = 0; i < transactions.length; i++) {
      const txn = transactions[i];
      let categoryId: mongoose.Types.ObjectId | null = null;
      
      try {
        // Apply category mapping if provided
        if (categoryMappings && categoryMappings[i]) {
          categoryId = new mongoose.Types.ObjectId(categoryMappings[i]);
        } else {
          // Try to find a default category for the transaction type
          const defaultCategory = await Category.findOne({ 
            type: txn.type.toUpperCase() as TransactionType
          });
          if (defaultCategory) {
            categoryId = defaultCategory._id;
          }
        }

        if (!categoryId) {
          errors.push(`Transaction ${i + 1}: No category specified`);
          continue;
        }

        const transaction = await Transaction.create({
          amount: parseFloat(txn.amount),
          type: txn.type.toUpperCase() as TransactionType,
          categoryId,
          userId: req.userId,
          date: new Date(txn.date),
          description: txn.description
        });

        // Populate category for response
        await transaction.populate('categoryId', 'name type');
        createdTransactions.push(transaction);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating transaction ${i + 1}:`, {
          transaction: txn,
          error: errorMessage,
          categoryId
        });
        errors.push(`Transaction ${i + 1}: ${errorMessage}`);
      }
    }

    res.json({
      message: `Successfully created ${createdTransactions.length} transactions`,
      data: {
        created: createdTransactions,
        errors: errors,
        summary: {
          total: transactions.length,
          created: createdTransactions.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Create transactions from history error:', error);
    res.status(500).json({ error: 'Failed to create transactions' });
  }
};
