import React, { useState, useEffect } from 'react';
import { Upload, FileText, Database, CheckCircle, AlertTriangle, Eye, X, Plus } from 'lucide-react';
import api from '../config/api';

const TransactionHistoryUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedHistory, setExtractedHistory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryMappings, setCategoryMappings] = useState({});
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF file containing transaction history');
      return;
    }

    // Validate file size (20MB)
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > 20) {
      setError(`File size must be less than 20MB (current: ${fileSizeMB.toFixed(2)}MB)`);
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');
    setExtractedHistory(null);
    setSelectedTransactions([]);
    setCategoryMappings({});
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('historyFile', file);

    try {
      const response = await api.post('/transactions/upload-history', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setExtractedHistory(response.data.data);
      setSelectedTransactions(response.data.data.transactions.map((_, index) => index));
      setSuccess('Transaction history processed successfully! Review and select transactions to import.');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionToggle = (index) => {
    setSelectedTransactions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleCategoryChange = (index, categoryId) => {
    setCategoryMappings(prev => ({
      ...prev,
      [index]: categoryId
    }));
  };

  const handleImportTransactions = async () => {
    if (selectedTransactions.length === 0) {
      setError('Please select at least one transaction to import');
      return;
    }

    // Check if all selected transactions have categories assigned
    const missingCategories = selectedTransactions.filter(index => !categoryMappings[index]);
    if (missingCategories.length > 0) {
      setError('Please assign categories to all selected transactions');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const transactionsToImport = selectedTransactions.map(index => extractedHistory.transactions[index]);
      const mappingsArray = selectedTransactions.reduce((acc, index, arrayIndex) => {
        acc[arrayIndex] = categoryMappings[index];
        return acc;
      }, {});

      const response = await api.post('/transactions/create-from-history', {
        transactions: transactionsToImport,
        categoryMappings: mappingsArray
      });

      const { created, failed, summary } = response.data.data;
      setSuccess(`Successfully imported ${summary.created} transactions. ${summary.failed > 0 ? `${summary.failed} failed.` : ''}`);
      
      if (summary.failed > 0) {
        console.log('Import errors:', response.data.data.errors);
      }

      // Reset form after successful import
      if (summary.created > 0) {
        setTimeout(() => {
          setFile(null);
          setExtractedHistory(null);
          setSelectedTransactions([]);
          setCategoryMappings({});
        }, 3000);
      }

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to import transactions');
    } finally {
      setImporting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedTransactions.length === extractedHistory?.transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(extractedHistory?.transactions.map((_, index) => index) || []);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Import Transaction History
        </h1>
        <p className="text-gray-600 text-lg mb-4">Upload PDF bank statements or transaction history powered by advanced OCR technology</p>
        

      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <Upload size={24} className="mr-2 text-blue-600" />
              Upload PDF
            </h2>

            {!file ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <Database size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Drag & drop your PDF file here, or click to browse</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf"
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                  <Upload size={20} className="mr-2" />
                  Select PDF File
                </label>
              </div>
            ) : (
              <div className="border-2 border-blue-200 rounded-xl p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText size={24} className="text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {file && (
              <button
                onClick={handleUpload}
                disabled={loading}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Database size={20} className="mr-2" />
                    Extract Transactions
                  </>
                )}
              </button>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="font-semibold text-gray-700 mb-2">Tips for best results:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use PDF bank statements</li>
                <li>• Ensure transaction tables are clear</li>
                <li>• Include date, description, and amount columns</li>
                <li>• PDF quality affects extraction accuracy</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
              <FileText size={24} className="mr-2 text-green-600" />
              Extracted Transactions
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                <AlertTriangle size={20} className="text-red-600 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center">
                <CheckCircle size={20} className="text-green-600 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {!extractedHistory ? (
              <div className="text-center py-12">
                <Database size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Upload a PDF file to extract transaction history</p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-700">{extractedHistory.transactions.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl">
                    <p className="text-sm text-green-600 font-medium">Selected</p>
                    <p className="text-2xl font-bold text-green-700">{selectedTransactions.length}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-xl">
                    <p className="text-sm text-purple-600 font-medium">Confidence</p>
                    <p className="text-2xl font-bold text-purple-700">{Math.round(extractedHistory.confidence)}%</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={toggleSelectAll}
                    className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {selectedTransactions.length === extractedHistory.transactions.length ? 'Deselect All' : 'Select All'}
                  </button>
                  
                  {selectedTransactions.length > 0 && (
                    <button
                      onClick={handleImportTransactions}
                      disabled={importing}
                      className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 flex items-center"
                    >
                      {importing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Importing...
                        </>
                      ) : (
                        <>
                          <Plus size={16} className="mr-2" />
                          Import {selectedTransactions.length} Transactions
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Transaction List */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Select</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {extractedHistory.transactions.map((transaction, index) => (
                        <tr key={index} className={selectedTransactions.includes(index) ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedTransactions.includes(index)}
                              onChange={() => handleTransactionToggle(index)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                            {transaction.description}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              transaction.type === 'INCOME' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            ${transaction.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={categoryMappings[index] || ''}
                              onChange={(e) => handleCategoryChange(index, e.target.value)}
                              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                              disabled={!selectedTransactions.includes(index)}
                            >
                              <option value="">Select category</option>
                              {categories
                                .filter(cat => cat.type === transaction.type)
                                .map(category => (
                                  <option key={category._id} value={category._id}>
                                    {category.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionHistoryUpload;