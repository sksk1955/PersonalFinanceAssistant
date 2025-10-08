import { Edit2, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useCurrency } from '../contexts/CurrencyContext';

function TransactionList({ transactions, loading, onEdit, onDelete, pagination, onPageChange }) {
  const { formatCurrency } = useCurrency();
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl mb-4">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
        <p className="text-gray-600 font-medium">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-4">
          <TrendingUp className="text-gray-400" size={40} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
        <p className="text-gray-500">Start by adding your first transaction</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((transaction) => (
              <tr 
                key={transaction._id || transaction.id} 
                className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors duration-200"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(transaction.date), 'EEEE')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                    transaction.type === 'INCOME' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {transaction.type === 'INCOME' ? (
                      <TrendingUp size={16} />
                    ) : (
                      <TrendingDown size={16} />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg border border-gray-200">
                    {transaction.category?.name || transaction.categoryName || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {transaction.description || <span className="text-gray-400 italic">No description</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className={`text-base font-bold ${
                    transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200"
                      title="Edit transaction"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(transaction._id || transaction.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                      title="Delete transaction"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-700 font-medium">
            Showing <span className="font-bold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-bold text-gray-900">{pagination.total}</span> results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700"
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium text-gray-700"
            >
              <span>Next</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionList;