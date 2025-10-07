import { Request, Response } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../middlewares/auth.middleware';
import { currencyService } from '../services/currency.service';

export const getUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, currency } = req.body;
    const updateData: any = {};

    if (name) {
      updateData.name = name.trim();
    }

    if (currency) {
      const supportedCurrencies = currencyService.getSupportedCurrencies();
      const isValidCurrency = supportedCurrencies.some(c => c.code === currency);
      
      if (!isValidCurrency) {
        res.status(400).json({ error: 'Invalid currency code' });
        return;
      }
      
      updateData.currency = currency;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      currency: user.currency,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getSupportedCurrencies = async (req: Request, res: Response): Promise<void> => {
  try {
    const currencies = currencyService.getSupportedCurrencies();
    const exchangeRates = await currencyService.getRates();
    const lastUpdated = currencyService.getLastUpdated();

    res.json({
      currencies,
      exchangeRates,
      lastUpdated
    });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const convertCurrency = async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, fromCurrency, toCurrency } = req.body;

    if (!amount || !fromCurrency || !toCurrency) {
      res.status(400).json({ 
        error: 'Missing required fields: amount, fromCurrency, toCurrency' 
      });
      return;
    }

    if (typeof amount !== 'number' || amount < 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const convertedAmount = await currencyService.convertAmount(
      amount, 
      fromCurrency, 
      toCurrency
    );

    res.json({
      originalAmount: amount,
      fromCurrency,
      toCurrency,
      convertedAmount,
      exchangeRate: convertedAmount / amount,
      lastUpdated: currencyService.getLastUpdated()
    });
  } catch (error) {
    console.error('Currency conversion error:', error);
    res.status(500).json({ error: 'Currency conversion failed' });
  }
};