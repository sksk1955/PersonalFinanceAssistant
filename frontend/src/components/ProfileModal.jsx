import React, { useState, useEffect } from 'react';
import { User, Settings, Globe, Loader, Check, X } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import api from '../config/api';

const ProfileModal = ({ isOpen, onClose }) => {
  const { 
    userCurrency, 
    supportedCurrencies, 
    updateUserCurrency, 
    loading: currencyLoading 
  } = useCurrency();
  
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currency: userCurrency
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    setProfile(prev => ({ ...prev, currency: userCurrency }));
  }, [userCurrency]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/profile');
      setProfile({
        name: response.data.name || '',
        email: response.data.email || '',
        currency: response.data.currency || userCurrency
      });
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setMessage('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');

      // Update profile
      const profileResponse = await api.put('/users/profile', {
        name: profile.name,
        currency: profile.currency
      });

      // Update currency context if currency changed
      if (profile.currency !== userCurrency) {
        await updateUserCurrency(profile.currency);
      }

      setMessage('Profile updated successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <User size={20} className="text-blue-300" />
            </div>
            <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin text-blue-400" size={24} />
              <span className="ml-2 text-white/70">Loading profile...</span>
            </div>
          ) : (
            <>
              {/* Name Field */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field (Read-only) */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/60 cursor-not-allowed"
                />
                <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
              </div>

              {/* Currency Selection */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  <Globe size={16} className="inline mr-1" />
                  Preferred Currency
                </label>
                <select
                  value={profile.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  disabled={currencyLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {supportedCurrencies.map((currency) => (
                    <option 
                      key={currency.code} 
                      value={currency.code}
                      className="bg-gray-800 text-white"
                    >
                      {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-white/50 mt-1">
                  All amounts will be displayed in your preferred currency
                </p>
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('successfully') 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {message.includes('successfully') && <Check size={16} className="inline mr-1" />}
                  {message}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader className="animate-spin mr-2" size={16} />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;