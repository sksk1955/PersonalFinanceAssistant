import React from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TransactionVolumeChart = ({ data, height = 300 }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Transaction Volume Analysis</h3>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="period" 
              stroke="#ffffff" 
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" stroke="#ffffff" fontSize={12} />
            <YAxis yAxisId="right" orientation="right" stroke="#ffffff" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.95)',
                border: 'none',
                borderRadius: '8px',
                color: '#333'
              }}
              formatter={(value, name) => [
                name === 'transactionCount' ? value : `$${value.toLocaleString()}`,
                name === 'transactionCount' ? 'Transactions' : 
                name === 'avgAmount' ? 'Avg Amount' : 
                name === 'totalVolume' ? 'Total Volume' : name
              ]}
            />
            <Legend />
            <Bar 
              yAxisId="right"
              dataKey="transactionCount" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
              name="Transaction Count"
              opacity={0.8}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="totalVolume" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="Total Volume"
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="avgAmount" 
              stroke="#f59e0b" 
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Avg Amount"
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-80 flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div>No transaction volume data available</div>
          </div>
        </div>
      )}
      
      {/* Volume Statistics */}
      {data && data.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-purple-400 font-semibold text-lg">
              {data.reduce((sum, item) => sum + (item.transactionCount || 0), 0)}
            </div>
            <div className="text-white/70">Total Transactions</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-semibold text-lg">
              ${data.reduce((sum, item) => sum + (item.totalVolume || 0), 0).toLocaleString()}
            </div>
            <div className="text-white/70">Total Volume</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-400 font-semibold text-lg">
              ${data.length > 0 ? Math.round(data.reduce((sum, item) => sum + (item.avgAmount || 0), 0) / data.length).toLocaleString() : 0}
            </div>
            <div className="text-white/70">Avg Transaction</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionVolumeChart;