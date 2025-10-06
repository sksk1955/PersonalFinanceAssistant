import mongoose from 'mongoose';
import { autoSeedCategories } from '../utils/autoSeed';

const connectDB = async () => {
  try {
    // Clear any existing connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    const conn = await mongoose.connect(mongoURI, {
      // Connection options optimized for Atlas
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 15000, // Increased timeout for slow networks
      socketTimeoutMS: 45000,
      retryWrites: true,
      family: 4, // Force IPv4
    });

    console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Auto-seed categories if none exist
    await autoSeedCategories();
    
    console.log('✅ Ready to accept requests');

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ Database connection error:', error);
    
    // More specific error messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error('\n🔍 Troubleshooting Steps:');
    
    if (errorMessage.includes('ENOTFOUND')) {
      console.error('1. Check your internet connection');
      console.error('2. Verify the cluster URL is correct');
    } else if (errorMessage.includes('authentication failed')) {
      console.error('1. Verify username: financeAssistant');
      console.error('2. Check password in .env file');
      console.error('3. Ensure user has read/write permissions');
    } else if (errorMessage.includes('IP') || errorMessage.includes('whitelist') || errorMessage.includes('not authorized')) {
      console.error('1. ⚠️  YOUR IP IS NOT WHITELISTED!');
      console.error('2. Go to MongoDB Atlas → Network Access');
      console.error('3. Click "Add IP Address"');
      console.error('4. Add your current IP or use 0.0.0.0/0 for testing');
    } else if (errorMessage.includes('MongooseServerSelectionError')) {
      console.error('1. ⚠️  CANNOT REACH MONGODB SERVERS');
      console.error('2. Check if cluster is paused in Atlas');
      console.error('3. Verify Network Access settings');
      console.error('4. Your IP might not be whitelisted');
    }
    
    console.error('\n💡 Quick Fix: Add 0.0.0.0/0 to Network Access in MongoDB Atlas\n');
    
    // Don't exit in development, let the app continue
    if (process.env.NODE_ENV === 'production') {
      console.error('🚫 Exiting in production mode due to DB connection failure');
      process.exit(1);
    } else {
      console.log('⚠️  Continuing without database connection (development mode)');
      console.log('⚠️  API calls will fail until database is connected!\n');
    }
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed through app termination');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
  process.exit(0);
});

export default connectDB;