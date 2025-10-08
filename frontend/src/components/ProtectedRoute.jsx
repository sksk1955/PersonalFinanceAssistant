import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="w-24 h-24 border-4 border-blue-200/20 border-t-blue-400 rounded-full animate-spin"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
          </div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="text-blue-400" size={32} />
          </div>
        </div>
        
        <p className="mt-8 text-blue-200 text-lg font-medium animate-pulse">
          Verifying access...
        </p>
        
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;