# Quick Reference Guide

## 🚀 Quick Commands

### Backend
```bash
# Setup
cd backend
npm install
cp .env.example .env
npm run seed

# Development
npm run dev                    # Start dev server
npm run build                  # Build TypeScript
npm start                      # Run production
npm run seed                   # Seed database with categories

# Database
mongosh                        # MongoDB shell
mongosh --eval "show dbs"      # List databases
```

### Frontend
```bash
# Setup
cd frontend
npm install
cp .env.example .env

# Development
npm run dev                    # Start dev server (http://localhost:5173)
npm run build                  # Build for production
npm run preview                # Preview production build
npm run lint                   # Run ESLint
```

---

## 🔑 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/personal_finance_db
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal_finance_db
JWT_SECRET=your-secret-key
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📂 Key Files

### Backend
```
src/
├── server.ts                    # Entry point
├── config/
│   └── database.ts              # MongoDB connection
├── controllers/
│   ├── auth.controller.ts       # Login, register, profile
│   ├── transaction.controller.ts # CRUD operations
│   ├── category.controller.ts   # Category management
│   └── analytics.controller.ts  # Dashboard analytics
├── models/                      # Mongoose models
│   ├── User.ts                  # User schema
│   ├── Category.ts              # Category schema
│   └── Transaction.ts           # Transaction schema
├── routes/                      # API endpoints
├── middlewares/
│   ├── auth.middleware.ts       # JWT verification
│   ├── upload.middleware.ts     # File upload config
│   └── error.middleware.ts      # Error handling
├── services/
│   └── ocr.service.ts           # Receipt processing
└── seed.ts                      # Database seeding
```

### Frontend
```
src/
├── App.jsx                      # Router setup
├── main.jsx                     # Entry point
├── contexts/
│   └── AuthContext.jsx          # Auth state
├── pages/
│   ├── Login.jsx                # Login page
│   ├── Register.jsx             # Registration page
│   ├── Dashboard.jsx            # Analytics dashboard
│   ├── Transactions.jsx         # Transaction list
│   └── ReceiptUpload.jsx        # OCR upload
└── components/                  # Reusable components
```

---

## 🛣️ API Endpoints

### Authentication
```
POST   /api/auth/register        # Register user
POST   /api/auth/login           # Login user
GET    /api/auth/profile         # Get profile (protected)
```

### Transactions
```
POST   /api/transactions         # Create transaction
GET    /api/transactions         # List transactions (with filters)
GET    /api/transactions/:id     # Get by ID
PUT    /api/transactions/:id     # Update
DELETE /api/transactions/:id     # Delete
POST   /api/transactions/upload-receipt  # Upload receipt
```

### Categories
```
GET    /api/categories           # List categories
POST   /api/categories           # Create category
PUT    /api/categories/:id       # Update category
DELETE /api/categories/:id       # Delete category
```

### Analytics
```
GET    /api/analytics/summary                # Financial summary
GET    /api/analytics/expenses-by-category   # Category breakdown
GET    /api/analytics/transactions-by-date   # Daily aggregation
GET    /api/analytics/monthly-trends         # Monthly trends
```

---

## 🗄️ Database Schema

### Models (Mongoose)
- **User**: _id, email, password, name, createdAt, updatedAt
- **Category**: _id, name, type (INCOME/EXPENSE), description, createdAt, updatedAt
- **Transaction**: _id, amount, type, description, date, categoryId, userId, receiptUrl, createdAt, updatedAt

### Relationships
- User → Transactions (one-to-many via userId)
- Category → Transactions (one-to-many via categoryId)

---

## 🔐 Authentication Flow

1. **Register/Login** → Receive JWT token
2. **Store token** in localStorage
3. **Attach token** to all API requests (Authorization header)
4. **Protected routes** verify token
5. **Auto logout** on 401 error

---

## 🎨 Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── Login (Public)
│   ├── Register (Public)
│   └── ProtectedRoute
│       └── Layout
│           ├── Dashboard
│           ├── Transactions
│           │   ├── TransactionList
│           │   ├── TransactionModal
│           │   └── FilterModal
│           └── ReceiptUpload
```

---

## 📊 Available Categories (Seeded)

### Expense (15)
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Housing
- Insurance
- Personal Care
- Fitness
- Travel
- Subscriptions
- Gifts & Donations
- Other Expenses

### Income (8)
- Salary
- Freelance
- Business
- Investments
- Rental Income
- Gifts
- Refunds
- Other Income

---

## 🧪 Testing the App

### 1. Create Test User
```
Name: Test User
Email: test@example.com
Password: password123
```

### 2. Add Transactions
- Create 5-10 transactions
- Mix income and expenses
- Use different categories
- Use different dates

### 3. Test Features
- Filter by date range
- Filter by type/category
- Upload a receipt
- View dashboard charts
- Export to CSV

---

## 🐛 Common Issues & Solutions

### Backend won't start
```bash
# Check MongoDB is running
# Windows: services.msc, look for MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Verify .env MONGODB_URI
# Test connection: mongosh
```

### Frontend shows "Network Error"
```bash
# Ensure backend is running on port 5000
# Check VITE_API_URL in .env
# Check browser console for CORS errors
```

### Database connection fails
```bash
# For local MongoDB, ensure service is running
# For Atlas, check connection string and network access
# Verify database name in connection string
```

### TypeScript errors
```bash
# Clear build cache
rm -rf dist/
# Rebuild
npm run build
```

---

## 📈 Performance Tips

- Use pagination for large transaction lists
- Filter data on backend, not frontend
- Index frequently queried fields (userId, date)
- Use date range filters to limit data
- Optimize images before upload

---

## 🔒 Security Checklist

- [x] Passwords hashed with bcrypt
- [x] JWT tokens for authentication
- [x] Protected API routes
- [x] User data isolation
- [x] NoSQL injection prevention (Mongoose)
- [x] File upload validation
- [x] CORS configuration
- [ ] Rate limiting (to be added)
- [ ] HTTPS in production

---

## 📝 Code Style

### TypeScript/JavaScript
- Use async/await (not callbacks)
- Use const/let (not var)
- Arrow functions preferred
- Destructuring for objects
- Template literals for strings

### Mongoose
- Define schemas with TypeScript interfaces
- Use indexes for performance
- Validate data at schema level
- Use populate for relationships

### React
- Functional components with hooks
- Props destructuring
- Use Context for global state
- Custom hooks for reusable logic
- Meaningful component names

### CSS (Tailwind)
- Utility-first approach
- Responsive classes (sm:, md:, lg:)
- Consistent spacing
- Color variables from theme

---

## 🚀 Deployment Checklist

### Backend
- [ ] Set NODE_ENV=production
- [ ] Generate strong JWT_SECRET
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Enable MongoDB authentication
- [ ] Set up logging
- [ ] Configure CORS for production domain
- [ ] Add rate limiting
- [ ] Set up monitoring

### Frontend
- [ ] Update VITE_API_URL to production
- [ ] Build for production: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Deploy dist/ folder
- [ ] Configure domain
- [ ] Enable HTTPS
- [ ] Set up analytics

---

## 📚 Additional Documentation

- `README.md` - Project overview
- `SETUP_GUIDE.md` - Detailed setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Features implemented
- `backend/README.md` - Backend details
- `frontend/README.md` - Frontend details

---

## 🆘 Getting Help

1. Check error messages in terminal
2. Check browser console for frontend errors
3. Review documentation files
4. Verify environment variables
5. Check MongoDB is running and accessible
6. Test API endpoints with cURL or Postman

---

## 🎯 Next Steps

1. **Explore the app**
   - Create sample transactions
   - Test all features
   - Review the code

2. **Customize**
   - Add new categories
   - Modify UI colors
   - Add your own features

3. **Deploy**
   - Set up MongoDB Atlas
   - Choose hosting platform
   - Follow deployment checklist
   - Test in production

---

**Happy Coding! 🎉**
