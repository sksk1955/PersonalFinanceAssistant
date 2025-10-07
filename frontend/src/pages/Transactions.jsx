import { useState, useEffect } from 'react';
import { Plus, Filter, Download, Upload, Database } from 'lucide-react';
import api from '../config/api';
import TransactionList from '../components/TransactionList';
import TransactionModal from '../components/TransactionModal';
import FilterModal from '../components/FilterModal';
import { format } from 'date-fns';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    categoryId: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      setCategories([]);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '')
        )
      });

      const response = await api.get(`/transactions?${params}`);
      setTransactions(response.data.transactions || []);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
    } catch (error) {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowModal(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction?')) return;

    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (error) {
      alert('Failed to delete transaction');
    }
  };

  const handleSaveTransaction = async (transactionData) => {
    try {
      
      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction._id || editingTransaction.id}`, transactionData);
      } else {
        await api.post('/transactions', transactionData);
      }
      
      setShowModal(false);
      fetchTransactions();
    } catch (error) {
      throw error;
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setShowFilterModal(false);
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Amount', 'Description'],
      ...transactions.map(t => [
        format(new Date(t.date), 'yyyy-MM-dd'),
        t.type,
        t.category?.name || t.categoryId,
        t.amount,
        t.description || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Transactions</h1>
            <p className="text-lg text-gray-600">Manage your income and expenses</p>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total: {pagination.total || 0} transactions
            </div>
          </div>
        </div>
      </div>



      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={handleAddTransaction}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus size={20} />
          Add Transaction
        </button>
        
        <button
          onClick={() => setShowFilterModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Filter size={20} className="text-gray-600" />
          <span className="text-gray-700">Filter</span>
        </button>
        
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Download size={20} className="text-gray-600" />
          <span className="text-gray-700">Export CSV</span>
        </button>
        
        <a
          href="/upload"
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Upload size={20} className="text-gray-600" />
          <span className="text-gray-700">Upload Receipt</span>
        </a>
        
        <a
          href="/upload-history"
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Database size={20} className="text-gray-600" />
          <span className="text-gray-700">Import History</span>
        </a>
      </div>

      <TransactionList
        transactions={transactions}
        loading={loading}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
      />

      {showModal && (
        <TransactionModal
          transaction={editingTransaction}
          categories={categories}
          onSave={handleSaveTransaction}
          onClose={() => setShowModal(false)}
        />
      )}

      {showFilterModal && (
        <FilterModal
          filters={filters}
          categories={categories}
          onApply={handleApplyFilters}
          onClose={() => setShowFilterModal(false)}
        />
      )}
    </div>
  );
}

export default Transactions;
