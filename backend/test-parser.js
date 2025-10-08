// Test the transaction parsing logic
const testLine = "Income Rs. 25000 Investments 18-09-2025 Stocks";
console.log('Testing line:', testLine);

const pattern = /^(Income|Expense|income|expense)\s+(?:Rs\.?\s*)?(\d+(?:[,\s]*\d{3})*(?:\.\d{2})?)\s+(.+?)\s+(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})\s+(.+)$/i;
const match = testLine.match(pattern);

console.log('Match result:', match);

if (match) {
  const [, typeStr, amountStr, category, date, description] = match;
  console.log('Parsed fields:');
  console.log('Type:', typeStr);
  console.log('Amount:', amountStr);
  console.log('Category:', category);
  console.log('Date:', date);
  console.log('Description:', description);
  
  const amount = parseFloat(amountStr.replace(/[^\d.]/g, ''));
  console.log('Parsed amount:', amount);
} else {
  console.log('No match found');
  
  // Try simpler pattern
  const simplePattern = /^(Income|Expense)\s+Rs\.\s*(\d+)\s+(.+?)\s+(\d{1,2}-\d{1,2}-\d{4})\s+(.+)$/;
  const simpleMatch = testLine.match(simplePattern);
  console.log('Simple pattern match:', simpleMatch);
}