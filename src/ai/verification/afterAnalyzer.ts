import { aiService } from '../../services/ai';
import { formatChloeVerificationPrompt } from './chloeVerificationMode';
import { extractJson } from '../../utils/ai';

export type VerificationStatus = 'APPROVED' | 'PARTIAL' | 'REJECTED';

export type AfterAnalysis = {
  status: VerificationStatus;
  reason: string;
  detectedAction: string;
  score: number;
};

export const analyzeAfterImage = async (beforeData: any, afterImage: string): Promise<AfterAnalysis> => {
  const prompt = formatChloeVerificationPrompt(beforeData);

  try {
    const responseText = await aiService.runVisionScan(afterImage, prompt, false);
    return extractJson(responseText) as AfterAnalysis;
  } catch (error) {
    console.error("After image verification failed:", error);
    throw new Error("Failed to verify proof image.");
  }
};
