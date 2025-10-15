export interface FXRate {
  date: string;
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  source: string;
}

interface FXRateCache {
  [key: string]: FXRate;
}

const cache: FXRateCache = {};

const generateCacheKey = (date: string, baseCurrency: string, targetCurrency: string): string => {
  return `${date}_${baseCurrency}_${targetCurrency}`;
};

export const fetchFXRate = async (
  date: string,
  baseCurrency: string,
  targetCurrency: string
): Promise<FXRate> => {
  if (baseCurrency === targetCurrency) {
    return {
      date,
      baseCurrency,
      targetCurrency,
      rate: 1,
      source: 'no-conversion'
    };
  }

  const cacheKey = generateCacheKey(date, baseCurrency, targetCurrency);
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    const formattedDate = date.split('T')[0];
    const response = await fetch(
      `https://api.frankfurter.app/${formattedDate}?from=${baseCurrency}&to=${targetCurrency}`
    );

    if (!response.ok) {
      const latestResponse = await fetch(
        `https://api.frankfurter.app/latest?from=${baseCurrency}&to=${targetCurrency}`
      );

      if (!latestResponse.ok) {
        throw new Error('Failed to fetch FX rate');
      }

      const latestData = await latestResponse.json();
      const fxRate: FXRate = {
        date: latestData.date,
        baseCurrency,
        targetCurrency,
        rate: latestData.rates[targetCurrency],
        source: 'frankfurter.app (latest available)'
      };

      cache[cacheKey] = fxRate;
      return fxRate;
    }

    const data = await response.json();
    const fxRate: FXRate = {
      date: data.date,
      baseCurrency,
      targetCurrency,
      rate: data.rates[targetCurrency],
      source: 'frankfurter.app'
    };

    cache[cacheKey] = fxRate;
    return fxRate;
  } catch (error) {
    console.error('Error fetching FX rate:', error);
    throw new Error(`Failed to fetch FX rate for ${baseCurrency} to ${targetCurrency} on ${date}`);
  }
};

export const convertAmount = async (
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  date: string
): Promise<{ convertedAmount: number; rate: FXRate }> => {
  const rate = await fetchFXRate(date, fromCurrency, toCurrency);
  const convertedAmount = amount * rate.rate;

  return {
    convertedAmount,
    rate
  };
};

export const batchFetchFXRates = async (
  requests: Array<{ date: string; baseCurrency: string; targetCurrency: string }>
): Promise<FXRate[]> => {
  const uniqueRequests = requests.filter((req, index, self) => {
    const key = generateCacheKey(req.date, req.baseCurrency, req.targetCurrency);
    return index === self.findIndex(r =>
      generateCacheKey(r.date, r.baseCurrency, r.targetCurrency) === key
    );
  });

  const promises = uniqueRequests.map(req =>
    fetchFXRate(req.date, req.baseCurrency, req.targetCurrency)
  );

  return Promise.all(promises);
};

export const clearCache = (): void => {
  Object.keys(cache).forEach(key => delete cache[key]);
};

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
];

export const detectCurrencyFromSymbol = (text: string): string | null => {
  const symbolMap: { [key: string]: string } = {
    '$': 'USD',
    '€': 'EUR',
    '£': 'GBP',
    '¥': 'JPY',
    '₹': 'INR'
  };

  for (const [symbol, code] of Object.entries(symbolMap)) {
    if (text.includes(symbol)) {
      return code;
    }
  }

  return null;
};

export const detectCurrencyFromCode = (text: string): string | null => {
  const upperText = text.toUpperCase();

  for (const currency of SUPPORTED_CURRENCIES) {
    if (upperText.includes(currency.code)) {
      return currency.code;
    }
  }

  return null;
};
