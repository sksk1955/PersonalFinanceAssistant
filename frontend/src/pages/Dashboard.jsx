import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Calendar,
  PieChartIcon,
  BarChart3,
  LineChart,
  Filter,
  CreditCard,
  Target,
  Wallet
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import api from '../config/api';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, transactionCount: 0 });
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [selectedChart, setSelectedChart] = useState('bar');
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const [summaryRes, expensesRes, trendsRes] = await Promise.all([
        api.get('/analytics/summary', { params: dateRange }),
        api.get('/analytics/expenses-by-category', { params: dateRange }),
        api.get('/analytics/monthly-trends', { params: { year: new Date().getFullYear() } })
      ]);

      // Ensure all numeric values have defaults
      setSummary({
        income: summaryRes.data?.income || 0,
        expense: summaryRes.data?.expense || 0,
        balance: summaryRes.data?.balance || 0,
        transactionCount: summaryRes.data?.transactionCount || 0
      });
      
      // Validate and clean expenses data
      const validExpenses = (expensesRes.data || []).filter(item => 
        item && typeof item === 'object' && 
        typeof item.amount === 'number' && 
        item.categoryName
      );
      setExpensesByCategory(validExpenses);
      
      // Validate and clean monthly trends data
      const validTrends = (trendsRes.data || []).filter(item => 
        item && typeof item === 'object' && 
        item.month &&
        typeof item.income === 'number' &&
        typeof item.expenses === 'number'
      );
      setMonthlyTrends(validTrends);
    } catch (error) {
      console.error('Analytics fetch error:', error);
      // Set default values on error
      setSummary({ income: 0, expense: 0, balance: 0, transactionCount: 0 });
      setExpensesByCategory([]);
      setMonthlyTrends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFilter = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    setDateRange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd')
    });
  };

  // Safe number formatting helper
  const formatCurrency = (value) => {
    const numValue = Number(value) || 0;
    return `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Safe data validation helpers
  const validateChartData = (data) => {
    return Array.isArray(data) && data.length > 0 && data.every(item => 
      item && typeof item === 'object' && typeof item.amount === 'number'
    );
  };

  // Calculate derived stats
  const savingsRate = summary.income > 0 
    ? ((summary.income - summary.expense) / summary.income * 100).toFixed(1)
    : 0;

  const avgTransactionAmount = summary.transactionCount > 0
    ? (summary.expense / summary.transactionCount).toFixed(2)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200/30 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>
        <p className="mt-6 text-gray-600 font-medium text-lg">Loading your financial insights...</p>
      </div>
    );
  }

  // Error boundary for chart rendering
  const safeRender = () => {
    try {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Financial Dashboard
          </h1>
          <p className="text-gray-600">Track your income, expenses, and financial goals</p>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickFilter(7)}
            className="px-4 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            Last 7 days
          </button>
          <button
            onClick={() => handleQuickFilter(30)}
            className="px-4 py-2 text-sm bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
          >
            Last 30 days
          </button>
          <button
            onClick={() => setDateRange({
              startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
              endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
            })}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
          >
            This Month
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Income Card */}
        <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-green-100 hover:shadow-2xl hover:border-green-300 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700 font-semibold mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(summary.income)}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-green-700 bg-green-100 rounded-lg px-3 py-2">
            <TrendingUp size={14} />
            <span className="ml-1 font-medium">Earnings in period</span>
          </div>
        </div>

        {/* Expense Card */}
        <div className="group bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-lg p-6 border-2 border-red-100 hover:shadow-2xl hover:border-red-300 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl shadow-lg shadow-red-500/30">
              <TrendingDown className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-red-700 font-semibold mb-1">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(summary.expense)}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-red-700 bg-red-100 rounded-lg px-3 py-2">
            <CreditCard size={14} />
            <span className="ml-1 font-medium">Avg: ${avgTransactionAmount}/transaction</span>
          </div>
        </div>

        {/* Balance Card */}
        <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border-2 border-blue-100 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Wallet className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700 font-semibold mb-1">Net Balance</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>
          <div className="flex items-center text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2">
            <Target size={14} />
            <span className="ml-1 font-medium">Savings Rate: {savingsRate}%</span>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-purple-100 hover:shadow-2xl hover:border-purple-300 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl shadow-lg shadow-purple-500/30">
              <Activity className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-purple-700 font-semibold mb-1">Transactions</p>
              <p className="text-2xl font-bold text-purple-900">{summary.transactionCount || 0}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-purple-700 bg-purple-100 rounded-lg px-3 py-2">
            <Calendar size={14} />
            <span className="ml-1 font-medium">In selected period</span>
          </div>
        </div>

        {/* Savings Goal Card */}
        <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg p-6 border-2 border-yellow-100 hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl shadow-lg shadow-yellow-500/30">
              <Target className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-yellow-700 font-semibold mb-1">Monthly Goal</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(Math.max(0, summary.income - summary.expense))}</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-yellow-700 bg-yellow-100 rounded-lg px-3 py-2">
            <DollarSign size={14} />
            <span className="ml-1 font-medium">Amount saved</span>
          </div>
        </div>
      </div>

      {/* Monthly Trends - Always Visible */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-3"></div>
            Monthly Income vs Expenses
          </h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-gray-600">Expenses</span>
            </div>
          </div>
        </div>
        {monthlyTrends && monthlyTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                tickLine={{ stroke: '#E5E7EB' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }} 
                tickLine={{ stroke: '#E5E7EB' }}
                tickFormatter={(value) => `$${Number(value) || 0}`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              <Area 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorIncome)"
                name="Income"
              />
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorExpenses)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center text-gray-400">
            <LineChart size={64} className="mb-4 opacity-50" />
            <p className="text-lg">No monthly data available</p>
            <p className="text-sm mt-2">Start adding transactions to see trends</p>
          </div>
        )}
      </div>

      {/* Category Analysis Section */}
      {expensesByCategory.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Interactive Chart Selector */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
                Expense Distribution
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedChart('bar')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedChart === 'bar' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Bar Chart"
                >
                  <BarChart3 size={20} />
                </button>
                <button
                  onClick={() => setSelectedChart('pie')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedChart === 'pie' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Pie Chart"
                >
                  <PieChartIcon size={20} />
                </button>
                <button
                  onClick={() => setSelectedChart('radar')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    selectedChart === 'radar' 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Radar Chart"
                >
                  <Activity size={20} />
                </button>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              {expensesByCategory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Filter size={48} className="mb-4 opacity-50" />
                  <p className="text-lg">No expense data available</p>
                  <p className="text-sm mt-2">Add some transactions to see charts</p>
                </div>
              ) : selectedChart === 'bar' ? (
                <BarChart data={expensesByCategory.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="categoryName" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100} 
                    tick={{ fontSize: 11, fill: '#6B7280' }} 
                  />
                  <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value || 0)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                    {expensesByCategory.slice(0, 8).filter(entry => entry && entry.amount).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : selectedChart === 'pie' ? (
                <PieChart>
                  <Pie
                    data={expensesByCategory.slice(0, 8)}
                    dataKey="amount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({categoryName, percent}) => `${categoryName || 'Unknown'}: ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
                  >
                    {expensesByCategory.slice(0, 8).filter(entry => entry && entry.amount).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value || 0)} />
                </PieChart>
              ) : selectedChart === 'radar' ? (
                <RadarChart data={expensesByCategory.slice(0, 6)}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="categoryName" 
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, Math.max(...expensesByCategory.map(c => c?.amount || 0), 1)]}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <Radar 
                    name="Amount" 
                    dataKey="amount" 
                    stroke="#6366F1" 
                    fill="#6366F1" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip formatter={(value) => formatCurrency(value || 0)} />
                </RadarChart>
              ) : null}
            </ResponsiveContainer>
          </div>

          {/* Top Spending Categories */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
              <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full mr-3"></div>
              Top Spending Categories
            </h2>
            <div className="space-y-5">
              {expensesByCategory.slice(0, 6).filter(category => category && typeof category.amount === 'number').map((category, index) => {
                const categoryAmount = Math.max(0, category.amount || 0);
                const totalExpense = Math.max(1, summary.expense || 1);
                const percentage = Math.min(100, (categoryAmount / totalExpense) * 100);
                const safeColor = COLORS[index % COLORS.length] || '#6366F1';
                
                return (
                  <div key={category._id || category.categoryId || `category-${index}`} className="group">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full shadow-md"
                          style={{ backgroundColor: safeColor }}
                        />
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                          {category.categoryName || 'Unknown Category'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold text-gray-900 block">
                          {formatCurrency(categoryAmount)}
                        </span>
                        <span className="text-xs text-gray-500">{Math.max(0, category.count || 0)} transactions</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className="h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${safeColor}, ${safeColor}dd)`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {expensesByCategory.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
            <Filter size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600 mb-6">Start adding transactions to see your financial insights</p>
          <a
            href="/transactions"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add Your First Transaction
          </a>
        </div>
      )}
        </div>
      );
    } catch (error) {
      console.error('Dashboard render error:', error);
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          <div className="bg-white rounded-2xl shadow-lg p-12 border border-gray-100 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl mb-6">
              <Filter size={40} className="text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Error</h3>
            <p className="text-gray-600 mb-6">Something went wrong while loading your dashboard. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      );
    }
  };

  return safeRender();
}

export default Dashboard;