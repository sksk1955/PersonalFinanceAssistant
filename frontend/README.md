# Personal Finance Assistant - Frontend

Modern React frontend for the Personal Finance Assistant application with responsive design and interactive data visualizations.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env if backend URL is different

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## 📦 Technologies

### Core
- **React 19**: Latest React with improved performance
- **React Router**: Client-side routing
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client with interceptors

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library
- **Recharts**: Composable charting library

### Utilities
- **date-fns**: Modern date utility library

## 🎨 Features

### 1. Authentication
- **Login Page**: Secure user login with JWT
- **Register Page**: New user registration with validation
- **Protected Routes**: Automatic redirect for unauthenticated users
- **Token Management**: Automatic token refresh and storage

### 2. Dashboard
- **Financial Summary Cards**: Income, Expenses, Balance, Transaction Count
- **Interactive Charts**:
  - Pie Chart: Expenses by category
  - Bar Chart: Category breakdown
  - Line Chart: Monthly income vs expenses
- **Date Range Filters**: Quick filters and custom date selection
- **Top Spending Categories**: Visual progress bars

### 3. Transaction Management
- **Transaction List**: Paginated, filterable transaction table
- **Create/Edit Modal**: User-friendly form with validation
- **Delete Confirmation**: Prevent accidental deletions
- **Filter Modal**: Advanced filtering by type, category, date range
- **CSV Export**: Download transaction history
- **Category-based Type**: Auto-filter categories by transaction type

### 4. Receipt Upload
- **Drag & Drop**: Easy file upload interface
- **Image Preview**: See uploaded images before processing
- **OCR Processing**: Extract data from receipts
- **Data Review**: Edit extracted data before creating transaction
- **Multi-format Support**: JPEG, PNG, PDF

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout.jsx       # Main app layout with navigation
│   │   ├── ProtectedRoute.jsx   # Auth guard component
│   │   ├── TransactionList.jsx  # Transaction table with pagination
│   │   ├── TransactionModal.jsx # Add/Edit transaction form
│   │   └── FilterModal.jsx      # Transaction filter form
│   │
│   ├── contexts/           # React contexts
│   │   └── AuthContext.jsx # Authentication state management
│   │
│   ├── pages/              # Page components
│   │   ├── Login.jsx       # Login page
│   │   ├── Register.jsx    # Registration page
│   │   ├── Dashboard.jsx   # Analytics dashboard
│   │   ├── Transactions.jsx    # Transaction management
│   │   └── ReceiptUpload.jsx   # OCR receipt upload
│   │
│   ├── config/             # Configuration
│   │   └── api.js          # Axios instance with interceptors
│   │
│   ├── App.jsx             # Root component with routing
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles
│
├── public/                 # Static assets
├── .env                    # Environment variables
├── .env.example            # Example environment file
├── index.html              # HTML template
├── package.json
├── tailwind.config.js      # Tailwind configuration
└── vite.config.js          # Vite configuration
```

## 🔐 Authentication Flow

1. **Login/Register**: User submits credentials
2. **Token Received**: JWT token stored in localStorage
3. **Auto Attach**: Token automatically attached to API requests
4. **Protected Routes**: Routes check for valid token
5. **Auto Logout**: Invalid token triggers logout and redirect

```javascript
// AuthContext provides:
const { user, token, loading, login, register, logout } = useAuth();
```

## 🎯 Component Architecture

### Layout Component
- Responsive navigation bar
- Mobile menu for small screens
- User profile display
- Logout functionality
- Consistent header and footer

### Protected Route
- Checks authentication status
- Shows loading spinner during auth check
- Redirects to login if not authenticated

### Transaction Components
- **TransactionList**: Displays transactions with edit/delete actions
- **TransactionModal**: Form for creating/editing transactions
- **FilterModal**: Advanced filtering options

### Dashboard Components
- Summary cards with icons
- Responsive chart containers
- Date range selectors
- Quick filter buttons

## 🎨 Styling Guidelines

### Tailwind CSS Usage
```jsx
// Example: Button styling
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
  Click Me
</button>

// Example: Card styling
<div className="bg-white rounded-lg shadow p-6">
  Card Content
</div>
```

### Color Scheme
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Danger**: Red (#EF4444)
- **Warning**: Orange (#F59E0B)
- **Purple**: (#8B5CF6)

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible navigation on mobile

## 🔌 API Integration

### API Configuration (`src/config/api.js`)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Request interceptor: Attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout on authentication failure
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Making API Calls
```javascript
// In components
import api from '../config/api';

// GET request
const response = await api.get('/transactions', { params: { page: 1 } });

// POST request
const response = await api.post('/transactions', data);

// PUT request
const response = await api.put(`/transactions/${id}`, data);

// DELETE request
await api.delete(`/transactions/${id}`);

// File upload
const formData = new FormData();
formData.append('receipt', file);
const response = await api.post('/transactions/upload-receipt', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

## 📊 Charts & Visualizations

### Recharts Components Used
- **PieChart**: Category distribution
- **BarChart**: Category comparison
- **LineChart**: Time series trends

### Example Chart Implementation
```jsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      dataKey="amount"
      nameKey="categoryName"
      outerRadius={100}
      label
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index]} />
      ))}
    </Pie>
    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
  </PieChart>
</ResponsiveContainer>
```

## 🔧 Environment Variables

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api
```

**Note**: Vite requires `VITE_` prefix for environment variables to be exposed to the client.

## 🚀 Build & Deployment

### Development Build
```bash
npm run dev
# Hot reload enabled
# Source maps included
```

### Production Build
```bash
npm run build
# Output: dist/
# Minified and optimized
# Tree-shaking applied
```

### Preview Production Build
```bash
npm run preview
# Test production build locally
```

### Deployment Platforms
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `dist/` folder
- **GitHub Pages**: Build and push `dist/` to gh-pages branch
- **AWS S3 + CloudFront**: Upload `dist/` to S3 bucket

### Environment Configuration for Deployment
1. Set `VITE_API_URL` to production API URL
2. Build the project
3. Deploy `dist/` folder
4. Configure CORS on backend for production domain

## 🎯 User Experience

### Loading States
- Skeleton loaders for data fetching
- Spinner for page transitions
- Button disabled states during submission

### Error Handling
- Toast notifications for errors
- Form validation messages
- API error display

### Responsive Design
- Mobile-friendly navigation
- Touch-optimized buttons
- Readable text sizes
- Proper spacing on all devices

## 🐛 Troubleshooting

### Common Issues

**1. API Connection Failed**
```bash
# Check backend is running
# Verify VITE_API_URL in .env
# Check CORS configuration on backend
```

**2. Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install

# Clear Vite cache
rm -rf node_modules/.vite
```

**3. Routing Issues**
```bash
# Ensure BrowserRouter is used in production
# Configure server to serve index.html for all routes
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

## ♿ Accessibility

- Semantic HTML elements
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Alt text for images

## 🔮 Future Enhancements

- [ ] Progressive Web App (PWA) support
- [ ] Offline mode with service workers
- [ ] Push notifications for budgets
- [ ] Dark mode theme
- [ ] Multi-language support (i18n)
- [ ] Advanced filtering and search
- [ ] Recurring transactions
- [ ] Budget goals and alerts

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
