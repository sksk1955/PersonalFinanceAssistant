import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import ReceiptUpload from './pages/ReceiptUpload';
import TransactionHistoryUpload from './pages/TransactionHistoryUpload';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Layout>
                  <Transactions />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReceiptUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/upload-history"
            element={
              <ProtectedRoute>
                <Layout>
                  <TransactionHistoryUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;

