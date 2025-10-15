import { pipeline, cos_sim } from '@xenova/transformers';

let featureExtractor: any = null;
let isModelLoading = false;
let modelLoadPromise: Promise<any> | null = null;

export const initializeAIModel = async (): Promise<void> => {
  if (featureExtractor) return;

  if (isModelLoading && modelLoadPromise) {
    await modelLoadPromise;
    return;
  }

  isModelLoading = true;
  modelLoadPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  try {
    featureExtractor = await modelLoadPromise;
    console.log('AI model loaded successfully');
  } catch (error) {
    console.error('Failed to load AI model:', error);
    throw error;
  } finally {
    isModelLoading = false;
  }
};

export const isModelReady = (): boolean => {
  return featureExtractor !== null;
};

const normalizeDescription = (desc: string): string => {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const hasCommonKeywords = (desc1: string, desc2: string): boolean => {
  const keywords1 = new Set(
    normalizeDescription(desc1)
      .split(' ')
      .filter(word => word.length > 3)
  );
  const keywords2 = new Set(
    normalizeDescription(desc2)
      .split(' ')
      .filter(word => word.length > 3)
  );

  for (const keyword of keywords1) {
    if (keywords2.has(keyword)) {
      console.log(`Common keyword found: "${keyword}"`);
      return true;
    }
  }
  return false;
};

export const calculateAISimilarity = async (desc1: string, desc2: string): Promise<number> => {
  if (!featureExtractor) {
    await initializeAIModel();
  }

  const normalized1 = normalizeDescription(desc1);
  const normalized2 = normalizeDescription(desc2);

  if (normalized1 === normalized2) return 1.0;
  if (!normalized1 || !normalized2) return 0.0;

  try {
    const output1 = await featureExtractor(normalized1, { pooling: 'mean', normalize: true });
    const output2 = await featureExtractor(normalized2, { pooling: 'mean', normalize: true });

    let similarity = cos_sim(output1.data, output2.data);

    if (hasCommonKeywords(desc1, desc2)) {
      similarity = similarity * 1.15;
    }

    return Math.max(0, Math.min(1, similarity));
  } catch (error) {
    console.error('Error calculating AI similarity:', error);
    return 0;
  }
};

export const calculateBatchAISimilarity = async (
  baseDesc: string,
  descriptions: string[]
): Promise<number[]> => {
  if (!featureExtractor) {
    await initializeAIModel();
  }

  const normalizedBase = normalizeDescription(baseDesc);
  const normalizedDescs = descriptions.map(normalizeDescription);

  try {
    const baseOutput = await featureExtractor(normalizedBase, { pooling: 'mean', normalize: true });
    const similarities: number[] = [];

    for (const desc of normalizedDescs) {
      if (!desc) {
        similarities.push(0);
        continue;
      }

      if (desc === normalizedBase) {
        similarities.push(1.0);
        continue;
      }

      const descOutput = await featureExtractor(desc, { pooling: 'mean', normalize: true });
      const similarity = cos_sim(baseOutput.data, descOutput.data);
      similarities.push(Math.max(0, Math.min(1, similarity)));
    }

    return similarities;
  } catch (error) {
    console.error('Error calculating batch AI similarity:', error);
    return descriptions.map(() => 0);
  }
};
