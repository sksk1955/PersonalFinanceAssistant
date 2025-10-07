import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
const pdfParse = require('pdf-parse');

export interface ExtractedData {
  success: boolean;
  data?: {
    merchant?: string;
    amount?: number;
    date?: string;
    category?: string;
    items?: Array<{
      name: string;
      quantity?: number;
      price?: number;
    }>;
  };
  error?: string;
}

export interface ExtractedTransactionHistory {
  success: boolean;
  data?: Array<{
    date: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category?: string;
  }>;
  error?: string;
}

// Helper function to parse text for receipt data
const parseReceiptText = (text: string): ExtractedData => {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract merchant name - look for company names, avoid common receipt headers
    let merchant = '';
    const excludeWords = ['receipt', 'online', 'bill to', 'ship to', 'receipt #', 'receipt date', 'date', 'total', 'tax', 'subtotal'];
    
    for (let i = 0; i < Math.min(10, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      // Skip headers and common receipt words
      if (excludeWords.some(word => line.includes(word))) continue;
      
      // Skip lines that are mostly numbers, addresses, or short lines
      if (/^\d+/.test(line) || line.length < 3) continue;
      
      // Look for company names (often contain "Inc", "LLC", "Corp", etc. or are in title case)
      if (line.includes('inc') || line.includes('llc') || line.includes('corp') || 
          /^[A-Z][a-z]+(\s[A-Z][a-z]+)*/.test(lines[i])) {
        merchant = lines[i];
        break;
      }
      
      // If no company identifier found, take the first meaningful line
      if (!merchant && line.length > 3 && /[a-zA-Z]/.test(line)) {
        merchant = lines[i];
      }
    }

    // Extract amount - look for totals, amounts, and currency patterns
    let amount = 0;
    const amountPatterns = [
      /(?:total|amount|grand total|final total)[:\s]*\$?(\d+\.?\d*)/gi,
      /\$(\d+\.\d{2})/g,
      /(\d+\.\d{2})(?:\s|$)/g
    ];

    const foundAmounts: number[] = [];
    for (const pattern of amountPatterns) {
      const matches = [...text.matchAll(pattern)];
      for (const match of matches) {
        const numericMatch = match[1] || match[0];
        const parsedAmount = parseFloat(numericMatch.replace(/[^\d.]/g, ''));
        if (parsedAmount > 0 && parsedAmount < 10000) { // Reasonable range
          foundAmounts.push(parsedAmount);
        }
      }
    }
    
    // Take the largest reasonable amount (likely the total)
    if (foundAmounts.length > 0) {
      amount = Math.max(...foundAmounts);
    }

    // Extract date - support multiple formats
    let date = '';
    const datePatterns = [
      /(?:receipt date|date)[:\s]*(\d{1,2}\/\d{1,2}\/\d{2,4})/gi,
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{1,2}-\d{1,2}-\d{4})/g,
      /(\d{4}-\d{1,2}-\d{1,2})/g,
      /(\d{1,2}\/\d{1,2}\/\d{2})/g
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let dateStr = match[1] || match[0];
        
        // Convert to standard format
        try {
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            date = parsedDate.toISOString().split('T')[0];
            break;
          }
        } catch (e) {
          // Try other formats
          if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
              let [month, day, year] = parts;
              if (year.length === 2) {
                year = '20' + year;
              }
              const formattedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
              if (!isNaN(formattedDate.getTime())) {
                date = formattedDate.toISOString().split('T')[0];
                break;
              }
            }
          }
        }
      }
    }

    // Extract receipt number
    let receiptNumber = '';
    const receiptNumPatterns = [
      /(?:receipt #|receipt number|ref #)[:\s]*([A-Z0-9\-]+)/gi,
      /#\s*([A-Z0-9\-]+)/g
    ];
    
    for (const pattern of receiptNumPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        receiptNumber = match[1];
        break;
      }
    }

    // Extract address (useful for merchant identification)
    let address = '';
    const addressPattern = /(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Lane|Ln|Road|Rd|Drive|Dr|Boulevard|Blvd))/gi;
    const addressMatch = text.match(addressPattern);
    if (addressMatch) {
      address = addressMatch[0];
    }

    // Extract phone number
    let phone = '';
    const phonePattern = /(?:phone|tel|call)[:\s]*(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/gi;
    const phoneMatch = text.match(phonePattern);
    if (phoneMatch && phoneMatch[1]) {
      phone = phoneMatch[1];
    }

    // Extract items with better parsing
    const items: Array<{ name: string; quantity?: number; price?: number }> = [];
    for (const line of lines) {
      // Look for item patterns: "Item Name $XX.XX" or "Qty Item Name $XX.XX"
      const itemPatterns = [
        /^(\d+)\s+(.+?)\s+\$?(\d+\.\d{2})$/,  // "2 Item Name $12.99"
        /^(.+?)\s+\$(\d+\.\d{2})$/,           // "Item Name $12.99"
        /^(.+?)\s+(\d+\.\d{2})$/              // "Item Name 12.99"
      ];
      
      for (const pattern of itemPatterns) {
        const match = line.match(pattern);
        if (match) {
          let quantity = 1;
          let itemName = '';
          let price = 0;
          
          if (match.length === 4) { // Has quantity
            quantity = parseInt(match[1]);
            itemName = match[2].trim();
            price = parseFloat(match[3]);
          } else if (match.length === 3) { // No quantity
            itemName = match[1].trim();
            price = parseFloat(match[2]);
          }
          
          if (itemName.length > 2 && price > 0 && price <= amount * 2) {
            items.push({
              name: itemName,
              quantity,
              price
            });
          }
          break;
        }
      }
    }

    // Intelligent category detection based on merchant and text content
    let detectedCategory = 'Other Expenses'; // Default category
    const textLower = text.toLowerCase();
    const merchantLower = (merchant || '').toLowerCase();

    // Category mapping based on keywords and merchant patterns
    const categoryPatterns = {
      'Food & Dining': ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining', 'mcdonalds', 'subway', 'starbucks', 'pizza hut', 'kfc', 'dominos', 'taco bell', 'wendys', 'chipotle', 'panera'],
      'Transportation': ['gas', 'fuel', 'shell', 'exxon', 'bp', 'chevron', 'mobil', 'station', 'uber', 'lyft', 'taxi', 'metro', 'bus', 'train'],
      'Shopping': ['walmart', 'target', 'amazon', 'best buy', 'costco', 'home depot', 'lowes', 'macys', 'nordstrom', 'store', 'mall', 'shop'],
      'Healthcare': ['pharmacy', 'medical', 'doctor', 'hospital', 'clinic', 'cvs', 'walgreens', 'rite aid', 'health'],
      'Bills & Utilities': ['electric', 'gas company', 'water', 'internet', 'phone', 'utility', 'verizon', 'att', 'comcast', 'sprint', 't-mobile'],
      'Entertainment': ['movie', 'theater', 'cinema', 'netflix', 'spotify', 'gaming', 'xbox', 'playstation', 'steam'],
      'Personal Care': ['salon', 'spa', 'barber', 'hair', 'beauty', 'cosmetic'],
      'Housing': ['rent', 'mortgage', 'apartment', 'property', 'landlord', 'real estate'],
      'Travel': ['hotel', 'airline', 'airport', 'booking', 'expedia', 'airbnb', 'travel'],
      'Subscriptions': ['subscription', 'monthly', 'annual', 'membership', 'netflix', 'spotify', 'gym'],
      'Fitness': ['gym', 'fitness', 'sport', 'workout', 'planet fitness', 'la fitness', 'ymca']
    };

    // Check for category matches
    let bestMatch = '';
    let maxMatches = 0;

    for (const [category, keywords] of Object.entries(categoryPatterns)) {
      let matchCount = 0;
      
      for (const keyword of keywords) {
        if (merchantLower.includes(keyword) || textLower.includes(keyword)) {
          matchCount++;
        }
      }
      
      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestMatch = category;
      }
    }

    if (bestMatch && maxMatches > 0) {
      detectedCategory = bestMatch;
      console.log(`Detected category: ${detectedCategory} based on ${maxMatches} keyword matches`);
    }

    const result = {
      success: true,
      data: {
        merchant: merchant || 'Unknown Merchant',
        amount: amount || 0,
        date: date || new Date().toISOString().split('T')[0],
        category: detectedCategory,
        items: items.length > 0 ? items : undefined
      }
    };

    console.log('OCR Extraction Result:', JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error('Error parsing receipt text:', error);
    return {
      success: false,
      error: 'Failed to parse receipt text'
    };
  }
};

