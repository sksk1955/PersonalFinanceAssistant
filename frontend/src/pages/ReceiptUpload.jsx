import { useState, useEffect } from 'react';
import { Upload, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../config/api';
import { format } from 'date-fns';
import ReceiptTransactionModal from '../components/ReceiptTransactionModal';

function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Fetch categories on component mount
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

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setSuccess('');
    setExtractedData(null);
  };

  const handleViewReceipt = () => {
    if (preview) {
      // Open in new tab
      const newWindow = window.open();
      newWindow.document.write(`
        <html>
          <head><title>Receipt Preview</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#f3f4f6;">
            <img src="${preview}" style="max-width:100%; max-height:100vh; object-fit:contain;" alt="Receipt" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }

    // Validate file size (10MB)
    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      setError(`File size must be less than 10MB (current: ${fileSizeMB.toFixed(2)}MB)`);
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');
    setExtractedData(null);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
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
    formData.append('receipt', file);

    try {
      const response = await api.post('/transactions/upload-receipt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setExtractedData(response.data.data);
      setSuccess('Receipt processed successfully! Review the extracted data below.');
      setShowTransactionModal(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process receipt');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">📄 Upload Receipt</h1>
        <p className="text-gray-600 text-lg">🤖 Extract transaction data from receipts automatically</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">📁 Upload File</h2>

          <div className="border-3 border-dashed border-blue-200 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 bg-gradient-to-br from-blue-25 to-purple-25">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl mb-6 shadow-lg">
                <Upload size={40} className="text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                📤 Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                📷 PNG, JPG or 📄 PDF (max. 10MB)
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-400 to-green-500 rounded-xl">
                  {file.type === 'application/pdf' ? (
                    <FileText size={24} className="text-white" />
                  ) : (
                    <Image size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900">✅ {file.name}</p>
                  <p className="text-sm text-gray-600">
                    📊 {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {preview && (
                      <button
                        onClick={handleViewReceipt}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Image size={16} />
                        👁️ View Receipt
                      </button>
                    )}
                    <button
                      onClick={handleRemoveFile}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
                    >
                      ❌ Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full mt-8 py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed text-lg"
          >
            {loading ? '⏳ Processing...' : '🚀 Extract Data'}
          </button>
        </div>

        {/* Extracted Data Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">📊 Extracted Data</h2>

          {!extractedData ? (
            <div className="text-center py-16 text-gray-500">
              <div className="p-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl inline-block mb-6">
                <FileText size={64} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium">📋 Upload a receipt to see extracted data</p>
              <p className="text-sm mt-2">AI will automatically extract transaction details</p>
            </div>
          ) : (
            <div className="space-y-4">
              {extractedData.merchant && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Merchant
                  </label>
                  <p className="text-gray-900">{extractedData.merchant}</p>
                </div>
              )}

              {(extractedData.amount || extractedData.total) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(extractedData.amount || extractedData.total).toFixed(2)}
                  </p>
                </div>
              )}

              {extractedData.date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <p className="text-gray-900">
                    {format(new Date(extractedData.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}

              {extractedData.items && extractedData.items.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Items
                  </label>
                  <div className="space-y-2">
                    {extractedData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-900">{item.name}</span>
                        <span className="text-sm font-medium text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.rawText && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raw Text
                  </label>
                  <div className="max-h-40 overflow-y-auto p-3 bg-gray-50 rounded text-xs text-gray-600 font-mono">
                    {extractedData.rawText}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowTransactionModal(true)}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-lg"
              >
                ✅ Create Transaction
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 shadow-lg">
        <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">💡 Tips for better results</h3>
        <ul className="text-sm text-blue-800 space-y-3">
          <li className="flex items-center gap-2">🔆 Ensure the receipt is well-lit and in focus</li>
          <li className="flex items-center gap-2">👀 Make sure all text is clearly visible</li>
          <li className="flex items-center gap-2">🚫 Avoid shadows or glare on the receipt</li>
          <li className="flex items-center gap-2">📄 PDF receipts work better than photos for tabular data</li>
        </ul>
      </div>

      {/* Receipt Transaction Modal */}
      <ReceiptTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        extractedData={extractedData}
        categories={categories}
        onTransactionCreated={() => {
          setShowTransactionModal(false);
          setSuccess('Transaction created successfully!');
          // Optionally clear the form
          handleRemoveFile();
        }}
      />
    </div>
  );
}

export default ReceiptUpload;
