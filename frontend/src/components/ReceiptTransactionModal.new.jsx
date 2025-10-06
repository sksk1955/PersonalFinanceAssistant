import { useState, useEffect } from 'react';
import { X, AlertCircle, CheckCircle, Calendar, DollarSign, Tag, FileText } from 'lucide-react';
import api from '../config/api';
import { format } from 'date-fns';

function ReceiptTransactionModal({ extractedData, categories, onSave, onClose }) {
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    categoryId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (extractedData) {
      // Pre-fill form with extracted data
      setFormData(prev => ({
        ...prev,
        amount: (extractedData.amount || extractedData.total || '').toString(),
        date: extractedData.date ? format(new Date(extractedData.date), 'yyyy-MM-dd') : prev.date,
        description: buildDescription(extractedData)
      }));
    }
  }, [extractedData]);

  const buildDescription = (data) => {
    const parts = [];
    if (data.merchant) parts.push(data.merchant);
    if (data.receiptNumber) parts.push(`Receipt #${data.receiptNumber}`);
    if (data.items && data.items.length > 0) {
      parts.push(`${data.items.length} item${data.items.length > 1 ? 's' : ''}`);
    }
    return parts.length > 0 ? parts.join(' - ') : 'Receipt transaction';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/transactions/create-from-receipt', {
        extractedData,
        userInputs: {
          ...formData,
          amount: parseFloat(formData.amount)
        }
      });

      await onSave(response.data.transaction);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create transaction');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-8 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">📋 Create Transaction from Receipt</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Extracted Data Preview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={20} />
              🤖 Extracted Data
            </h3>
            
            {extractedData?.confidence && (
              <div className="mb-4 p-3 bg-white rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">AI Confidence Score:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(extractedData.confidence.overall * 100)}%` }}
                    />
                  </div>
                  <span className={`text-sm font-semibold ${getConfidenceColor(extractedData.confidence.overall)}`}>
                    {getConfidenceText(extractedData.confidence.overall)} ({(extractedData.confidence.overall * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {extractedData?.merchant && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">🏪 Merchant</p>
                  <p className="text-lg font-semibold text-gray-900">{extractedData.merchant}</p>
                </div>
              )}

              {(extractedData?.amount || extractedData?.total) && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">💰 Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(extractedData.amount || extractedData.total).toFixed(2)}
                  </p>
                  {extractedData.subtotal && (
                    <p className="text-sm text-gray-500">Subtotal: ${extractedData.subtotal.toFixed(2)}</p>
                  )}
                  {extractedData.tax && (
                    <p className="text-sm text-gray-500">Tax: ${extractedData.tax.toFixed(2)}</p>
                  )}
                </div>
              )}

              {extractedData?.date && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">📅 Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(extractedData.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}

              {extractedData?.items && extractedData.items.length > 0 && (
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 mb-2">🛍️ Items ({extractedData.items.length})</p>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {extractedData.items.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700">{item.name}</span>
                        <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                    {extractedData.items.length > 5 && (
                      <p className="text-xs text-gray-500">... and {extractedData.items.length - 5} more items</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction Form */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Tag size={20} />
              ✏️ Complete Transaction Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Transaction Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'type', value: 'EXPENSE' } })}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      formData.type === 'EXPENSE'
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💸 Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange({ target: { name: 'type', value: 'INCOME' } })}
                    className={`py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                      formData.type === 'INCOME'
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg transform scale-105'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    💰 Income
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign size={16} className="inline mr-1" />
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.filter(c => c.type === formData.type).map(category => (
                    <option key={category._id || category.id} value={category._id || category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Date
                </label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 resize-none"
                  placeholder="Transaction description..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? '⏳ Creating...' : '✅ Create Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceiptTransactionModal;