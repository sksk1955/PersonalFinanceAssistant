import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Category, TransactionType } from './models/Category';
import connectDB from './config/database';

dotenv.config();

async function main() {
  console.log('🌱 Seeding MongoDB database...');

  // Connect to database
  await connectDB();

  // Create default categories
  const categories = [
    // Expense categories
    { name: 'Food & Dining', type: TransactionType.EXPENSE, description: 'Restaurants, groceries, and food delivery' },
    { name: 'Transportation', type: TransactionType.EXPENSE, description: 'Gas, public transit, taxi, car maintenance' },
    { name: 'Shopping', type: TransactionType.EXPENSE, description: 'Clothing, electronics, and general shopping' },
    { name: 'Entertainment', type: TransactionType.EXPENSE, description: 'Movies, games, hobbies, and recreation' },
    { name: 'Bills & Utilities', type: TransactionType.EXPENSE, description: 'Electricity, water, internet, phone' },
    { name: 'Healthcare', type: TransactionType.EXPENSE, description: 'Medical expenses, pharmacy, insurance' },
    { name: 'Education', type: TransactionType.EXPENSE, description: 'Tuition, books, courses, and learning materials' },
    { name: 'Housing', type: TransactionType.EXPENSE, description: 'Rent, mortgage, home maintenance' },
    { name: 'Insurance', type: TransactionType.EXPENSE, description: 'Life, health, car, and other insurance' },
    { name: 'Personal Care', type: TransactionType.EXPENSE, description: 'Haircut, spa, cosmetics' },
    { name: 'Fitness', type: TransactionType.EXPENSE, description: 'Gym, sports, fitness equipment' },
    { name: 'Travel', type: TransactionType.EXPENSE, description: 'Vacation, hotels, flights' },
    { name: 'Subscriptions', type: TransactionType.EXPENSE, description: 'Streaming services, magazines, memberships' },
    { name: 'Gifts & Donations', type: TransactionType.EXPENSE, description: 'Presents, charity, contributions' },
    { name: 'Other Expenses', type: TransactionType.EXPENSE, description: 'Miscellaneous expenses' },
    
    // Income categories
    { name: 'Salary', type: TransactionType.INCOME, description: 'Regular employment income' },
    { name: 'Freelance', type: TransactionType.INCOME, description: 'Freelance and contract work' },
    { name: 'Business', type: TransactionType.INCOME, description: 'Business revenue and profits' },
    { name: 'Investments', type: TransactionType.INCOME, description: 'Dividends, interest, capital gains' },
    { name: 'Rental Income', type: TransactionType.INCOME, description: 'Property rental income' },
    { name: 'Gifts', type: TransactionType.INCOME, description: 'Money received as gifts' },
    { name: 'Refunds', type: TransactionType.INCOME, description: 'Tax refunds, purchase returns' },
    { name: 'Other Income', type: TransactionType.INCOME, description: 'Miscellaneous income' },
  ];

  for (const categoryData of categories) {
    await Category.findOneAndUpdate(
      { name: categoryData.name },
      categoryData,
      { upsert: true, new: true }
    );
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Created ${categories.length} categories`);
  
  // Close connection
  await mongoose.connection.close();
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  });
