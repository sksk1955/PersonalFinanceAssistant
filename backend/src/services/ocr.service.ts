import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';
import fs from 'fs';

export interface ExtractedData {
  amount?: number;
  total?: number;
  date?: string;
  merchant?: string;
  items?: Array<{ name: string; price: number; quantity?: number }>;
  subtotal?: number;
  tax?: number;
  tip?: number;
  discount?: number;
  paymentMethod?: string;
  receiptNumber?: string;
  address?: string;
  phone?: string;
  category?: string;
  confidence: {
    amount: number;
    date: number;
    merchant: number;
    overall: number;
  };
  rawText: string;
}

export interface ExtractedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category?: string;
  balance?: number;
}

export interface ExtractedTransactionHistory {
  transactions: ExtractedTransaction[];
  accountInfo?: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    statementPeriod?: string;
  };
  rawText: string;
  confidence: number;
}

export const extractReceiptData = async (filePath: string, mimeType: string): Promise<ExtractedData> => {
  try {
    let rawText = '';

    if (mimeType === 'application/pdf') {
      // Extract text from PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text;
    } else {
      // Extract text from image using OCR
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      rawText = text;
    }

    // Parse extracted text
    const extractedData = parseReceiptText(rawText);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    return extractedData;
  } catch (error) {
    console.error('OCR extraction error:', error);
    // Clean up uploaded file even on error
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error cleaning up file:', unlinkError);
    }
    throw new Error('Failed to extract data from receipt');
  }
};

export const extractTransactionHistory = async (filePath: string, mimeType: string): Promise<ExtractedTransactionHistory> => {
  try {
    let rawText = '';

    if (mimeType === 'application/pdf') {
      // Extract text from PDF
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      rawText = pdfData.text;
    } else {
      // Extract text from image using OCR
      const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
      rawText = text;
    }

    // Parse tabular transaction data
    const extractedHistory = parseTransactionHistory(rawText);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    return extractedHistory;
  } catch (error) {
    console.error('Transaction history extraction error:', error);
    // Clean up uploaded file even on error
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.error('Error cleaning up file:', unlinkError);
    }
    throw new Error('Failed to extract transaction history');
  }
};

