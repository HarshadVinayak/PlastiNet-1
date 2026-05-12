import { aiService } from '../../services/ai';
import { extractJson } from '../../utils/ai';

export type WasteAnalysis = {
  type: string;
  classification: string;
  complexityScore: number;
  environmentalImpact: string;
  baseReward: number;
};

export const analyzeBeforeImage = async (image: string): Promise<WasteAnalysis> => {
  const prompt = `
    You are Chloe AI, an expert recycling analyst. 
    Analyze the provided image of plastic waste.
    Respond ONLY with a valid JSON object matching this structure, no markdown formatting or extra text:
    {
      "type": "Name of the object (e.g., Plastic Beverage Bottle)",
      "classification": "Type of plastic (e.g., Type 1 (PET))",
      "complexityScore": Number between 0-100 indicating difficulty to recycle,
      "environmentalImpact": "Short description of impact if not recycled",
      "baseReward": Number between 50 and 250 based on complexity
    }
  `;

  try {
    const responseText = await aiService.runVisionScan(image, prompt);
    return extractJson(responseText) as WasteAnalysis;
  } catch (error) {
    console.error("Before image analysis failed:", error);
    throw new Error("Failed to analyze initial waste image.");
  }
};