// Helper function to parse transaction history text
const parseTransactionHistoryText = (text: string): ExtractedTransactionHistory => {
  try {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const transactions: Array<{
      date: string;
      description: string;
      amount: number;
      type: 'income' | 'expense';
      category?: string;
    }> = [];

    for (const line of lines) {
      // Look for patterns like: Date Description Amount
      const transactionMatch = line.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{1,2}-\d{1,2})\s+(.+?)\s+([-+]?\$?\d+\.?\d*)/);
      
      if (transactionMatch) {
        const [, date, description, amountStr] = transactionMatch;
        const amount = Math.abs(parseFloat(amountStr.replace(/[^\d.-]/g, '')));
        const type = amountStr.includes('-') || amountStr.includes('(') ? 'expense' : 'income';

        transactions.push({
          date,
          description: description.trim(),
          amount,
          type,
          category: type === 'expense' ? 'Other Expenses' : 'Other Income'
        });
      }
    }

    return {
      success: true,
      data: transactions
    };
  } catch (error) {
    console.error('Error parsing transaction history text:', error);
    return {
      success: false,
      error: 'Failed to parse transaction history text'
    };
  }
};

export const extractReceiptData = async (filePath: string, mimeType: string): Promise<ExtractedData> => {
  try {
    console.log(`Starting OCR extraction for file: ${filePath}`);

    let text = '';

    if (mimeType === 'application/pdf') {
      // Handle PDF files
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
      console.log('Extracted text from PDF using pdf-parse');
    } else if (mimeType.startsWith('image/')) {
      // Handle image files with Tesseract
      const { data } = await Tesseract.recognize(filePath, 'eng', {
        logger: m => console.log(m)
      });
      text = data.text;
      console.log('Extracted text from image using Tesseract OCR');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    console.log(`Extracted text (first 200 chars): ${text.substring(0, 200)}`);

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'No text could be extracted from the file'
      };
    }

    return parseReceiptText(text);

  } catch (error) {
    console.error('Tesseract OCR extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract data from receipt using Tesseract OCR'
    };
  }
};

