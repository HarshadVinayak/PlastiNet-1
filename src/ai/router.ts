import { CONFIG } from '../config';

export type AIResponse = {
  wasteType: string;
  classification: string;
  reducePlan: string[];
  reusePlan: string[];
  recycleInstructions: string[];
  environmentalImpact: string;
  rewardEstimate: number;
};

class AIRouter {
  private static instance: AIRouter;

  private constructor() {}

  static getInstance(): AIRouter {
    if (!AIRouter.instance) {
      AIRouter.instance = new AIRouter();
    }
    return AIRouter.instance;
  }

  async visionScan(imageData: string): Promise<AIResponse> {
    try {
      // Primary: Gemini 2.5 Flash Lite (Vision)
      return await this.callGeminiVision(imageData);
    } catch (error) {
      console.warn('Gemini Vision failed, falling back to OpenRouter...', error);
      return await this.callOpenRouterVision(imageData);
    }
  }

  private async callGeminiVision(imageData: string): Promise<AIResponse> {
    // Mock implementation for structure
    // Real implementation would use @google/generative-ai
    return this.getMockResponse();
  }

  private async callOpenRouterVision(imageData: string): Promise<AIResponse> {
    // Fallback implementation
    return this.getMockResponse();
  }

  private getMockResponse(): AIResponse {
    return {
      wasteType: "PET Plastic Bottle",
      classification: "Type 1 (PETE)",
      reducePlan: [
        "Use a stainless steel reusable water bottle.",
        "Choose beverages in glass containers if available."
      ],
      reusePlan: [
        "Cut the bottle in half to create a self-watering planter.",
        "Use as a storage container for small craft items."
      ],
      recycleInstructions: [
        "Rinse the bottle thoroughly.",
        "Remove the cap and ring.",
        "Crush the bottle to save space.",
        "Deposit in the yellow recycling bin."
      ],
      environmentalImpact: "Prevents ~0.5kg of CO2 emissions and saves 1.5 liters of water used in manufacturing.",
      rewardEstimate: 150
    };
  }
}

export const aiRouter = AIRouter.getInstance();
