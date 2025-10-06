# API Documentation

Complete API reference for the Personal Finance Assistant backend.

**Base URL**: `http://localhost:5000/api`

## 📋 Table of Contents
- [Authentication](#authentication)
- [Transactions](#transactions)
- [Categories](#categories)
- [Analytics](#analytics)
- [Error Handling](#error-handling)

## 🔐 Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Register User

Create a new user account.

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (201 Created):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2025-10-06T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `400`: User already exists
- `500`: Registration failed

---

### Login

Authenticate existing user.

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Errors**:
- `401`: Invalid credentials
- `500`: Login failed

---

### Get Profile

Get authenticated user's profile.

**Endpoint**: `GET /auth/profile`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "name": "John Doe",
  "createdAt": "2025-10-06T10:30:00.000Z"
}
```

**Errors**:
- `401`: Authentication required / Invalid token
- `500`: Failed to fetch profile

---

## 💰 Transactions

### Create Transaction

Create a new income or expense transaction.

**Endpoint**: `POST /transactions`

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "amount": 50.00,
  "type": "EXPENSE",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "date": "2025-10-06",
  "description": "Grocery shopping at Whole Foods"
}
```

**Fields**:
- `amount` (required): Number, transaction amount
- `type` (required): String, either "INCOME" or "EXPENSE"
- `categoryId` (required): UUID, must be valid category ID
- `date` (required): ISO date string
- `description` (optional): String, transaction notes

**Response** (201 Created):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "amount": 50.00,
  "type": "EXPENSE",
  "description": "Grocery shopping at Whole Foods",
  "date": "2025-10-06T00:00:00.000Z",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "receiptUrl": null,
  "createdAt": "2025-10-06T10:30:00.000Z",
  "updatedAt": "2025-10-06T10:30:00.000Z",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Food & Dining",
    "type": "EXPENSE",
    "description": "Restaurants, groceries, and food delivery"
  }
}
```

**Errors**:
- `401`: Authentication required
- `500`: Failed to create transaction

---

### Get Transactions

Retrieve user's transactions with filtering and pagination.

**Endpoint**: `GET /transactions`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `page` (optional): Number, page number (default: 1)
- `limit` (optional): Number, items per page (default: 10)
- `startDate` (optional): ISO date, filter start date
- `endDate` (optional): ISO date, filter end date
- `type` (optional): String, "INCOME" or "EXPENSE"
- `categoryId` (optional): UUID, filter by category

**Example Request**:
```
GET /transactions?page=1&limit=10&startDate=2025-10-01&endDate=2025-10-31&type=EXPENSE
```

**Response** (200 OK):
```json
{
  "transactions": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "amount": 50.00,
      "type": "EXPENSE",
      "description": "Grocery shopping",
      "date": "2025-10-06T00:00:00.000Z",
      "categoryId": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "receiptUrl": null,
      "createdAt": "2025-10-06T10:30:00.000Z",
      "updatedAt": "2025-10-06T10:30:00.000Z",
      "category": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Food & Dining",
        "type": "EXPENSE"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

**Errors**:
- `401`: Authentication required
- `500`: Failed to fetch transactions

---

### Get Transaction by ID

Retrieve a specific transaction.

**Endpoint**: `GET /transactions/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "amount": 50.00,
  "type": "EXPENSE",
  "description": "Grocery shopping",
  "date": "2025-10-06T00:00:00.000Z",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "receiptUrl": null,
  "createdAt": "2025-10-06T10:30:00.000Z",
  "updatedAt": "2025-10-06T10:30:00.000Z",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Food & Dining",
    "type": "EXPENSE"
  }
}
```

**Errors**:
- `401`: Authentication required
- `404`: Transaction not found
- `500`: Failed to fetch transaction

---

### Update Transaction

Update an existing transaction.

**Endpoint**: `PUT /transactions/:id`

**Headers**: `Authorization: Bearer <token>`

**Request Body** (all fields optional):
```json
{
  "amount": 55.00,
  "type": "EXPENSE",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "date": "2025-10-06",
  "description": "Updated description"
}
```

**Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "amount": 55.00,
  "type": "EXPENSE",
  "description": "Updated description",
  "date": "2025-10-06T00:00:00.000Z",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "receiptUrl": null,
  "createdAt": "2025-10-06T10:30:00.000Z",
  "updatedAt": "2025-10-06T11:00:00.000Z",
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Food & Dining",
    "type": "EXPENSE"
  }
}
```

**Errors**:
- `401`: Authentication required
- `404`: Transaction not found
- `500`: Failed to update transaction

---

### Delete Transaction

Delete a transaction.

**Endpoint**: `DELETE /transactions/:id`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "message": "Transaction deleted successfully"
}
```

**Errors**:
- `401`: Authentication required
- `404`: Transaction not found
- `500`: Failed to delete transaction

---

### Upload Receipt

Upload and process a receipt image or PDF using OCR.

**Endpoint**: `POST /transactions/upload-receipt`

**Headers**: 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data**:
- `receipt`: File (JPEG, PNG, or PDF, max 10MB)

**Example using cURL**:
```bash
curl -X POST http://localhost:5000/api/transactions/upload-receipt \
  -H "Authorization: Bearer <token>" \
  -F "receipt=@path/to/receipt.jpg"
```

**Response** (200 OK):
```json
{
  "message": "Receipt processed successfully",
  "data": {
    "amount": 50.00,
    "date": "2025-10-06T00:00:00.000Z",
    "merchant": "Whole Foods Market",
    "items": [
      { "name": "Organic Milk", "price": 5.99 },
      { "name": "Bread", "price": 3.50 },
      { "name": "Eggs", "price": 4.99 }
    ],
    "total": 50.00,
    "rawText": "Full extracted text..."
  },
  "fileUrl": "/uploads/1633512345678-receipt.jpg"
}
```

**Errors**:
- `400`: No file uploaded / Invalid file type
- `401`: Authentication required
- `500`: Failed to process receipt

---

## 📂 Categories

### Get Categories

Retrieve all available categories.

**Endpoint**: `GET /categories`

**Query Parameters**:
- `type` (optional): String, "INCOME" or "EXPENSE"

**Example Request**:
```
GET /categories?type=EXPENSE
```

**Response** (200 OK):
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Food & Dining",
    "type": "EXPENSE",
    "description": "Restaurants, groceries, and food delivery",
    "createdAt": "2025-10-06T10:00:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Transportation",
    "type": "EXPENSE",
    "description": "Gas, public transit, taxi, car maintenance",
    "createdAt": "2025-10-06T10:00:00.000Z"
  }
]
```

**Errors**:
- `500`: Failed to fetch categories

---

### Create Category

Create a new category.

**Endpoint**: `POST /categories`

**Request Body**:
```json
{
  "name": "Pet Care",
  "type": "EXPENSE",
  "description": "Vet bills, pet food, grooming"
}
```

**Response** (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440010",
  "name": "Pet Care",
  "type": "EXPENSE",
  "description": "Vet bills, pet food, grooming",
  "createdAt": "2025-10-06T11:00:00.000Z"
}
```

