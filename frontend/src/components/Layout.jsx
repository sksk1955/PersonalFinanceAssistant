import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  LogOut, 
  User,
  Menu,
  X,
  DollarSign,
  Database,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Upload Receipt', href: '/upload', icon: Upload },
    { name: 'Import History', href: '/upload-history', icon: Database },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl shadow-lg sticky top-0 z-40 border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                <DollarSign size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Finance Assistant
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Manage your wealth</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-gray-700 hover:bg-gray-100/80 hover:shadow-md'
                    }`}
                  >
                    <Icon size={18} className={active ? '' : 'group-hover:scale-110 transition-transform'} />
                    <span className="text-sm">{item.name}</span>
                    {active && (
                      <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-white/50 rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Section */}
            <div className="flex items-center gap-3">
              {/* Desktop User Info */}
              <div className="hidden md:flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-2.5 rounded-xl border border-gray-200/50 shadow-sm">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <User size={16} className="text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                  <span className="text-xs text-gray-500">Premium</span>
                </div>
              </div>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 font-medium shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:scale-105"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg transition-all duration-300 transform hover:scale-110"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/50 bg-white/95 backdrop-blur-xl animate-slideDown">
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200/50">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">{user?.name}</span>
                    <span className="text-xs text-gray-500">Premium Account</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-3 px-4 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 font-medium shadow-lg w-full"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="py-8 min-h-[calc(100vh-12rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <DollarSign size={18} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Finance Assistant</span>
            </div>
            <p className="text-sm text-gray-600 font-medium flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              © 2025 Personal Finance Assistant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;