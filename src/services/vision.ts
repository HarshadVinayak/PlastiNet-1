import { CONFIG } from '../config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface VisionLabel {
  description: string;
  score: number;
}

export interface VisionAnalysis {
  labels: VisionLabel[];
  text?: string;
  isSafe: boolean;
}

const stripBase64Prefix = (base64: string) =>
  base64.replace(/^data:image\/[a-z]+;base64,/, '');

export const visionService = {
  async analyzeImage(imageUri: string): Promise<VisionAnalysis | null> {
    if (!CONFIG.API_KEYS.GEMINI) return null;

    try {
      const genAI = new GoogleGenerativeAI(CONFIG.API_KEYS.GEMINI);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const mimeType = (imageUri.match(/data:([^;]+);/)?.[1] || 'image/jpeg') as 'image/jpeg' | 'image/png' | 'image/webp';

      const result = await model.generateContent([
        `You are a vision analysis assistant. Look at this image and return ONLY a valid JSON object with no markdown, no extra text:
{
  "labels": [{"description": "label name", "score": 0.95}],
  "isSafe": true,
  "hasPlastic": true or false,
  "text": "any text visible in image or empty string"
}
Identify all objects, materials, and especially any plastic items, bottles, bags, or waste.`,
        {
          inlineData: {
            data: stripBase64Prefix(imageUri),
            mimeType
          }
        }
      ]);

      const responseText = result.response.text().trim();
      // Strip markdown code fences if present
      const cleaned = responseText.replace(/^```json\n?|```$/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        labels: parsed.labels || [],
        text: parsed.text || '',
        isSafe: parsed.isSafe !== false
      };
    } catch (error) {
      console.error('Vision Service Error:', error);
      return null;
    }
  }
};
