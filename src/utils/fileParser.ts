import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
  reference?: string;
}

export const parseFile = async (file: File): Promise<Transaction[]> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv') {
    return parseCSV(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV or Excel files.');
  }
};

const parseCSV = (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = normalizeData(results.data as Record<string, any>[]);
          resolve(transactions);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      }
    });
  });
};

const parseExcel = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        const transactions = normalizeData(jsonData as Record<string, any>[]);
        resolve(transactions);
      } catch (error) {
        reject(new Error(`Failed to parse Excel: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsBinaryString(file);
  });
};

const normalizeData = (data: Record<string, any>[]): Transaction[] => {
  return data.map((row) => {
    const transaction: Transaction = {
      date: extractDate(row),
      description: extractDescription(row),
      amount: extractAmount(row),
      reference: extractReference(row)
    };
    return transaction;
  }).filter(t => t.amount !== 0);
};

const extractDate = (row: Record<string, any>): string => {
  const dateFields = ['date', 'transaction_date', 'transactiondate', 'posting_date', 'postingdate', 'value_date', 'valuedate'];

  for (const field of dateFields) {
    const key = Object.keys(row).find(k => k.toLowerCase() === field);
    if (key && row[key]) {
      return normalizeDate(row[key]);
    }
  }

  const firstValue = Object.values(row)[0];
  if (firstValue && isValidDate(String(firstValue))) {
    return normalizeDate(String(firstValue));
  }

  return new Date().toISOString().split('T')[0];
};

const extractDescription = (row: Record<string, any>): string => {
  const descFields = ['description', 'desc', 'narrative', 'details', 'memo', 'transaction_description', 'transactiondescription', 'payee', 'merchant'];

  for (const field of descFields) {
    const key = Object.keys(row).find(k => k.toLowerCase() === field);
    if (key && row[key]) {
      return String(row[key]).trim();
    }
  }

  const values = Object.values(row);
  if (values.length > 1) {
    return String(values[1]).trim();
  }

  return 'Unknown Transaction';
};

const extractAmount = (row: Record<string, any>): number => {
  const amountFields = ['amount', 'value', 'transaction_amount', 'transactionamount', 'debit', 'credit', 'balance'];

  for (const field of amountFields) {
    const key = Object.keys(row).find(k => k.toLowerCase() === field);
    if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
      return parseAmount(row[key]);
    }
  }

  const debitKey = Object.keys(row).find(k => k.toLowerCase() === 'debit');
  const creditKey = Object.keys(row).find(k => k.toLowerCase() === 'credit');

  if (debitKey !== undefined && creditKey !== undefined) {
    const debitAmount = parseAmount(row[debitKey]);
    const creditAmount = parseAmount(row[creditKey]);

    if (debitAmount > 0) {
      return -Math.abs(debitAmount);
    }
    if (creditAmount > 0) {
      return Math.abs(creditAmount);
    }
    return 0;
  }

  if (debitKey && row[debitKey]) {
    return -Math.abs(parseAmount(row[debitKey]));
  }
  if (creditKey && row[creditKey]) {
    return Math.abs(parseAmount(row[creditKey]));
  }

  const values = Object.values(row);
  for (const value of values) {
    if (typeof value === 'number') {
      return value;
    }
    const parsed = parseAmount(value);
    if (!isNaN(parsed) && parsed !== 0) {
      return parsed;
    }
  }

  return 0;
};

const extractReference = (row: Record<string, any>): string | undefined => {
  const refFields = ['reference', 'ref', 'transaction_id', 'transactionid', 'id', 'check_number', 'checknumber'];

  for (const field of refFields) {
    const key = Object.keys(row).find(k => k.toLowerCase() === field);
    if (key && row[key]) {
      return String(row[key]).trim();
    }
  }

  return undefined;
};

const parseAmount = (value: any): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const cleaned = value
      .replace(/[^\d.,\-+]/g, '')
      .replace(/,/g, '');

    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  return 0;
};

const normalizeDate = (dateValue: any): string => {
  if (!dateValue) {
    const today = new Date();
    return formatDateISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
  }

  if (typeof dateValue === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + dateValue * 24 * 60 * 60 * 1000);
    return formatDateISO(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  const dateStr = String(dateValue).trim();

  const ddmmyyyyPattern = /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/;
  const match = dateStr.match(ddmmyyyyPattern);

  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10);
    const year = parseInt(match[3], 10);

    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return formatDateISO(year, month, day);
    }
  }

  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return formatDateISO(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  const today = new Date();
  return formatDateISO(today.getFullYear(), today.getMonth() + 1, today.getDate());
};

const formatDateISO = (year: number, month: number, day: number): string => {
  const yyyy = String(year).padStart(4, '0');
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};
