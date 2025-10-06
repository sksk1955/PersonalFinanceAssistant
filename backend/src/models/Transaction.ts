import mongoose, { Document, Schema } from 'mongoose';
import { TransactionType } from './Category';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  description?: string;
  date: Date;
  categoryId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiptUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Create compound indexes for better query performance
transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ categoryId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
