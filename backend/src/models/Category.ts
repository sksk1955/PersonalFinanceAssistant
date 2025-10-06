import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: TransactionType;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Create compound index for better query performance
// name index is automatically created by unique: true
categorySchema.index({ type: 1 });

export const Category = mongoose.model<ICategory>('Category', categorySchema);
