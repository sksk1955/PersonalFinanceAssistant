# Personal Finance Assistant - Setup Guide

Complete step-by-step guide to set up and run the Personal Finance Assistant application.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community) OR [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (cloud)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

### Verify Installations

```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
mongod --version # Should show MongoDB 6.x or higher
git --version   # Should show git version 2.x.x
```

## 🗄️ Step 1: Database Setup

### Option 1: Local MongoDB (Recommended for Development)

**Windows:**
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Run installer with default settings
3. MongoDB will start automatically as a service

**Mac:**
```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

**Verify MongoDB is running:**
```bash
# Connect to MongoDB shell
mongosh

# Should connect successfully
# Exit with: exit
```

### Option 2: MongoDB Atlas (Cloud - Free Tier Available)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (free tier: M0)
4. Create database user with read/write permissions
5. Add your IP address to whitelist (or 0.0.0.0/0 for development)
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/personal_finance_db`

## 📥 Step 2: Clone Repository

```bash
# Clone the repository (replace with your repo URL)
git clone <repository-url>

# Navigate to project directory
cd PersonalFinanceAssistant
```

## 🔧 Step 3: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### Configure Environment Variables

1. **Copy example env file**
   ```bash
   copy .env.example .env   # Windows CMD
   # OR
   cp .env.example .env     # Git Bash/PowerShell/Mac/Linux
   ```

2. **Edit `.env` file** (use Notepad or VS Code)
   
   **For Local MongoDB:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/personal_finance_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=5000
   NODE_ENV=development
   ```
   
   **For MongoDB Atlas:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal_finance_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   PORT=5000
   NODE_ENV=development
   ```

### Setup Database with Categories

```bash
# Seed initial categories (23 default categories)
npm run seed
```

This creates default categories (15 expense, 8 income).

### Start Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev
```

You should see:
```
🟢 MongoDB Connected: localhost:27017
🚀 Server running on port 5000
```

**Keep this terminal open!**

## 🎨 Step 4: Frontend Setup

Open a **new terminal** (keep backend running):

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### Configure Environment Variables

1. **Copy example env file**
   ```bash
   copy .env.example .env   # Windows CMD
   # OR
   cp .env.example .env     # Git Bash/PowerShell/Mac/Linux
   ```

2. **Edit `.env` file** (default should work)
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Start Frontend Server

```bash
# Development mode
npm run dev
```

You should see:
```
  VITE v7.1.7  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

## 🌐 Step 5: Access the Application

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the Login page

## 👤 Step 6: Create Your First User

1. Click "Sign up" link
2. Fill in the registration form:
   - Name: Your name
   - Email: your@email.com
   - Password: At least 6 characters
   - Confirm Password: Same as password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the Dashboard

## ✅ Step 7: Test Features

### Test Transaction Management
1. Click "Transactions" in the navigation
2. Click "Add Transaction"
3. Fill in the form:
   - Type: Expense
   - Amount: 50.00
   - Category: Food & Dining
   - Date: Today
   - Description: Grocery shopping
4. Click "Save"
5. Your transaction should appear in the list

### Test Receipt Upload
1. Click "Upload Receipt" in the navigation
2. Click the upload area or drag a receipt image
3. Select a receipt image (JPEG/PNG) or PDF
4. Click "Process Receipt"
5. Review extracted data
6. Click "Create Transaction" to add it

### Test Dashboard Analytics
1. Click "Dashboard" in the navigation
2. View your summary cards
3. See charts update with your data
4. Try date range filters

## 🔍 Verification Checklist

- [ ] Backend server running on port 5000
- [ ] Frontend server running on port 5173
- [ ] MongoDB connected successfully
- [ ] Can access login page
- [ ] Can register new user
- [ ] Can login
- [ ] Can create transaction
- [ ] Can view transactions
- [ ] Can edit/delete transaction
- [ ] Can upload receipt
- [ ] Can view dashboard with charts
- [ ] Can filter by date range
- [ ] Can export to CSV

## 🐛 Troubleshooting

### Backend Issues

**Error: "Cannot connect to database"**
```bash
# Check MongoDB is running
# Windows: Check Services (services.msc) for "MongoDB"
# Mac: brew services list | grep mongodb
# Linux: sudo systemctl status mongod

# For local MongoDB, try connecting:
mongosh

# For Atlas, verify connection string and network access
```

**Error: "Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**Error: "Port 5000 already in use"**
```bash
# Change PORT in .env to different number (e.g., 5001)
# Update VITE_API_URL in frontend/.env accordingly
```

### Frontend Issues

**Error: "Network Error" or "Failed to fetch"**
```bash
# Ensure backend is running on correct port
# Check VITE_API_URL in frontend/.env
# Check browser console for CORS errors
```

**Error: "Module not found"**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**Page is blank**
```bash
# Check browser console for errors
# Ensure all dependencies installed correctly
# Try hard refresh: Ctrl+Shift+R (Windows)
```

### Database Issues

**Error: "MongooseError: Operation buffering timed out"**
```bash
# Check MongoDB is running
# Verify connection string in .env
# For Atlas: Check network access and credentials
```

**Error: "Collection doesn't exist"**
```bash
# Run seed script to create initial data
npm run seed
```

## 🔐 Security Notes

### For Development
- Default JWT_SECRET is fine for development
- MongoDB running without authentication is okay locally
- CORS is open to all origins

### For Production
- Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- Enable MongoDB authentication
- Use MongoDB Atlas with proper network restrictions
- Configure CORS for specific domains
- Use environment variables for all secrets
- Enable SSL/TLS for database connections

## 📊 Viewing Database

### Option 1: MongoDB Compass (Recommended GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to `mongodb://localhost:27017` (or your Atlas connection string)
3. Browse `personal_finance_db` database

### Option 2: MongoDB Shell
```bash
# Connect to MongoDB
mongosh

# Switch to database
use personal_finance_db

# List collections
show collections

# View users
db.users.find().pretty()

# View transactions
db.transactions.find().pretty()

# View categories
db.categories.find().pretty()

# Exit
exit
```

### Option 3: MongoDB Atlas (if using cloud)
1. Go to your Atlas dashboard
2. Click "Browse Collections"
3. Explore your data visually

## 🚀 Next Steps

1. **Explore the application**
   - Create multiple transactions
   - Try different categories
   - Test date filters
   - Upload various receipt formats

2. **Customize**
   - Add more categories
   - Adjust the UI styling
   - Add your own features

3. **Learn the codebase**
   - Read the README files
   - Check the API documentation
   - Explore the code structure

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all environment variables are correct
5. Ensure MongoDB is running and accessible

## 🎉 Success!

If you've completed all steps successfully, you now have a fully functional Personal Finance Assistant running with MongoDB! 

Start tracking your finances and exploring the features!
