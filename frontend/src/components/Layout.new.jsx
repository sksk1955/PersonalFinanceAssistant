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
  Sparkles,
  Bell,
  Settings,
  ChevronDown,
  Search,
  Moon,
  Sun,
  TrendingUp,
  Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: LayoutDashboard,
      description: 'Financial overview and insights'
    },
    { 
      name: 'Transactions', 
      href: '/transactions', 
      icon: Receipt,
      description: 'Manage your transactions'
    },
    { 
      name: 'Upload Receipt', 
      href: '/upload', 
      icon: Upload,
      description: 'Scan receipts with OCR'
    },
    { 
      name: 'Import History', 
      href: '/upload-history', 
      icon: Database,
      description: 'Bulk import transactions'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-neutral-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300">
                  <DollarSign size={28} className="text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles size={12} className="text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-brand-600 to-brand-800 bg-clip-text text-transparent">
                  Finance Pro
                </h1>
                <p className="text-sm text-neutral-500 font-medium">Professional Financial Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group relative px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                      active
                        ? 'bg-brand-50 text-brand-700 shadow-sm'
                        : 'text-neutral-600 hover:text-brand-600 hover:bg-brand-50/50'
                    }`}
                  >
                    <Icon size={20} className={`${active ? 'text-brand-600' : 'group-hover:text-brand-600'} transition-colors`} />
                    <span className="font-medium">{item.name}</span>
                    {active && (
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-600 rounded-full"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition-all w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-3 text-neutral-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all duration-200">
                <Bell size={20} />
                <div className="absolute top-2 right-2 w-2 h-2 bg-danger-500 rounded-full animate-pulse"></div>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 text-neutral-600 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all duration-200"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-3 p-2 hover:bg-neutral-50 rounded-xl transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500">Premium Account</p>
                  </div>
                  <ChevronDown size={16} className={`text-neutral-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Profile Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-neutral-200/50 py-2 z-50">
                    <div className="px-4 py-3 border-b border-neutral-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                          <User size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{user?.name}</p>
                          <p className="text-sm text-neutral-500">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="py-2">
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Settings size={18} />
                        <span>Account Settings</span>
                      </button>
                      <button className="w-full flex items-center gap-3 px-4 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors">
                        <Shield size={18} />
                        <span>Security</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-neutral-100 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-danger-600 hover:bg-danger-50 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-neutral-200/50">
            <div className="px-4 py-6 space-y-4">
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-neutral-600 hover:text-brand-600 hover:bg-brand-50/50'
                      }`}
                    >
                      <Icon size={22} />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-neutral-500">{item.description}</div>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile User Profile */}
              <div className="border-t border-neutral-200 pt-4">
                <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center shadow-md">
                    <User size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-900">{user?.name}</p>
                    <p className="text-sm text-neutral-500">Premium Account</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:bg-neutral-50 rounded-xl transition-colors">
                    <Settings size={20} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-danger-600 hover:bg-danger-50 rounded-xl transition-colors font-medium"
                  >
                    <LogOut size={20} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-5rem)]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-xl border-t border-neutral-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-600 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <DollarSign size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-neutral-900">Finance Pro</h3>
                  <p className="text-neutral-600">Professional Financial Management</p>
                </div>
              </div>
              <p className="text-neutral-600 max-w-md leading-relaxed">
                Empowering individuals and businesses with intelligent financial insights, 
                professional-grade analytics, and seamless expense management.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/dashboard" className="text-neutral-600 hover:text-brand-600 transition-colors">Dashboard</Link></li>
                <li><Link to="/transactions" className="text-neutral-600 hover:text-brand-600 transition-colors">Transactions</Link></li>
                <li><Link to="/upload" className="text-neutral-600 hover:text-brand-600 transition-colors">Receipt Upload</Link></li>
                <li><Link to="/upload-history" className="text-neutral-600 hover:text-brand-600 transition-colors">Import Data</Link></li>
              </ul>
            </div>

            {/* Stats */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-4">Platform Stats</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp size={18} className="text-success-600" />
                  <div>
                    <p className="font-semibold text-neutral-900">99.9%</p>
                    <p className="text-sm text-neutral-600">Uptime</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield size={18} className="text-brand-600" />
                  <div>
                    <p className="font-semibold text-neutral-900">256-bit</p>
                    <p className="text-sm text-neutral-600">Encryption</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-neutral-600 text-sm">
              © 2025 Finance Pro. All rights reserved. Built with precision and care.
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Sparkles size={16} className="text-brand-500" />
              <span>Powered by advanced financial technology</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;