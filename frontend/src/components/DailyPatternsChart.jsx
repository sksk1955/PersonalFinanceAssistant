import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DailyPatternsChart = ({ data, height = 300 }) => {
  return (
    <div className="bg-black/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-black mb-4">Daily Spending Patterns</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis 
            dataKey="day" 
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
            formatter={(value, name) => [
              name === 'transactions' ? value : `$${value.toLocaleString()}`,
              name === 'transactions' ? 'Transactions' : name
            ]}
          />
          <Legend />
          <Bar 
            dataKey="expenses" 
            fill="#ef4444" 
            radius={[4, 4, 0, 0]}
            name="Expenses"
          />
          <Bar 
            dataKey="income" 
            fill="#10b981" 
            radius={[4, 4, 0, 0]}
            name="Income"
          />
          <Bar 
            dataKey="transactions" 
            fill="#8b5cf6" 
            radius={[4, 4, 0, 0]}
            name="Transaction Count"
            yAxisId="right"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyPatternsChart;