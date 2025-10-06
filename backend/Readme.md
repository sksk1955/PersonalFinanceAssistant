# Personal Finance Assistant - Backend

Backend API for the Personal Finance Assistant application built with Node.js, Express, TypeScript, and MongoDB.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB configuration

# Seed initial categories
npm run seed

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📦 Dependencies

### Core
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **typescript**: Type safety
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

### Authentication & Security
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation

### File Processing
- **multer**: File upload handling
- **tesseract.js**: OCR for receipt images
- **pdf-parse**: PDF text extraction
- **sharp**: Image processing

## 🗄️ Database Setup

### MongoDB Installation

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Or use chocolatey:
choco install mongodb
```

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

### MongoDB Atlas (Cloud Option)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account and cluster
3. Get connection string
4. Update MONGODB_URI in .env

### Database Schema

The database uses MongoDB with Mongoose models:

- **User**: User accounts with authentication
- **Category**: Income and expense categories  
- **Transaction**: Financial transactions

### Seeding Data

```bash
# Seed initial categories (23 default categories)
npm run seed
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/profile` | Get user profile | Yes |

### Transactions

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/transactions` | Create transaction | Yes |
| GET | `/api/transactions` | List transactions (paginated) | Yes |
| GET | `/api/transactions/:id` | Get transaction by ID | Yes |
| PUT | `/api/transactions/:id` | Update transaction | Yes |
| DELETE | `/api/transactions/:id` | Delete transaction | Yes |
| POST | `/api/transactions/upload-receipt` | Upload receipt for OCR | Yes |

### Categories

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | List all categories | No |
| POST | `/api/categories` | Create category | No |
| PUT | `/api/categories/:id` | Update category | No |
| DELETE | `/api/categories/:id` | Delete category | No |

### Analytics

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/summary` | Get financial summary | Yes |
| GET | `/api/analytics/expenses-by-category` | Group expenses by category | Yes |
| GET | `/api/analytics/transactions-by-date` | Daily transaction aggregation | Yes |
| GET | `/api/analytics/monthly-trends` | Monthly income/expense trends | Yes |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

**Register/Login Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Using the Token:**
```http
Authorization: Bearer <token>
```

## 📸 OCR Service

The OCR service extracts data from receipts:

### Supported Formats
- Images: JPEG, PNG, JPG
- Documents: PDF

### Extraction Capabilities
- Merchant name
- Transaction amount
- Date
- Individual line items with prices
- Raw text for reference

### Usage Example

```javascript
import { extractReceiptData } from './services/ocr.service';

const data = await extractReceiptData(filePath, mimeType);
// Returns: { amount, date, merchant, items, total, rawText }
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # MongoDB connection
│   ├── controllers/           # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── transaction.controller.ts
│   │   ├── category.controller.ts
│   │   └── analytics.controller.ts
│   ├── middlewares/           # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/                # Mongoose models
│   │   ├── User.ts
│   │   ├── Category.ts
│   │   └── Transaction.ts
│   ├── routes/                # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── transaction.routes.ts
│   │   ├── category.routes.ts
│   │   └── analytics.routes.ts
│   ├── services/              # Business logic
│   │   └── ocr.service.ts
│   ├── seed.ts                # Database seeding
│   └── server.ts              # Application entry point
├── uploads/                   # Uploaded files (gitignored)
├── .env                       # Environment variables
├── .env.example               # Example environment file
├── package.json
└── tsconfig.json              # TypeScript configuration
```

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/personal_finance_db
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/personal_finance_db

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server
PORT=5000
NODE_ENV=development
```

## 🛡️ Security Best Practices

1. **Password Security**
   - Passwords are hashed using bcrypt with salt rounds
   - Never store plain text passwords

2. **JWT Tokens**
   - Tokens expire after 7 days
   - Use strong, random JWT_SECRET in production
   - Tokens are verified on protected routes

3. **Input Validation**
   - Prisma provides SQL injection protection
   - File upload validation (type, size)
   - Request body validation in controllers

4. **Error Handling**
   - Sensitive errors hidden in production
   - Consistent error response format
   - Proper HTTP status codes

