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
  useAI: boolean = false,
  onLog?: (message: string) => void
): Promise<ReconciliationResult> => {
  const log = (msg: string) => {
    console.log(msg);
    onLog?.(msg);
  };

  log(`=== Starting reconciliation with ${bankTransactions.length} bank txns and ${accountTransactions.length} account txns ===`);
  log(`AI Matching: ${useAI ? 'ENABLED' : 'DISABLED'}`);
  log(`AI Model Ready: ${isModelReady()}`);

  const matched: ReconciliationResult['matched'] = [];
  const unmatchedBank: Transaction[] = [...bankTransactions];
  const unmatchedAccounts: Transaction[] = [...accountTransactions];

  const tolerance = 0.01;

  for (let i = unmatchedBank.length - 1; i >= 0; i--) {
    const bankTxn = unmatchedBank[i];
    log(`\n--- Checking bank txn: "${bankTxn.description}" ($${bankTxn.amount}) ${bankTxn.date} ---`);

    for (let j = unmatchedAccounts.length - 1; j >= 0; j--) {
      const accountTxn = unmatchedAccounts[j];

      const matchResult = await isMatch(bankTxn, accountTxn, tolerance, useAI, log);
      if (matchResult) {
        log(`✅ FOUND MATCH!`);
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
  useAI: boolean = false,
  log?: (message: string) => void
): Promise<boolean> => {
  const amountMatch = Math.abs(Math.abs(bankTxn.amount) - Math.abs(accountTxn.amount)) <= tolerance;

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

    log?.(`AI Similarity: "${bankTxn.description}" vs "${accountTxn.description}" = ${descriptionSimilarity.toFixed(3)}`);
    log?.(`Date match: ${dateMatch}, Amount match: ${amountMatch}`);

    if (dateMatch && amountMatch && descriptionSimilarity > 0.25) {
      return true;
    }

    if (dateMatch && descriptionSimilarity > 0.45) {
      return true;
    }

    if (amountMatch && descriptionSimilarity > 0.55) {
      return true;
    }
  } else {
    descriptionSimilarity = calculateSimilarity(
      bankTxn.description,
      accountTxn.description
    );

    log?.(`Similarity: "${bankTxn.description}" vs "${accountTxn.description}" = ${descriptionSimilarity.toFixed(3)}`);
    log?.(`Date match: ${dateMatch}, Amount match: ${amountMatch}`);

    if (dateMatch && amountMatch) {
      if (descriptionSimilarity > 0.05) {
        log?.(`✓ MATCHED (date + amount + ${(descriptionSimilarity * 100).toFixed(1)}% similarity)`);
        return true;
      }
    }

    if (dateMatch && descriptionSimilarity > 0.45) {
      log?.(`✓ MATCHED (date + ${(descriptionSimilarity * 100).toFixed(1)}% similarity)`);
      return true;
    }

    if (amountMatch && descriptionSimilarity > 0.55) {
      log?.(`✓ MATCHED (amount + ${(descriptionSimilarity * 100).toFixed(1)}% similarity)`);
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

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  const n1 = normalize(str1);
  const n2 = normalize(str2);

  if (n1 === n2) return 1;

  const commonWords = new Set(['the', 'and', 'or', 'to', 'from', 'in', 'at', 'on', 'for', 'of', 'a', 'an', 'payment', 'deposit', 'transaction', 'transfer']);

  const words1 = n1.split(' ').filter(w => w.length > 2 && !commonWords.has(w));
  const words2 = n2.split(' ').filter(w => w.length > 2 && !commonWords.has(w));

  if (words1.length === 0 || words2.length === 0) {
    const editDistance = levenshteinDistance(n1, n2);
    return (Math.max(n1.length, n2.length) - editDistance) / Math.max(n1.length, n2.length);
  }

  let matchCount = 0;
  const matchedWords2 = new Set<number>();

  for (const w1 of words1) {
    let bestMatch = 0;
    let bestIdx = -1;

    for (let i = 0; i < words2.length; i++) {
      if (matchedWords2.has(i)) continue;
      const w2 = words2[i];

      if (w1 === w2) {
        bestMatch = 1;
        bestIdx = i;
        break;
      } else if (w1.includes(w2) || w2.includes(w1)) {
        const score = Math.min(w1.length, w2.length) / Math.max(w1.length, w2.length);
        if (score > bestMatch) {
          bestMatch = score * 0.9;
          bestIdx = i;
        }
      } else {
        const dist = levenshteinDistance(w1, w2);
        const maxLen = Math.max(w1.length, w2.length);
        if (dist <= 2 && dist < maxLen * 0.4) {
          const score = (maxLen - dist) / maxLen;
          if (score > bestMatch) {
            bestMatch = score * 0.7;
            bestIdx = i;
          }
        }
      }
    }

    if (bestIdx >= 0) {
      matchedWords2.add(bestIdx);
      matchCount += bestMatch;
    }
  }

  const wordScore = (2 * matchCount) / (words1.length + words2.length);

  const editDistance = levenshteinDistance(n1, n2);
  const editScore = (Math.max(n1.length, n2.length) - editDistance) / Math.max(n1.length, n2.length);

  return Math.max(wordScore, editScore);
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
