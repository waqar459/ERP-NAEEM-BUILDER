// Converts numbers to Pakistani / International Rupees in words (e.g. 3828 -> Three Thousand Eight Hundred Twenty Eight Rupees only)
export function numberToWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees only';

  const rounded = Math.round(num);
  if (rounded < 0) return 'Minus ' + numberToWords(Math.abs(rounded));

  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];

  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  function convertChunk(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '') + ' ';
    } else if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  let result = '';
  let remaining = rounded;

  // Crore (10,000,000)
  if (remaining >= 10000000) {
    const crore = Math.floor(remaining / 10000000);
    result += convertChunk(crore) + ' Crore ';
    remaining %= 10000000;
  }

  // Lakh (100,000)
  if (remaining >= 100000) {
    const lakh = Math.floor(remaining / 100000);
    result += convertChunk(lakh) + ' Lakh ';
    remaining %= 100000;
  }

  // Thousand (1,000)
  if (remaining >= 1000) {
    const thousand = Math.floor(remaining / 1000);
    result += convertChunk(thousand) + ' Thousand ';
    remaining %= 1000;
  }

  // Hundreds & remaining
  if (remaining > 0) {
    result += convertChunk(remaining);
  }

  const cleaned = result.replace(/\s+/g, ' ').trim();
  return cleaned + ' Rupees only';
}
