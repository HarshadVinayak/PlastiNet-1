import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../config';

const genAI = new GoogleGenerativeAI(CONFIG.API_KEYS.GEMINI || '');

export interface ModerationResult {
  isSafe: boolean;
  reason?: string;
  cleanedText?: string;
}

export const chloeGuardian = {
  async moderateMessage(text: string): Promise<ModerationResult> {
    if (!CONFIG.API_KEYS.GEMINI) return { isSafe: true };

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      const prompt = `
        Act as Chloe, the AI Guardian of PlastiNet. Your goal is to ensure a safe, inclusive, and professional environment for environmental action.
        Analyze the following user message for:
        1. Adult or inappropriate content.
        2. Hate speech or exclusion.
        3. Extreme toxicity or harassment.
        4. Spam or unwanted non-environmental promotions.

        Message: "${text}"

        Respond ONLY in JSON format:
        {
          "isSafe": boolean,
          "reason": "string describing the violation if unsafe",
          "cleanedText": "optional version with profanity removed if mostly safe"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonStr = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      return JSON.parse(jsonStr) as ModerationResult;
    } catch (error) {
      console.error("Chloe Guardian failed to analyze message:", error);
      // Failsafe: Allow if AI is down but log it
      return { isSafe: true };
    }
  }
};
