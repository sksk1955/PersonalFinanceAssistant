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
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  RefreshCw
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

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2', '#65a30d'];

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ income: 0, expenses: 0, balance: 0, transactionCount: 0 });
  const [expensesByCategory, setExpensesByCategory] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });

  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleQuickFilter = (days) => {
    setDateRange({
      startDate: format(subDays(new Date(), days), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd')
    });
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [summaryRes, expensesRes, monthlyRes] = await Promise.all([
        api.get(`/analytics/summary?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get(`/analytics/expenses-by-category?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`),
        api.get(`/analytics/monthly-trends?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`)
      ]);

      console.log('API Responses:', {
        summary: summaryRes.data,
        expenses: expensesRes.data,
        monthly: monthlyRes.data
      });

      setSummary({
        income: summaryRes.data?.income || 0,
        expenses: summaryRes.data?.expense || 0,
        balance: summaryRes.data?.balance || 0,
        transactionCount: summaryRes.data?.transactionCount || 0
      });
      
      const validExpenses = (expensesRes.data || []).filter(item => 
        item && typeof item === 'object' && 
        (typeof item.amount === 'number' || !isNaN(parseFloat(item.amount))) && 
        item.categoryName
      ).map(item => ({
        ...item,
        amount: typeof item.amount === 'number' ? item.amount : parseFloat(item.amount)
      }));
      console.log('Valid expenses:', validExpenses);
      setExpensesByCategory(validExpenses);
      setTopCategories(validExpenses.slice(0, 5));
      
      const validMonthlyData = (monthlyRes.data || []).filter(item => 
        item && typeof item === 'object' && 
        (typeof item.income === 'number' || !isNaN(parseFloat(item.income || 0))) && 
        (typeof item.expenses === 'number' || !isNaN(parseFloat(item.expenses || 0)))
      ).map(item => ({
        ...item,
        income: typeof item.income === 'number' ? item.income : parseFloat(item.income || 0),
        expenses: typeof item.expenses === 'number' ? item.expenses : parseFloat(item.expenses || 0)
      }));
      console.log('Valid monthly data:', validMonthlyData);
      setMonthlyData(validMonthlyData);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setSummary({ income: 0, expenses: 0, balance: 0, transactionCount: 0 });
      setExpensesByCategory([]);
      setMonthlyData([]);
      setTopCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-flex">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <DollarSign className="text-white" size={32} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl animate-ping opacity-25"></div>
          </div>
          <p className="mt-6 text-neutral-600 font-medium text-lg">Loading your financial insights...</p>
        </div>
      </div>
    );
  }

  const safeRender = () => {
    try {
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-12">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="space-y-3">
                  <h1 className="text-5xl font-display font-bold text-neutral-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-lg text-neutral-600 font-medium">Your financial insights at a glance</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-white/90 backdrop-blur-md rounded-2xl p-1.5 shadow-md border border-neutral-200/50">
                    <button
                      onClick={() => handleQuickFilter(7)}
                      className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-all duration-200"
                    >
                      Last 7 Days
                    </button>
                    <button
                      onClick={() => handleQuickFilter(30)}
                      className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:text-brand-700 hover:bg-brand-50 rounded-xl transition-all duration-200"
                    >
                      Last 30 Days
                    </button>
                    <button
                      onClick={() => setDateRange({
                        startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                        endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
                      })}
                      className="px-5 py-2.5 text-sm font-medium bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-sm"
                    >
                      This Month
                    </button>
                  </div>
                  
                  <button
                    onClick={fetchAnalytics}
                    className="p-3 bg-white/90 backdrop-blur-md rounded-xl border border-neutral-200/50 hover:bg-neutral-50 transition-all duration-200 shadow-sm"
                  >
                    <RefreshCw size={20} className="text-neutral-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Income Card */}
              <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-neutral-200/50 hover:border-success-200 hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-success-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl shadow-lg">
                      <TrendingUp className="text-white" size={28} />
                    </div>
                    <div className="flex items-center text-success-600 bg-success-50 px-3 py-1 rounded-full">
                      <ArrowUpRight size={16} />
                      <span className="text-sm font-semibold ml-1">Income</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Total Income</p>
                    <p className="text-3xl font-bold text-neutral-900">{formatCurrency(summary.income)}</p>
                  </div>
                  <div className="mt-4 p-3 bg-success-50 rounded-xl">
                    <span className="text-sm font-medium text-success-700">Earnings this period</span>
                  </div>
                </div>
              </div>

              {/* Expense Card */}
              <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-neutral-200/50 hover:border-danger-200 hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-danger-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-danger-500 to-danger-600 rounded-2xl shadow-lg">
                      <TrendingDown className="text-white" size={28} />
                    </div>
                    <div className="flex items-center text-danger-600 bg-danger-50 px-3 py-1 rounded-full">
                      <ArrowDownRight size={16} />
                      <span className="text-sm font-semibold ml-1">Expenses</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Total Expenses</p>
                    <p className="text-3xl font-bold text-neutral-900">{formatCurrency(summary.expenses)}</p>
                  </div>
                  <div className="mt-4 p-3 bg-danger-50 rounded-xl">
                    <span className="text-sm font-medium text-danger-700">Spent this period</span>
                  </div>
                </div>
              </div>

              {/* Balance Card */}
              <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-neutral-200/50 hover:border-brand-200 hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg">
                      <Wallet className="text-white" size={28} />
                    </div>
                    <div className="flex items-center text-brand-600 bg-brand-50 px-3 py-1 rounded-full">
                      <DollarSign size={16} />
                      <span className="text-sm font-semibold ml-1">Balance</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Net Balance</p>
                    <p className={`text-3xl font-bold ${summary.balance >= 0 ? 'text-success-600' : 'text-danger-600'}`}>
                      {formatCurrency(summary.balance)}
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-brand-50 rounded-xl">
                    <span className="text-sm font-medium text-brand-700">Current balance</span>
                  </div>
                </div>
              </div>

              {/* Transactions Card */}
              <div className="group relative bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-neutral-200/50 hover:border-warning-200 hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-warning-50/50 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-4 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl shadow-lg">
                      <Activity className="text-white" size={28} />
                    </div>
                    <div className="flex items-center text-warning-600 bg-warning-50 px-3 py-1 rounded-full">
                      <Activity size={16} />
                      <span className="text-sm font-semibold ml-1">Activity</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">Transactions</p>
                    <p className="text-3xl font-bold text-neutral-900">{summary.transactionCount || 0}</p>
                  </div>
                  <div className="mt-4 p-3 bg-warning-50 rounded-xl">
                    <span className="text-sm font-medium text-warning-700">Total transactions</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            {monthlyData.length === 0 && expensesByCategory.length === 0 ? (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-16 border border-neutral-200/50 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-3xl mb-8">
                  <Filter size={48} className="text-neutral-400" />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-900 mb-4">No Data Available</h3>
                <p className="text-neutral-600 mb-8 text-lg">Start adding transactions to see your financial insights</p>
                <a
                  href="/transactions"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-2xl hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Plus size={20} className="mr-2" />
                  Add Your First Transaction
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Monthly Trend Chart */}
                {monthlyData.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 border border-neutral-200/50">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Monthly Trends</h2>
                        <p className="text-neutral-600">Income vs Expenses over time</p>
                      </div>
                      <div className="p-3 bg-brand-50 rounded-xl">
                        <LineChart size={24} className="text-brand-600" />
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyData}>
                          <defs>
                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#6b7280"
                            fontSize={12}
                            fontWeight={500}
                          />
                          <YAxis 
                            stroke="#6b7280"
                            fontSize={12}
                            fontWeight={500}
                            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                          />
                          <Tooltip 
                            formatter={(value, name) => [formatCurrency(value), name]}
                            labelFormatter={(label) => `Month: ${label}`}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#16a34a"
                            strokeWidth={3}
                            fill="url(#incomeGradient)"
                            name="Income"
                          />
                          <Area
                            type="monotone"
                            dataKey="expenses"
                            stroke="#dc2626"
                            strokeWidth={3}
                            fill="url(#expenseGradient)"
                            name="Expenses"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Expense Categories Chart */}
                {expensesByCategory.length > 0 && (
                  <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 border border-neutral-200/50">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Expense Categories</h2>
                        <p className="text-neutral-600">Spending breakdown by category</p>
                      </div>
                      <div className="p-3 bg-danger-50 rounded-xl">
                        <PieChartIcon size={24} className="text-danger-600" />
                      </div>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={expensesByCategory}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            innerRadius={40}
                            fill="#8884d8"
                            dataKey="amount"
                            nameKey="categoryName"
                          >
                            {expensesByCategory.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => formatCurrency(value)}
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Top Categories */}
            {topCategories.length > 0 && (
              <div className="mt-12 bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-8 border border-neutral-200/50">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-900 mb-2">Top Spending Categories</h2>
                    <p className="text-neutral-600">Your highest expense categories this period</p>
                  </div>
                  <div className="p-3 bg-warning-50 rounded-xl">
                    <Target size={24} className="text-warning-600" />
                  </div>
                </div>
                <div className="space-y-6">
                  {topCategories.map((category, index) => {
                    const maxAmount = Math.max(...topCategories.map(c => c.amount || 0));
                    const percentage = maxAmount > 0 ? ((category.amount || 0) / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={category.categoryName || index} className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center`}
                             style={{ backgroundColor: COLORS[index % COLORS.length] + '20' }}>
                          <div className={`w-6 h-6 rounded-lg`}
                               style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-neutral-900">{category.categoryName || 'Unknown'}</h3>
                            <span className="font-bold text-neutral-900">{formatCurrency(category.amount || 0)}</span>
                          </div>
                          <div className="w-full bg-neutral-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Dashboard render error:', error);
      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg p-12 border border-neutral-200/50 text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-danger-100 to-danger-200 rounded-2xl mb-6">
              <Filter size={40} className="text-danger-400" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Dashboard Error</h3>
            <p className="text-neutral-600 mb-6">Something went wrong while loading your dashboard. Please try refreshing the page.</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
            >
              <RefreshCw size={20} className="mr-2" />
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