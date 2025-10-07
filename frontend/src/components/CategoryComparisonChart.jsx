import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CategoryComparisonChart = ({ data, height = 300 }) => {
  return (
    <div className="bg-black/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-black mb-4">Category Comparison</h3>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={data} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis type="number" stroke="#ffffff" fontSize={12} />
          <YAxis 
            dataKey="categoryName" 
            type="category" 
            stroke="#ffffff" 
            fontSize={12}
            width={120}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '8px',
              color: '#333'
            }}
            formatter={(value, name) => [
              name.includes('Amount') ? `$${value.toLocaleString()}` : `${value}%`,
              name
            ]}
          />
          <Legend />
          <Bar 
            dataKey="currentAmount" 
            fill="#3b82f6" 
            radius={[0, 4, 4, 0]}
            name="Current Amount"
          />
          <Bar 
            dataKey="previousAmount" 
            fill="#6b7280" 
            radius={[0, 4, 4, 0]}
            name="Previous Amount"
            opacity={0.7}
          />
          <Line 
            type="monotone" 
            dataKey="changePercent" 
            stroke="#f59e0b" 
            strokeWidth={3}
            yAxisId="right"
            name="Change %"
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* Trend Indicators */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div className="text-center">
          <div className="text-green-400 font-semibold">
            {data.filter(item => item.trend === 'down').length}
          </div>
          <div className="text-black/70">Decreased</div>
        </div>
        <div className="text-center">
          <div className="text-yellow-400 font-semibold">
            {data.filter(item => item.trend === 'stable').length}
          </div>
          <div className="text-black/70">Stable</div>
        </div>
        <div className="text-center">
          <div className="text-red-400 font-semibold">
            {data.filter(item => item.trend === 'up').length}
          </div>
          <div className="text-black/70">Increased</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryComparisonChart;