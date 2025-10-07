import { useState, useEffect } from 'react';
import { Upload, FileText, Image, AlertCircle, CheckCircle, Sparkles, Eye, Trash2 } from 'lucide-react';
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

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a valid image (JPEG, PNG) or PDF file');
      return;
    }

    const fileSizeMB = selectedFile.size / (1024 * 1024);
    if (fileSizeMB > 10) {
      setError(`File size must be less than 10MB (current: ${fileSizeMB.toFixed(2)}MB)`);
      return;
    }

    setFile(selectedFile);
    setError('');
    setSuccess('');
    setExtractedData(null);

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Upload Receipt
        </h1>
        <p className="text-gray-600 text-lg">Extract transaction data automatically with AI</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-3"></div>
            Upload File
          </h2>

          <div className="relative border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 bg-gradient-to-br from-gray-50 to-blue-50">
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
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 transform hover:scale-110 transition-transform duration-300">
                <Upload size={36} className="text-white" />
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG or PDF (max. 10MB)
              </p>
            </label>
          </div>

          {file && (
            <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg shadow-green-500/30">
                  {file.type === 'application/pdf' ? (
                    <FileText size={24} className="text-white" />
                  ) : (
                    <Image size={24} className="text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 mt-3">
                    {preview && (
                      <button
                        onClick={handleViewReceipt}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    )}
                    <button
                      onClick={handleRemoveFile}
                      className="flex items-center gap-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">{success}</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Extract Data</span>
              </>
            )}
          </button>
        </div>

       {/* Extracted Data Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full mr-3"></div>
            Extracted Data
          </h2>

          {!extractedData ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                <FileText size={40} className="text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">No data yet</p>
              <p className="text-sm text-gray-500">Upload a receipt to see extracted data</p>
            </div>
          ) : (
            <div className="space-y-5">
              {extractedData.merchant && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Merchant
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{extractedData.merchant}</p>
                </div>
              )}

              {(extractedData.amount || extractedData.total) && (
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Amount
                  </label>
                  <p className="text-3xl font-bold text-green-600">
                    ${(extractedData.amount || extractedData.total).toFixed(2)}
                  </p>
                </div>
              )}

              {extractedData.date && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Date
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {format(new Date(extractedData.date), 'MMM dd, yyyy')}
                  </p>
                </div>
              )}

              {extractedData.items && extractedData.items.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
                    Items ({extractedData.items.length})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {extractedData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200 transition-colors"
                      >
                        <span className="text-sm font-medium text-gray-700">{item.name}</span>
                        <span className="text-sm font-bold text-gray-900">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {extractedData.rawText && (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                    Raw Text
                  </label>
                  <div className="max-h-32 overflow-y-auto p-3 bg-white rounded-lg text-xs text-gray-600 font-mono border border-gray-100">
                    {extractedData.rawText}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowTransactionModal(true)}
                className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] text-base flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                <span>Create Transaction</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
          <Sparkles size={20} className="mr-2" />
          Tips for better results
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">Ensure the receipt is well-lit and in focus</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">Make sure all text is clearly visible</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">Avoid shadows or glare on the receipt</p>
          </div>
          <div className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <p className="text-sm text-blue-800">PDF receipts work better than photos</p>
          </div>
        </div>
      </div>

      <ReceiptTransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        extractedData={extractedData}
        categories={categories}
        onTransactionCreated={() => {
          setShowTransactionModal(false);
          setSuccess('Transaction created successfully!');
          handleRemoveFile();
        }}
      />
    </div>
  );
}

export default ReceiptUpload;