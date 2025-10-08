import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SpendingHeatmapChart = ({ data, height = 300 }) => {
  // Process data for heatmap visualization
  const processedData = data.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    amount: item.amount,
    count: item.count,
    intensity: Math.min(item.amount / 100, 10) // Normalize intensity
  }));

  const getIntensityColor = (intensity) => {
    const alpha = Math.min(intensity / 10, 1);
    return `rgba(239, 68, 68, ${alpha})`;
  };

  return (
    <div className="bg-black/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-black mb-4">Spending Heatmap</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="date" 
            stroke="#ffffff" 
            fontSize={10}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={Math.max(Math.floor(processedData.length / 10), 1)}
          />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '8px',
              color: '#333'
            }}
            formatter={(value, name) => [
              name === 'count' ? value : `$${value.toLocaleString()}`,
              name === 'amount' ? 'Amount' : name === 'count' ? 'Transactions' : name
            ]}
          />
          <Area 
            type="monotone" 
            dataKey="amount" 
            stroke="#ef4444" 
            fill="url(#colorAmount)"
            strokeWidth={2}
          />
          <defs>
            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Heatmap Legend */}
      <div className="mt-4 flex items-center justify-between text-sm text-black/70">
        <span>Low Activity</span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: getIntensityColor(level * 2) }}
            />
          ))}
        </div>
        <span>High Activity</span>
      </div>
    </div>
  );
};

export default SpendingHeatmapChart;