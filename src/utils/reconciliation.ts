import { Transaction } from './fileParser';
import { calculateAISimilarity, isModelReady } from './aiMatcher';

export interface ReconciliationResult {
  matched: Array<{
    bankAmount: number;
    accountAmount: number;
    description: string;
    date: string;
  }>;
  unmatched: {
    bank: Array<{ amount: number; description: string; date: string }>;
    accounts: Array<{ amount: number; description: string; date: string }>;
  };
  summary: {
    totalMatched: number;
    totalUnmatched: number;
    matchedAmount: number;
    unmatchedBankAmount: number;
    unmatchedAccountsAmount: number;
  };
}

export const reconcileTransactions = async (
  bankTransactions: Transaction[],
  accountTransactions: Transaction[],
  useAI: boolean = false
): Promise<ReconciliationResult> => {
  const matched: ReconciliationResult['matched'] = [];
  const unmatchedBank: Transaction[] = [...bankTransactions];
  const unmatchedAccounts: Transaction[] = [...accountTransactions];

  const tolerance = 0.01;

  for (let i = unmatchedBank.length - 1; i >= 0; i--) {
    const bankTxn = unmatchedBank[i];

    for (let j = unmatchedAccounts.length - 1; j >= 0; j--) {
      const accountTxn = unmatchedAccounts[j];

      const matchResult = await isMatch(bankTxn, accountTxn, tolerance, useAI);
      if (matchResult) {
        matched.push({
          bankAmount: bankTxn.amount,
          accountAmount: accountTxn.amount,
          description: bankTxn.description || accountTxn.description,
          date: bankTxn.date
        });

        unmatchedBank.splice(i, 1);
        unmatchedAccounts.splice(j, 1);
        break;
      }
    }
  }

  const matchedAmount = matched.reduce((sum, m) => sum + Math.abs(m.bankAmount), 0);
  const unmatchedBankAmount = unmatchedBank.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const unmatchedAccountsAmount = unmatchedAccounts.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return {
    matched,
    unmatched: {
      bank: unmatchedBank.map(t => ({
        amount: t.amount,
        description: t.description,
        date: t.date
      })),
      accounts: unmatchedAccounts.map(t => ({
        amount: t.amount,
        description: t.description,
        date: t.date
      }))
    },
    summary: {
      totalMatched: matched.length,
      totalUnmatched: unmatchedBank.length + unmatchedAccounts.length,
      matchedAmount,
      unmatchedBankAmount,
      unmatchedAccountsAmount
    }
  };
};

const isMatch = async (
  bankTxn: Transaction,
  accountTxn: Transaction,
  tolerance: number,
  useAI: boolean = false
): Promise<boolean> => {
  const amountMatch = Math.abs(bankTxn.amount - accountTxn.amount) <= tolerance;

  if (!amountMatch) {
    return false;
  }

  const dateMatch = isDateClose(bankTxn.date, accountTxn.date, 3);

  if (bankTxn.reference && accountTxn.reference) {
    const referenceMatch = bankTxn.reference === accountTxn.reference;
    if (referenceMatch) {
      return true;
    }
  }

  let descriptionSimilarity: number;

  if (useAI && isModelReady()) {
    descriptionSimilarity = await calculateAISimilarity(
      bankTxn.description,
      accountTxn.description
    );

    if (dateMatch && descriptionSimilarity > 0.5) {
      return true;
    }

    if (amountMatch && descriptionSimilarity > 0.65) {
      return true;
    }
  } else {
    descriptionSimilarity = calculateSimilarity(
      bankTxn.description.toLowerCase(),
      accountTxn.description.toLowerCase()
    );

    if (dateMatch && descriptionSimilarity > 0.6) {
      return true;
    }

    if (amountMatch && descriptionSimilarity > 0.8) {
      return true;
    }
  }

  return false;
};

const isDateClose = (date1: string, date2: string, daysTolerance: number): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= daysTolerance;
};

const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 1;

  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};
