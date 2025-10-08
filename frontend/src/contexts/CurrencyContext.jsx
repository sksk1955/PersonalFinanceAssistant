import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' }
];

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [userCurrency, setUserCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Get currency symbol
  const getCurrencySymbol = (currencyCode) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  // Get currency name
  const getCurrencyName = (currencyCode) => {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.name : currencyCode;
  };

  // Format amount with proper currency symbol and locale
  const formatCurrency = (amount, currencyCode = userCurrency) => {
    const symbol = getCurrencySymbol(currencyCode);
    
    // Special formatting for different currencies
    switch (currencyCode) {
      case 'INR':
        // Indian numbering system
        return `${symbol}${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
      case 'JPY':
      case 'KRW':
        // No decimal places for these currencies
        return `${symbol}${Math.round(amount).toLocaleString()}`;
      default:
        return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  // Convert amount between currencies
  const convertCurrency = async (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    
    try {
      const response = await api.post('/users/convert-currency', {
        amount,
        fromCurrency,
        toCurrency
      });
      return response.data.convertedAmount;
    } catch (error) {
      console.error('Currency conversion failed:', error);
      return amount; // Return original amount if conversion fails
    }
  };

  // Update user's preferred currency
  const updateUserCurrency = async (newCurrency) => {
    try {
      setLoading(true);
      const response = await api.put('/users/profile', {
        currency: newCurrency
      });
      
      if (response.data.currency) {
        setUserCurrency(newCurrency);
        localStorage.setItem('userCurrency', newCurrency);
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile and currency info
  const fetchCurrencyData = async () => {
    try {
      setLoading(true);
      const [profileResponse, currenciesResponse] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/currencies')
      ]);

      if (profileResponse.data.currency) {
        setUserCurrency(profileResponse.data.currency);
        localStorage.setItem('userCurrency', profileResponse.data.currency);
      }

      if (currenciesResponse.data) {
        setExchangeRates(currenciesResponse.data.exchangeRates || {});
        setLastUpdated(currenciesResponse.data.lastUpdated);
      }
    } catch (error) {
      console.error('Failed to fetch currency data:', error);
      // Use fallback from localStorage
      const savedCurrency = localStorage.getItem('userCurrency');
      if (savedCurrency) {
        setUserCurrency(savedCurrency);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initialize currency data
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrencyData();
    } else {
      // Use saved currency or default for logged out users
      const savedCurrency = localStorage.getItem('userCurrency') || 'USD';
      setUserCurrency(savedCurrency);
      setLoading(false);
    }
  }, []);

  const value = {
    userCurrency,
    exchangeRates,
    lastUpdated,
    loading,
    supportedCurrencies: SUPPORTED_CURRENCIES,
    getCurrencySymbol,
    getCurrencyName,
    formatCurrency,
    convertCurrency,
    updateUserCurrency,
    refreshCurrencyData: fetchCurrencyData
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;