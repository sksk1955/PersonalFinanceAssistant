import React, { useState } from 'react';
import { Calendar, Filter, TrendingUp, BarChart3, Clock, Target } from 'lucide-react';

const AdvancedFilterPanel = ({ 
  filters, 
  onFiltersChange, 
  onToggleChart,
  activeCharts = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const chartTypes = [
    { id: 'weekly', name: 'Weekly Trends', icon: TrendingUp },
    { id: 'daily', name: 'Daily Patterns', icon: BarChart3 },
    { id: 'heatmap', name: 'Spending Heatmap', icon: Target },
    { id: 'volume', name: 'Transaction Volume', icon: Clock }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleDateRangeChange = (type, value) => {
    handleFilterChange('dateRange', {
      ...filters.dateRange,
      [type]: value
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-black flex items-center">
          <Filter className="mr-2" size={20} />
          Advanced Filters & Charts
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-black/70 hover:text-black transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Chart Toggle Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {chartTypes.map(chart => {
          const Icon = chart.icon;
          const isActive = activeCharts.includes(chart.id);
          
          return (
            <button
              key={chart.id}
              onClick={() => onToggleChart(chart.id)}
              className={`flex items-center justify-center p-3 rounded-lg border transition-all ${
                isActive
                  ? 'bg-blue-500/30 border-blue-400 text-blue-100'
                  : 'bg-white/5 border-white/20 text-black/70 hover:bg-white/10 hover:text-black'
              }`}
            >
              <Icon size={16} className="mr-2" />
              <span className="text-sm font-medium">{chart.name}</span>
            </button>
          );
        })}
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Date Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                <Calendar size={16} className="inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.start || ''}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                End Date
              </label>
              <input
                type="date"
                value={filters.dateRange?.end || ''}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                Quick Ranges
              </label>
              <select
                onChange={(e) => {
                  const value = e.target.value;
                  const now = new Date();
                  let start = new Date();
                  
                  switch(value) {
                    case '7d':
                      start.setDate(now.getDate() - 7);
                      break;
                    case '30d':
                      start.setDate(now.getDate() - 30);
                      break;
                    case '90d':
                      start.setDate(now.getDate() - 90);
                      break;
                    case '1y':
                      start.setFullYear(now.getFullYear() - 1);
                      break;
                    default:
                      return;
                  }
                  
                  handleFilterChange('dateRange', {
                    start: start.toISOString().split('T')[0],
                    end: now.toISOString().split('T')[0]
                  });
                }}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Range</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>

          {/* Amount Range Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                Min Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountRange?.min || ''}
                onChange={(e) => handleFilterChange('amountRange', {
                  ...filters.amountRange,
                  min: e.target.value
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                Max Amount ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.amountRange?.max || ''}
                onChange={(e) => handleFilterChange('amountRange', {
                  ...filters.amountRange,
                  max: e.target.value
                })}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-black placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10000.00"
              />
            </div>
          </div>

          {/* Chart Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                Weekly Trends Period
              </label>
              <select
                value={filters.weeklyPeriod || '12'}
                onChange={(e) => handleFilterChange('weeklyPeriod', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="4">4 Weeks</option>
                <option value="8">8 Weeks</option>
                <option value="12">12 Weeks</option>
                <option value="24">24 Weeks</option>
              </select>
            </div>
            <div>
              <label className="block text-black/70 text-sm font-medium mb-2">
                Daily Pattern Period
              </label>
              <select
                value={filters.dailyPeriod || '30'}
                onChange={(e) => handleFilterChange('dailyPeriod', e.target.value)}
                className="w-full px-3 py-2 bg-black/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last Week</option>
                <option value="30">Last Month</option>
                <option value="90">Last 3 Months</option>
              </select>
            </div>
            <div>
              <label className="block text-white/70 text-sm font-medium mb-2">
                Volume Analysis Period
              </label>
              <select
                value={filters.volumePeriod || 'week'}
                onChange={(e) => handleFilterChange('volumePeriod', e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                onFiltersChange({
                  dateRange: {},
                  amountRange: {},
                  weeklyPeriod: '12',
                  dailyPeriod: '30',
                  volumePeriod: 'week'
                });
              }}
              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilterPanel;