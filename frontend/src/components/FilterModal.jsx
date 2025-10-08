import { useState } from 'react';
import { X, Filter, Calendar, Tag, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

function FilterModal({ filters, categories, onApply, onClose }) {
  const [formData, setFormData] = useState(filters);

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(formData);
  };

  const handleClear = () => {
    const clearedFilters = {
      startDate: '',
      endDate: '',
      type: '',
      categoryId: ''
    };
    setFormData(clearedFilters);
    onApply(clearedFilters);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform transition-all animate-slideUp">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
                Filter Transactions
              </h2>
              <p className="text-sm text-gray-500">Refine your search</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-3">
                Transaction Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: '' } })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.type === ''
                      ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter size={16} className="inline mr-1" />
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'INCOME' } })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.type === 'INCOME'
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp size={16} className="inline mr-1" />
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => handleChange({ target: { name: 'type', value: 'EXPENSE' } })}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    formData.type === 'EXPENSE'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingDown size={16} className="inline mr-1" />
                  Expense
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="categoryId" className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Tag size={20} className="text-gray-400" />
                </div>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 px-5 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw size={18} />
                Clear
              </button>
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Filter size={18} />
                Apply
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
}

export default FilterModal;