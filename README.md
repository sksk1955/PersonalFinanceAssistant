"# Personal Finance Assistant

## 🎥 Demo Video
[![Watch Demo Video](https://img.shields.io/badge/🎥-Watch%20Demo%20Video-red?style=for-the-badge)](https://drive.google.com/file/d/1ZC64yuAd6iJC_ttg9bLEiIR_lmCF5MvO/view?usp=sharing)

A full-stack web application designed to help users track, manage, and understand their financial activities. Users can log income and expenses, categorize transactions, view analytics with interactive charts, and extract transaction data from receipts using OCR technology.

![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)


## 🌟 Features

### Core Features
- ✅ **User Authentication**: Secure registration and login with JWT tokens
- ✅ **Transaction Management**: Create, read, update, and delete income/expense entries
- ✅ **Date Range Filtering**: View transactions within specific time periods
- ✅ **Category Organization**: Pre-defined categories for income and expenses
- ✅ **Pagination Support**: Efficiently browse large transaction lists
- ✅ **Multi-User Support**: Each user has their own isolated data

### Analytics & Visualization
- 📊 **Interactive Dashboard**: Real-time financial overview
- 📈 **Expense by Category**: Pie chart and bar chart visualizations
- 📉 **Monthly Trends**: Line chart showing income vs expenses over time
- 💰 **Financial Summary**: Total income, expenses, and balance calculations
- 🎯 **Top Spending Categories**: Identify where money is going

### Receipt Processing (OCR)
- 📸 **Image Upload**: Extract data from receipt photos (JPEG, PNG)
- 📄 **PDF Support**: Process PDF receipts and bank statements
- 🤖 **Automatic Extraction**: AI-powered text recognition using Tesseract.js
- 💵 **Smart Parsing**: Automatically detect amounts, dates, merchants, and line items

## 🏗️ Architecture

### Technology Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB with Mongoose ODM
- JWT Authentication
- Tesseract.js (OCR)
- pdf-parse (PDF extraction)
- Multer (File uploads)

**Frontend:**
- React 19
- React Router
- Axios
- Recharts (Data visualization)
- Tailwind CSS
- Lucide React (Icons)
- date-fns (Date formatting)

### Database Schema

```typescript
// User Model
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category Model  
interface ICategory {
  _id: ObjectId;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transaction Model
interface ITransaction {
  _id: ObjectId;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  date: Date;
  categoryId: ObjectId;
  userId: ObjectId;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.0 or higher) OR MongoDB Atlas account
- npm or yarn

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PersonalFinanceAssistant
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
# For local MongoDB:
# MONGODB_URI=mongodb://localhost:27017/personal_finance_db
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal_finance_db
# JWT_SECRET=your-secret-key-change-in-production
# PORT=5000

# Seed initial categories
npm run seed

# Start development server
npm run dev
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env (default should work if backend is on localhost:5000)
# VITE_API_URL=http://localhost:5000/api

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

### 4. Access the Application

Open your browser and navigate to `http://localhost:5173`

1. **Register** a new account
2. **Login** with your credentials
3. Start managing your finances!

## 📖 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Transaction Endpoints

#### Create Transaction
```http
POST /api/transactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00,
  "type": "EXPENSE",
  "categoryId": "ObjectId",
  "date": "2025-10-06",
  "description": "Grocery shopping"
}
```

#### Get Transactions (with filtering and pagination)
```http
GET /api/transactions?page=1&limit=10&startDate=2025-10-01&endDate=2025-10-31&type=EXPENSE
Authorization: Bearer <token>
```

#### Update Transaction
```http
PUT /api/transactions/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 55.00,
  "description": "Updated description"
}
```

#### Delete Transaction
```http
DELETE /api/transactions/:id
Authorization: Bearer <token>
```

#### Upload Receipt
```http
POST /api/transactions/upload-receipt
Authorization: Bearer <token>
Content-Type: multipart/form-data

receipt: <file>
```

### Category Endpoints

#### Get Categories
```http
GET /api/categories?type=EXPENSE
```

### Analytics Endpoints

#### Get Summary
```http
GET /api/analytics/summary?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

#### Get Expenses by Category
```http
GET /api/analytics/expenses-by-category?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer <token>
```

#### Get Monthly Trends
```http
GET /api/analytics/monthly-trends?year=2025
Authorization: Bearer <token>
```

## 🎨 Features Implementation

### 1. Transaction Management
- Create income/expense entries through an intuitive modal form
- List all transactions with date range filters
- Edit and delete transactions
- Pagination for large datasets
- Export transactions to CSV

### 2. Data Visualization
- **Pie Chart**: Expenses breakdown by category
- **Bar Chart**: Category-wise spending comparison
- **Line Chart**: Monthly income vs expense trends
- **Summary Cards**: Quick overview of finances

### 3. Receipt OCR
- Upload receipt images (JPEG, PNG) or PDFs
- Automatic extraction of:
  - Merchant name
  - Total amount
  - Date
  - Line items with prices
- Review and edit extracted data
- Create transactions from receipts

### 4. Multi-User Support
- Secure authentication with JWT
- User-specific data isolation
- Profile management

## 📁 Project Structure

```
PersonalFinanceAssistant/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── transaction.controller.ts
│   │   │   ├── category.controller.ts
│   │   │   └── analytics.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Category.ts
│   │   │   └── Transaction.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── transaction.routes.ts
│   │   │   ├── category.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── services/
│   │   │   └── ocr.service.ts
│   │   ├── seed.ts
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   ├── TransactionList.jsx
    │   │   ├── TransactionModal.jsx
    │   │   └── FilterModal.jsx
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Transactions.jsx
    │   │   └── ReceiptUpload.jsx
    │   ├── config/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── tailwind.config.js
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- NoSQL injection prevention (Mongoose)
- XSS protection
- CORS configuration
- File upload validation

## 🧪 Testing

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests (to be implemented)
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment

1. Set up MongoDB Atlas or cloud MongoDB instance
2. Configure environment variables
3. Run seed script: `npm run seed`
4. Build: `npm run build`
5. Start: `npm start`

### Frontend Deployment

1. Update `VITE_API_URL` in `.env`
2. Build: `npm run build`
3. Deploy `dist` folder to hosting service

## 🔧 Environment Variables

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

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Code Quality Guidelines

This project follows best practices for code quality:

1. **Clean Code**: Clear, concise, and readable code with meaningful names
2. **Modularity**: Logical separation of concerns with reusable components
3. **TypeScript**: Type safety in backend code
4. **Error Handling**: Comprehensive error handling throughout
5. **Documentation**: Inline comments for complex logic
6. **Consistent Formatting**: Using ESLint and Prettier

##  Known Issues & Future Enhancements

### To Do:
- [ ] Add unit and integration tests
- [ ] Implement password reset functionality
- [ ] Add budget tracking and alerts
- [ ] Support multiple currencies
- [ ] Export data to various formats (Excel, JSON)
- [ ] Add recurring transactions
- [ ] Implement dark mode
- [ ] Mobile app (React Native)

##  Acknowledgments

- Tesseract.js for OCR functionality
- Recharts for beautiful charts
- Mongoose for excellent MongoDB integration
