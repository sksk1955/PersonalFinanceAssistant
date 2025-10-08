export interface ExchangeRates {
  [currency: string]: number;
}

export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
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

class CurrencyService {
  private exchangeRates: ExchangeRates = {};
  private lastUpdated: Date | null = null;
  private readonly CACHE_DURATION = 3600000; // 1 hour in milliseconds
  private readonly API_URL = 'https://api.exchangerate-api.com/v4/latest/USD'; // Free API
  
  constructor() {
    this.updateRates();
    // Update rates every hour
    setInterval(() => this.updateRates(), this.CACHE_DURATION);
  }

  private async updateRates(): Promise<void> {
    try {
      console.log('Fetching latest exchange rates...');
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(this.API_URL, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'PersonalFinanceAssistant/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json() as { rates: ExchangeRates };
      this.exchangeRates = data.rates;
      this.exchangeRates['USD'] = 1; // Base currency
      this.lastUpdated = new Date();
      console.log('Exchange rates updated successfully');
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
      // Fallback rates if API fails
      if (Object.keys(this.exchangeRates).length === 0) {
        this.setFallbackRates();
      }
    }
  }

  private setFallbackRates(): void {
    console.log('Using fallback exchange rates');
    this.exchangeRates = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'INR': 83.12,
      'JPY': 149.50,
      'CAD': 1.36,
      'AUD': 1.53,
      'CHF': 0.88,
      'CNY': 7.24,
      'SEK': 10.87,
      'NZD': 1.68,
      'MXN': 17.89,
      'SGD': 1.35,
      'HKD': 7.80,
      'NOK': 10.94,
      'TRY': 27.89,
      'RUB': 97.50,
      'ZAR': 18.67,
      'BRL': 5.02,
      'KRW': 1339.50
    };
    this.lastUpdated = new Date();
  }

  public async getRates(): Promise<ExchangeRates> {
    // If rates are stale or empty, update them
    if (!this.lastUpdated || 
        Date.now() - this.lastUpdated.getTime() > this.CACHE_DURATION ||
        Object.keys(this.exchangeRates).length === 0) {
      await this.updateRates();
    }
    return this.exchangeRates;
  }

  public async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    const rates = await this.getRates();
    
    if (!rates[fromCurrency] || !rates[toCurrency]) {
      throw new Error(`Unsupported currency: ${fromCurrency} or ${toCurrency}`);
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / rates[fromCurrency];
    const convertedAmount = usdAmount * rates[toCurrency];
    
    return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
  }

  public getCurrencySymbol(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  }

  public getCurrencyName(currencyCode: string): string {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.name : currencyCode;
  }

  public getSupportedCurrencies(): CurrencyInfo[] {
    return SUPPORTED_CURRENCIES;
  }

  public getLastUpdated(): Date | null {
    return this.lastUpdated;
  }

  public formatAmount(amount: number, currencyCode: string): string {
    const symbol = this.getCurrencySymbol(currencyCode);
    
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
  }
}

// Singleton instance
export const currencyService = new CurrencyService();
export default currencyService;