const parseReceiptText = (text: string): ExtractedData => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const lowerText = text.toLowerCase();
  
  // Initialize result with confidence scores
  const result: ExtractedData = {
    rawText: text,
    items: [],
    confidence: {
      amount: 0,
      date: 0,
      merchant: 0,
      overall: 0
    }
  };

  // Extract amounts with more precision
  const amountRegex = /\$?(\d{1,6}\.\d{2}|\d{1,6})/g;
  const amounts: number[] = [];
  
  // Extract specific financial components
  const extractFinancialValue = (pattern: string): number | undefined => {
    const regex = new RegExp(pattern + '\\s*:?\\s*\\$?(\\d+\\.?\\d{0,2})', 'i');
    const match = text.match(regex);
    return match ? parseFloat(match[1]) : undefined;
  };

  // Extract subtotal, tax, tip, discount
  result.subtotal = extractFinancialValue('sub\\s*total|subtotal');
  result.tax = extractFinancialValue('tax|hst|gst|pst|vat') || extractFinancialValue('sales\\s*tax');
  result.tip = extractFinancialValue('tip|gratuity|service\\s*charge');
  result.discount = extractFinancialValue('discount|off|save|coupon');
  
  lines.forEach(line => {
    const matches = line.match(amountRegex);
    if (matches) {
      matches.forEach(match => {
        const amount = parseFloat(match.replace('$', ''));
        if (amount > 0 && amount < 50000) { // Increased reasonable range
          amounts.push(amount);
        }
      });
    }
  });

  // Extract total with better pattern matching
  if (amounts.length > 0) {
    const totalPatterns = [
      /(?:total|grand\s*total|final\s*total|amount\s*due|balance)\s*:?\s*\$?(\d+\.?\d{0,2})/i,
      /\$?(\d+\.\d{2})\s*(?:total|grand\s*total|final\s*total)/i
    ];
    
    let totalFound = false;
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) {
        result.total = parseFloat(match[1]);
        result.confidence.amount = 0.9;
        totalFound = true;
        break;
      }
    }
    
    if (!totalFound) {
      // Look for total in lines
      const totalLine = lines.find(line => 
        /\b(?:total|grand\s*total|amount\s*due|balance)\b/i.test(line)
      );
      
      if (totalLine) {
        const totalMatch = totalLine.match(/\$?(\d+\.?\d{0,2})/);
        if (totalMatch) {
          result.total = parseFloat(totalMatch[1]);
          result.confidence.amount = 0.7;
          totalFound = true;
        }
      }
    }
    
    if (!totalFound && amounts.length > 0) {
      result.total = Math.max(...amounts);
      result.confidence.amount = 0.5;
    }
    
    result.amount = result.total;
  }

  // Extract date with multiple patterns
  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g, // MM/DD/YYYY or DD/MM/YYYY
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g, // YYYY/MM/DD
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2})/g,  // MM/DD/YY
    /([a-zA-Z]{3,9}\s+\d{1,2},?\s+\d{4})/g, // January 15, 2024
    /(\d{1,2}\s+[a-zA-Z]{3,9}\s+\d{4})/g   // 15 January 2024
  ];
  
  let bestDate: Date | null = null;
  let bestConfidence = 0;
  
  for (const pattern of datePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        try {
          const parsedDate = new Date(match);
          if (!isNaN(parsedDate.getTime()) && 
              parsedDate.getFullYear() >= 2020 && 
              parsedDate.getFullYear() <= new Date().getFullYear() + 1) {
            
            // Prefer dates that are not in the future and not too old
            const now = new Date();
            const daysDiff = Math.abs((now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24));
            const confidence = daysDiff <= 365 ? 0.9 : 0.6;
            
            if (confidence > bestConfidence) {
              bestDate = parsedDate;
              bestConfidence = confidence;
            }
          }
        } catch (error) {
          // Continue to next pattern
        }
      }
    }
  }
  
  if (bestDate) {
    result.date = bestDate.toISOString();
    result.confidence.date = bestConfidence;
  }

  // Extract merchant name with better logic
  const merchantPatterns = [
    /store\s*#?\s*\d*\s*([a-zA-Z\s&'-]+)/i,
    /welcome\s+to\s+([a-zA-Z\s&'-]+)/i,
    /thank\s+you\s+for\s+shopping\s+at\s+([a-zA-Z\s&'-]+)/i
  ];
  
  let bestMerchant = '';
  let merchantConfidence = 0;
  
  // Try pattern matching first
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      bestMerchant = match[1].trim();
      merchantConfidence = 0.8;
      break;
    }
  }
  
  // If no pattern match, look at first few lines
  if (!bestMerchant) {
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line.length > 3 && line.length < 60 && 
          !amountRegex.test(line) && 
          !/\d{4}|phone|tel|address|receipt/i.test(line)) {
        bestMerchant = line;
        merchantConfidence = 0.6;
        break;
      }
    }
  }
  
  if (bestMerchant) {
    result.merchant = bestMerchant.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
    result.confidence.merchant = merchantConfidence;
  }
  
  // Extract additional info
  const phoneMatch = text.match(/(?:phone|tel|call)\s*:?\s*([\d\s\-\(\)\+]{10,})/i);
  if (phoneMatch) result.phone = phoneMatch[1].trim();
  
  const receiptNumMatch = text.match(/(?:receipt|transaction|order)\s*#?\s*:?\s*([a-zA-Z0-9\-]+)/i);
  if (receiptNumMatch) result.receiptNumber = receiptNumMatch[1];
  
  // Try to determine category based on merchant name and items
  const categoryKeywords = {
    'food': ['restaurant', 'cafe', 'pizza', 'burger', 'food', 'kitchen', 'diner'],
    'grocery': ['market', 'grocery', 'supermarket', 'food store', 'walmart', 'target'],
    'gas': ['gas', 'fuel', 'petrol', 'shell', 'exxon', 'chevron'],
    'retail': ['store', 'shop', 'mall', 'retail', 'clothing'],
    'entertainment': ['cinema', 'movie', 'theater', 'game', 'entertainment']
  };
  
  if (result.merchant) {
    const merchantLower = result.merchant.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => merchantLower.includes(keyword))) {
        result.category = category;
        break;
      }
    }
  }

  // Extract line items with better parsing
  lines.forEach((line, index) => {
    // Look for patterns like: "Item Name 1.99" or "2x Item Name 3.98"
    const itemPatterns = [
      /^(.+?)\s+\$?(\d+\.\d{2})$/,  // Item Name 1.99
      /^(\d+)x?\s+(.+?)\s+\$?(\d+\.\d{2})$/,  // 2x Item Name 3.98
      /^(.+?)\s+(\d+)\s*@\s*\$?(\d+\.\d{2})$/  // Item Name 2 @ 1.99
    ];
    
    for (const pattern of itemPatterns) {
      const match = line.match(pattern);
      if (match) {
        let quantity = 1;
        let itemName = '';
        let price = 0;
        
        if (pattern === itemPatterns[0]) { // Simple: Item Name Price
          itemName = match[1].trim();
          price = parseFloat(match[2]);
        } else if (pattern === itemPatterns[1]) { // Quantity x Item Name Price
          quantity = parseInt(match[1]) || 1;
          itemName = match[2].trim();
          price = parseFloat(match[3]);
        } else if (pattern === itemPatterns[2]) { // Item Name Qty @ Price
          itemName = match[1].trim();
          quantity = parseInt(match[2]) || 1;
          price = parseFloat(match[3]) * quantity;
        }
        
        if (itemName.length > 1 && price > 0 && price <= (result.total || 10000) &&
            !itemName.toLowerCase().includes('total') &&
            !itemName.toLowerCase().includes('tax') &&
            !itemName.toLowerCase().includes('subtotal')) {
          
          result.items!.push({
            name: itemName.replace(/[^a-zA-Z0-9\s\-']/g, '').trim(),
            price: price,
            quantity: quantity
          });
        }
        break;
      }
    }
  });

  // Calculate overall confidence
  const confidenceScores = Object.values(result.confidence).filter(score => score > 0);
  result.confidence.overall = confidenceScores.length > 0 
    ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
    : 0.3;

  
  return result;
};

const parseTransactionHistory = (text: string): ExtractedTransactionHistory => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const transactions: ExtractedTransaction[] = [];
  
  // Initialize result
  const result: ExtractedTransactionHistory = {
    transactions: [],
    rawText: text,
    confidence: 0,
    accountInfo: {}
  };

  // Extract account information
  const accountNumberMatch = text.match(/account\s*(?:number|no\.?|#)?\s*:?\s*(\d{4,20})/i);
  if (accountNumberMatch) {
    result.accountInfo!.accountNumber = accountNumberMatch[1];
  }

  const bankNameMatch = text.match(/(?:bank|credit\s*union|financial)\s*(?:name|of)?\s*:?\s*([a-z\s&]+(?:bank|credit\s*union|financial))/i);
  if (bankNameMatch) {
    result.accountInfo!.bankName = bankNameMatch[1].trim();
  }

  // Common date formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY
  const dateRegex = /(?:(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})|(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2}))/;
  
  // Amount patterns: $123.45, 123.45, (123.45), -123.45
  const amountRegex = /(?:[\$]?[\+\-]?\s*(\d{1,6}(?:,\d{3})*\.?\d{0,2})|\((\d{1,6}(?:,\d{3})*\.?\d{0,2})\))/;
  
  // Balance patterns
  const balanceRegex = /balance\s*:?\s*[\$]?[\+\-]?\s*(\d{1,6}(?:,\d{3})*\.?\d{0,2})/i;

  let validTransactionCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dateMatch = line.match(dateRegex);
    
    if (dateMatch) {
      // Try to extract transaction data from this line and potentially next lines
      let transactionLine = line;
      let nextLineIndex = i + 1;
      
      // Sometimes transaction data spans multiple lines
      while (nextLineIndex < lines.length && 
             !lines[nextLineIndex].match(dateRegex) && 
             nextLineIndex - i < 3) {
        transactionLine += ' ' + lines[nextLineIndex];
        nextLineIndex++;
      }
      
      const amountMatch = transactionLine.match(amountRegex);
      
      if (amountMatch) {
        let amount = parseFloat((amountMatch[1] || amountMatch[2] || '0').replace(/,/g, ''));
        
        // Determine transaction type based on context and amount
        let type: 'INCOME' | 'EXPENSE' = 'EXPENSE';
        const lowerLine = transactionLine.toLowerCase();
        
        // Check for income indicators
        if (lowerLine.includes('deposit') || 
            lowerLine.includes('credit') || 
            lowerLine.includes('salary') ||
            lowerLine.includes('pay') ||
            lowerLine.includes('transfer in') ||
            lowerLine.includes('interest') ||
            lowerLine.includes('dividend') ||
            lowerLine.includes('refund')) {
          type = 'INCOME';
        }
        
        // Handle negative amounts (usually expenses) and parentheses (also expenses)
        if (amountMatch[2] || transactionLine.includes('(')) {
          // Amount in parentheses = expense
          type = 'EXPENSE';
        } else if (transactionLine.includes('-') && amount > 0) {
          // Negative amount = expense
          type = 'EXPENSE';
        }
        
        // Format date
        let formattedDate: string;
        if (dateMatch[1] && dateMatch[2] && dateMatch[3]) {
          // MM/DD/YYYY or DD/MM/YYYY format
          const month = parseInt(dateMatch[1]);
          const day = parseInt(dateMatch[2]);
          const year = parseInt(dateMatch[3]);
          
          // Assume MM/DD/YYYY if month > 12, otherwise DD/MM/YYYY
          if (month > 12) {
            formattedDate = `${year}-${String(dateMatch[1]).padStart(2, '0')}-${String(month).padStart(2, '0')}`;
          } else {
            formattedDate = `${year < 100 ? 2000 + year : year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          }
        } else if (dateMatch[4] && dateMatch[5] && dateMatch[6]) {
          // YYYY-MM-DD format
          formattedDate = `${dateMatch[4]}-${String(dateMatch[5]).padStart(2, '0')}-${String(dateMatch[6]).padStart(2, '0')}`;
        } else {
          formattedDate = new Date().toISOString().split('T')[0];
        }
        
        // Extract description (remove date and amount)
        let description = transactionLine
          .replace(dateRegex, '')
          .replace(amountRegex, '')
          .replace(/balance\s*:?\s*[\$]?[\+\-]?\s*\d{1,6}(?:,\d{3})*\.?\d{0,2}/i, '')
          .replace(/\\s+/g, ' ')
          .trim();
        
        // Clean up description
        description = description
          .replace(/^[\\s\\-\\*]+/, '')
          .replace(/[\\s\\-\\*]+$/, '')
          .replace(/\\s{2,}/g, ' ')
          .trim();
        
        if (!description) {
          description = type === 'INCOME' ? 'Income Transaction' : 'Expense Transaction';
        }
        
        // Extract balance if present
        const balanceMatch = transactionLine.match(balanceRegex);
        const balance = balanceMatch ? parseFloat(balanceMatch[1].replace(/,/g, '')) : undefined;
        
        const transaction: ExtractedTransaction = {
          date: formattedDate,
          description: description.substring(0, 200), // Limit description length
          amount: Math.abs(amount), // Always store as positive
          type,
          balance
        };
        
        transactions.push(transaction);
        validTransactionCount++;
      }
    }
  }
  
  // Calculate confidence based on successful extractions
  const confidence = Math.min(90, Math.max(10, (validTransactionCount / Math.max(lines.length / 4, 1)) * 100));
  
  result.transactions = transactions;
  result.confidence = confidence;
  
  return result;
};