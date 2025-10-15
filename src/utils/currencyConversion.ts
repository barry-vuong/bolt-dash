import { Transaction } from './fileParser';
import { convertAmount, batchFetchFXRates } from './fxRates';

export interface ConvertedTransaction extends Transaction {
  convertedAmount: number;
  conversionRate?: number;
  baseCurrency: string;
}

export const convertTransactionToBaseCurrency = async (
  transaction: Transaction,
  baseCurrency: string
): Promise<ConvertedTransaction> => {
  if (transaction.currency === baseCurrency) {
    return {
      ...transaction,
      convertedAmount: transaction.amount,
      conversionRate: 1,
      baseCurrency
    };
  }

  try {
    const { convertedAmount, rate } = await convertAmount(
      transaction.amount,
      transaction.currency,
      baseCurrency,
      transaction.date
    );

    return {
      ...transaction,
      convertedAmount,
      conversionRate: rate.rate,
      baseCurrency
    };
  } catch (error) {
    console.error(`Failed to convert ${transaction.currency} to ${baseCurrency}:`, error);
    return {
      ...transaction,
      convertedAmount: transaction.amount,
      conversionRate: undefined,
      baseCurrency
    };
  }
};

export const convertTransactionsToBaseCurrency = async (
  transactions: Transaction[],
  baseCurrency: string,
  onProgress?: (current: number, total: number) => void
): Promise<ConvertedTransaction[]> => {
  const uniqueRates = Array.from(
    new Set(
      transactions
        .filter(t => t.currency !== baseCurrency)
        .map(t => JSON.stringify({ date: t.date, baseCurrency: t.currency, targetCurrency: baseCurrency }))
    )
  ).map(str => JSON.parse(str));

  if (uniqueRates.length > 0) {
    await batchFetchFXRates(uniqueRates);
  }

  const convertedTransactions: ConvertedTransaction[] = [];

  for (let i = 0; i < transactions.length; i++) {
    const converted = await convertTransactionToBaseCurrency(transactions[i], baseCurrency);
    convertedTransactions.push(converted);

    if (onProgress) {
      onProgress(i + 1, transactions.length);
    }
  }

  return convertedTransactions;
};

export const getCurrencySummary = (transactions: Transaction[]): Map<string, number> => {
  const summary = new Map<string, number>();

  transactions.forEach(transaction => {
    const current = summary.get(transaction.currency) || 0;
    summary.set(transaction.currency, current + Math.abs(transaction.amount));
  });

  return summary;
};

export const formatAmount = (amount: number, currency: string): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$',
    CHF: 'CHF ',
    CNY: '¥',
    INR: '₹',
    SGD: 'S$'
  };

  const symbol = currencySymbols[currency] || currency + ' ';
  const absAmount = Math.abs(amount);
  const formattedNumber = absAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return `${symbol}${formattedNumber}`;
};
