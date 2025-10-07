import React, { useState, useEffect } from 'react';
import { X, DollarSign, FileText, Tag, Calendar, TrendingDown, TrendingUp, Sparkles } from 'lucide-react';
import api from '../config/api';

const ReceiptTransactionModal = ({ 
  isOpen, 
  onClose, 
  extractedData, 
  categories, 
  onTransactionCreated 
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    categoryId: '',
    type: 'EXPENSE',
    date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (extractedData && isOpen) {
      setFormData({
        amount: extractedData.amount || '',
        description: extractedData.merchant || extractedData.description || '',
        categoryId: extractedData.category || '',
        type: 'EXPENSE',
        date: extractedData.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [extractedData, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.amount || !formData.description || !formData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await api.post('/transactions', transactionData);
      onTransactionCreated();
      onClose();
      
      setFormData({
        amount: '',
        description: '',
        categoryId: '',
        type: 'EXPENSE',
        date: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all animate-slideUp">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                Create Transaction
              </h2>
              <p className="text-sm text-gray-500">From receipt data</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Extracted Info Banner */}
          {extractedData && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-600" />
                <h3 className="text-sm font-semibold text-blue-900">AI Extracted Data</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {extractedData.merchant && (
                  <div>
                    <span className="text-gray-600 block">Merchant</span>
                    <span className="text-gray-900 font-semibold">{extractedData.merchant}</span>
                  </div>
                )}
                {extractedData.amount && (
                  <div>
                    <span className="text-gray-600 block">Amount</span>
                    <span className="text-gray-900 font-semibold">${extractedData.amount}</span>
                  </div>
                )}
                {extractedData.date && (
                  <div>
                    <span className="text-gray-600 block">Date</span>
                    <span className="text-gray-900 font-semibold">{extractedData.date}</span>
                  </div>
                )}
                {extractedData.confidence && (
                  <div>
                    <span className="text-gray-600 block">Confidence</span>
                    <span className="text-gray-900 font-semibold">{Math.round(extractedData.confidence)}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'type', value: 'EXPENSE' } })}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    formData.type === 'EXPENSE'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30 transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-red-200'
                  }`}
                >
                  <TrendingDown size={18} />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'type', value: 'INCOME' } })}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                    formData.type === 'INCOME'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30 transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent hover:border-green-200'
                  }`}
                >
                  <TrendingUp size={18} />
                  Income
                </button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign size={20} className="text-gray-400" />
                </div>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-lg font-semibold"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FileText size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Transaction description"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Category *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tag size={20} className="text-gray-400" />
                </div>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar size={20} className="text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReceiptTransactionModal;