import { CONFIG } from '../../config';
import { visionScan } from './vision';
import { textCompletion } from './text';

class AIProviderService {
  private static instance: AIProviderService;

  private constructor() {}

  static getInstance(): AIProviderService {
    if (!AIProviderService.instance) {
      AIProviderService.instance = new AIProviderService();
    }
    return AIProviderService.instance;
  }

  async runVisionScan(base64Image: string, prompt: string) {
    try {
      // Primary: Gemini 2.5 Flash Lite
      if (CONFIG.API_KEYS.GEMINI) {
        return await visionScan.gemini(base64Image, prompt);
      }
      throw new Error("No Gemini key");
    } catch (error) {
      console.warn("Primary vision (Gemini) failed, trying SambaNova...", error);
      try {
        // Backup: SambaNova Gemma 3
        if (CONFIG.API_KEYS.SAMBANOVA) {
          return await visionScan.sambaNova(base64Image, prompt);
        }
        throw new Error("No SambaNova key");
      } catch (sambaError) {
        console.warn("SambaNova vision failed, trying OpenRouter...", sambaError);
        // Fallback: OpenRouter
        if (CONFIG.API_KEYS.OPENROUTER) {
          return await visionScan.openRouter(base64Image, prompt);
        }
        throw new Error("All vision providers failed or missing keys.");
      }
    }
  }

  async runTextCompletion(prompt: string, systemPrompt?: string) {
    try {
      // Primary: Groq Llama 3.3
      if (CONFIG.API_KEYS.GROQ) {
        return await textCompletion.groq(prompt, systemPrompt);
      }
      throw new Error("No Groq key");
    } catch (error) {
      console.warn("Groq text failed, trying SambaNova...", error);
      try {
        // Backup: SambaNova GPT OSS 120B
        if (CONFIG.API_KEYS.SAMBANOVA) {
          return await textCompletion.sambaNova(prompt, systemPrompt);
        }
        throw new Error("No SambaNova key");
      } catch (sambaError) {
        console.warn("SambaNova text failed, trying Mistral...", sambaError);
        try {
          // Fallback: Mistral
          if (CONFIG.API_KEYS.MISTRAL) {
            return await textCompletion.mistral(prompt, systemPrompt);
          }
          throw new Error("No Mistral key");
        } catch (mistralError) {
          console.warn("Mistral text failed, trying Cerebras...", mistralError);
          // Backup Fallback: Cerebras
          if (CONFIG.API_KEYS.CEREBRAS) {
            return await textCompletion.cerebras(prompt, systemPrompt);
          }
          throw new Error("All text providers failed or missing keys.");
        }
      }
    }
  }
}

export const aiService = AIProviderService.getInstance();