**Errors**:
- `400`: Category already exists
- `500`: Failed to create category

---

## 📊 Analytics

### Get Summary

Get financial summary for date range.

**Endpoint**: `GET /analytics/summary`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Example Request**:
```
GET /analytics/summary?startDate=2025-10-01&endDate=2025-10-31
```

**Response** (200 OK):
```json
{
  "income": 5000.00,
  "expense": 3250.50,
  "balance": 1749.50,
  "transactionCount": 45
}
```

**Errors**:
- `401`: Authentication required
- `500`: Failed to fetch summary

---

### Get Expenses by Category

Get expense breakdown by category.

**Endpoint**: `GET /analytics/expenses-by-category`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Response** (200 OK):
```json
[
  {
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "categoryName": "Food & Dining",
    "amount": 850.00,
    "count": 15
  },
  {
    "categoryId": "550e8400-e29b-41d4-a716-446655440002",
    "categoryName": "Transportation",
    "amount": 450.00,
    "count": 10
  }
]
```

**Errors**:
- `401`: Authentication required
- `500`: Failed to fetch expenses by category

---

### Get Monthly Trends

Get monthly income and expense trends for a year.

**Endpoint**: `GET /analytics/monthly-trends`

**Headers**: `Authorization: Bearer <token>`

**Query Parameters**:
- `year` (optional): Number, defaults to current year

**Example Request**:
```
GET /analytics/monthly-trends?year=2025
```

**Response** (200 OK):
```json
[
  { "month": "Jan", "income": 5000, "expense": 3200 },
  { "month": "Feb", "income": 5200, "expense": 3100 },
  { "month": "Mar", "income": 5000, "expense": 3400 },
  { "month": "Apr", "income": 5100, "expense": 3300 },
  { "month": "May", "income": 5300, "expense": 3500 },
  { "month": "Jun", "income": 5200, "expense": 3200 },
  { "month": "Jul", "income": 5400, "expense": 3600 },
  { "month": "Aug", "income": 5100, "expense": 3400 },
  { "month": "Sep", "income": 5300, "expense": 3300 },
  { "month": "Oct", "income": 5200, "expense": 3250 },
  { "month": "Nov", "income": 0, "expense": 0 },
  { "month": "Dec", "income": 0, "expense": 0 }
]
```

**Errors**:
- `401`: Authentication required
- `500`: Failed to fetch monthly trends

---

## ⚠️ Error Handling

### Standard Error Response

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

### Common Error Messages

**Authentication Errors**:
- `"Authentication required"` - No token provided
- `"Invalid or expired token"` - Token is invalid or expired
- `"Invalid credentials"` - Wrong email or password

**Validation Errors**:
- `"User already exists"` - Email already registered
- `"Category already exists"` - Category name already in use
- `"No file uploaded"` - File required but not provided
- `"Invalid file type. Only JPEG, PNG, and PDF are allowed."`

**Not Found Errors**:
- `"Transaction not found"` - Transaction doesn't exist or not owned by user
- `"Category not found"` - Category doesn't exist

**Server Errors**:
- `"Registration failed"` - Server error during registration
- `"Login failed"` - Server error during login
- `"Failed to create transaction"` - Database error
- `"Failed to process receipt"` - OCR processing error

---

## 🔧 Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### Create Transaction
```bash
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":50,"type":"EXPENSE","categoryId":"CATEGORY_UUID","date":"2025-10-06","description":"Test"}'
```

### Get Transactions
```bash
curl -X GET "http://localhost:5000/api/transactions?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Additional Resources

- **Postman Collection**: Import API endpoints for testing
- **Swagger/OpenAPI**: Auto-generated API documentation (to be implemented)
- **Rate Limiting**: Currently no rate limiting (to be implemented for production)

---

**Last Updated**: October 6, 2025