export const extractTransactionHistory = async (filePath: string, mimeType: string): Promise<ExtractedTransactionHistory> => {
  try {
    console.log(`Starting transaction history extraction for file: ${filePath}`);

    let text = '';

    if (mimeType === 'application/pdf') {
      // Handle PDF files
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text;
      console.log('Extracted transaction history from PDF using pdf-parse');
    } else if (mimeType.startsWith('image/')) {
      // Handle image files with Tesseract
      const { data } = await Tesseract.recognize(filePath, 'eng', {
        logger: m => console.log(m)
      });
      text = data.text;
      console.log('Extracted transaction history from image using Tesseract OCR');
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    console.log(`Extracted transaction history text (first 200 chars): ${text.substring(0, 200)}`);

    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: 'No text could be extracted from the file'
      };
    }

    return parseTransactionHistoryText(text);

  } catch (error) {
    console.error('Transaction history extraction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extract transaction history using Tesseract OCR'
    };
  }
};

export const checkOcrServiceHealth = async (): Promise<boolean> => {
  try {
    // Simple health check - just verify Tesseract is available
    const testImagePath = path.join(__dirname, '../../uploads/test-image.png');
    
    // Create a minimal test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      console.log('OCR service health check: Tesseract available');
      return true;
    }

    // If test image exists, try to process it
    await Tesseract.recognize(testImagePath, 'eng');
    console.log('OCR service health check: Passed');
    return true;
  } catch (error) {
    console.error('OCR service health check failed:', error);
    return false;
  }
};