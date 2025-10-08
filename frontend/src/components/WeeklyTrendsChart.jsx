import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useCurrency } from '../contexts/CurrencyContext';

const WeeklyTrendsChart = ({ data, height = 300 }) => {
  const { formatCurrency } = useCurrency();
  return (
    <div className="bg-black/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-black mb-4">Weekly Trends</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="week" 
            stroke="#ffffff" 
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis stroke="#ffffff" fontSize={12} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              border: 'none',
              borderRadius: '8px',
              color: '#333'
            }}
            formatter={(value, name) => [formatCurrency(value), name]}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="expenses" 
            stroke="#ef4444" 
            strokeWidth={3}
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="net" 
            stroke="#3b82f6" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyTrendsChart;