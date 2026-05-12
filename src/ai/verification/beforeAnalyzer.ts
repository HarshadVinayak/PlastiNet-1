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
  const prompt = `You are Chloe AI, an expert recycling analyst. Analyze the provided image of waste/plastic.
Respond ONLY with a valid JSON object - no markdown, no code fences, no extra text:
{"type":"Name of the object","classification":"Type of plastic e.g. Type 1 PET","complexityScore":50,"environmentalImpact":"Short description of impact if not recycled","baseReward":100}`;

  try {
    const responseText = await aiService.runVisionScan(image, prompt);
    const parsed = extractJson(responseText);
    if (parsed && parsed.type) return parsed as WasteAnalysis;
    throw new Error("Invalid response structure");
  } catch (error) {
    console.warn("AI vision analysis failed, using fallback detection:", error);
    // Return a safe default so the scan flow can continue
    return {
      type: "Unidentified Waste Item",
      classification: "Unknown Plastic",
      complexityScore: 40,
      environmentalImpact: "Plastic waste contributes to pollution if not properly recycled.",
      baseReward: 50
    };
  }
};
