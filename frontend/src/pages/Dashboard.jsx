import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity,
  Calendar
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import api from '../config/api';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0, transactionCount: 0 });
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
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
      
      setExpensesByCategory(expensesRes.data || []);
      setMonthlyTrends(trendsRes.data || []);
    } catch (error) {
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
    return (value || 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">Financial Dashboard</h1>
        <p className="text-gray-600 text-lg">📊 Overview of your financial activities</p>
      </div>

      {/* Quick Filters */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={() => handleQuickFilter(7)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📅 Last 7 days
        </button>
        <button
          onClick={() => handleQuickFilter(30)}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          📊 Last 30 days
        </button>
        <button
          onClick={() => {
            const now = new Date();
            setDateRange({
              startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
              endDate: format(endOfMonth(now), 'yyyy-MM-dd')
            });
          }}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          🗓️ This Month
        </button>
        <div className="flex gap-3 ml-auto">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
          />
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-r from-green-400 to-green-500 rounded-2xl shadow-lg">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2 font-medium">💰 Total Income</p>
          <p className="text-3xl font-bold text-gray-900">${formatCurrency(summary.income)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-r from-red-400 to-red-500 rounded-2xl shadow-lg">
              <TrendingDown className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2 font-medium">💸 Total Expenses</p>
          <p className="text-3xl font-bold text-gray-900">${formatCurrency(summary.expense)}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl shadow-lg">
              <DollarSign className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2 font-medium">🏦 Balance</p>
          <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${formatCurrency(summary.balance)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 bg-gradient-to-r from-purple-400 to-purple-500 rounded-2xl shadow-lg">
              <Activity className="text-white" size={28} />
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-2 font-medium">📊 Transactions</p>
          <p className="text-3xl font-bold text-gray-900">{summary.transactionCount || 0}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Expenses by Category */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">🥧 Expenses by Category</h2>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="amount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.categoryName}: $${(entry.amount || 0).toFixed(0)}`}
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${(value || 0).toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">📊 Category Breakdown</h2>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoryName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${(value || 0).toFixed(2)}`} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No expense data available
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">📈 Monthly Trends</h2>
        {monthlyTrends.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${(value || 0).toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Expense"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No monthly data available
          </div>
        )}
      </div>

      {/* Top Categories */}
      {expensesByCategory.length > 0 && (
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">🏆 Top Spending Categories</h2>
          <div className="space-y-3">
            {expensesByCategory.slice(0, 5).map((category, index) => {
              const categoryAmount = category.amount || 0;
              const totalExpense = summary.expense || 1; // Avoid division by zero
              const percentage = (categoryAmount / totalExpense) * 100;
              return (
                <div key={category.categoryId || index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {category.categoryName || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-600">
                      ${categoryAmount.toFixed(2)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;