## 📝 Code Quality

### TypeScript Configuration
- Strict mode enabled
- ESModuleInterop for compatibility
- Source maps for debugging

### Coding Standards
- Controllers handle HTTP logic
- Services contain business logic
- Middlewares for cross-cutting concerns
- Routes define API structure

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB is running
# Windows: Check Services for "MongoDB"
# Mac: brew services list | grep mongodb
# Linux: sudo systemctl status mongod

# Test connection
mongosh mongodb://localhost:27017
```

### Mongoose Model Issues
```bash
# Clear any cached models
# Restart development server
npm run dev
```

### TypeScript Compilation Errors
```bash
# Clear build cache
rm -rf dist/

# Rebuild
npm run build
```

### Upload Directory Issues
```bash
# Ensure uploads directory exists
mkdir uploads

# Check write permissions
```

## 🧪 Testing (To Be Implemented)

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📊 Performance Considerations

- Database indexes on userId and date fields
- Pagination for large result sets
- File size limits for uploads
- Connection pooling with Mongoose

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure production MongoDB (Atlas recommended)
4. Enable MongoDB authentication
5. Enable CORS for your frontend domain

### Recommended Hosting
- Backend: Heroku, Railway, Render, Vercel
- Database: MongoDB Atlas (free tier available)

## 📄 License

ISC


A robust REST API for managing personal finances with OCR receipt processing.

## Features

- 🔐 User authentication with JWT
- 💰 Income/Expense tracking
- 📊 Financial statistics and analytics
- 📸 Receipt OCR processing (images)
- 📄 PDF transaction import
- 🔍 Advanced filtering and pagination
- 👥 Multi-user support

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Tesseract.js (OCR)
- Multer (File uploads)
- PDF-Parse

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal_finance
JWT_SECRET=your_jwt_secret_key_change_this_in_production
NODE_ENV=development
```

4. Start MongoDB (if running locally):
```bash
# For Windows
net start MongoDB

# For Mac/Linux
brew services start mongodb-community
# or
sudo systemctl start mongod
```

5. Run the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Transactions

- `POST /api/transactions` - Create transaction (Protected)
- `GET /api/transactions` - Get all transactions with filters (Protected)
- `GET /api/transactions/:id` - Get single transaction (Protected)
- `PUT /api/transactions/:id` - Update transaction (Protected)
- `DELETE /api/transactions/:id` - Delete transaction (Protected)
- `GET /api/transactions/stats/summary` - Get statistics (Protected)

### Receipts

- `POST /api/receipts/upload` - Upload receipt image for OCR (Protected)
- `POST /api/receipts/upload-pdf` - Upload PDF transaction history (Protected)

## API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "type": "expense",
    "amount": 50.00,
    "category": "Food & Dining",
    "description": "Lunch at cafe",
    "date": "2024-01-15"
  }'
```

### Get Transactions with Filters
```bash
curl "http://localhost:5000/api/transactions?startDate=2024-01-01&endDate=2024-01-31&type=expense&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Upload Receipt
```bash
curl -X POST http://localhost:5000/api/receipts/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "receipt=@/path/to/receipt.jpg"
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts        # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── receiptController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification
│   │   └── upload.js         # Multer config
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── receiptRoutes.js
│   ├── services/
│   │   └── ocrService.js     # OCR processing
│   └── server.js             # Entry point
├── uploads/                   # File uploads
├── .env
├── .gitignore
└── package.json
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/personal_finance |
| JWT_SECRET | Secret key for JWT | - |
| NODE_ENV | Environment | development |

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Testing

Test the API health:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Notes

- All protected routes require `Authorization: Bearer <token>` header
- Upload limits: 10MB per file
- Supported formats: JPG, PNG, PDF
- OCR may require adjustment based on receipt quality
- Customize PDF parser in `receiptController.js` based on your PDF format

## Future Improvements

- Add rate limiting
- Implement caching with Redis
- Add email notifications
- Enhance OCR accuracy with preprocessing
- Add export to CSV/Excel
- Implement budgets and goals
- Add recurring transactions