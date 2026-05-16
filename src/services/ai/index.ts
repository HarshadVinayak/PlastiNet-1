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

  private async getContextualPrompt(userPrompt: string): Promise<string> {
    const { useLocationStore } = await import('../../stores/locationStore');
    const { usePreferenceStore } = await import('../../stores/preferenceStore');
    
    const { city, nearbyPlaces } = useLocationStore.getState();
    const { preferences } = usePreferenceStore.getState();
    
    let context = `USER CONTEXT:\n`;
    context += `- Current Location: ${city || 'Unknown Area'}\n`;
    context += `- Travel Mode/Accessibility: ${preferences.accessibility}\n`;
    if (preferences.habits.length > 0) {
      context += `- Daily Habits: ${preferences.habits.join(', ')}\n`;
    }
    
    if (nearbyPlaces && nearbyPlaces.length > 0) {
      context += `- Nearby Recycling Centers (within 6km):\n`;
      nearbyPlaces.slice(0, 3).forEach(p => {
        context += `  * ${p.name}: ${p.address}\n`;
      });
    }

    return `${context}\nINSTRUCTIONS:\nUse the local context and user preferences above to provide extremely convenient, specific, and actionable advice. Prioritize suggestions that match their travel mode (e.g., if they walk, find the closest one; if they drive, find one with good parking). Be their helpful, empathetic, location-aware environmental assistant (Chloe).\n\nUSER REQUEST: ${userPrompt}`;
  }

  async runVisionScan(base64Image: string, prompt: string, useContext = true) {
    const contextualPrompt = useContext ? await this.getContextualPrompt(prompt) : prompt;
    try {
      // Primary: Gemini 2.5 Flash Lite (confirmed working)
      if (CONFIG.API_KEYS.GEMINI) {
        return await visionScan.gemini(base64Image, contextualPrompt);
      }
      throw new Error("No Gemini key");
    } catch (error) {
      console.warn("Gemini vision failed, trying Groq Vision...", error);
      try {
        // Backup: Groq Llama-4 Scout Vision (confirmed working)
        if (CONFIG.API_KEYS.GROQ) {
          return await visionScan.groq(base64Image, contextualPrompt);
        }
        throw new Error("No Groq key");
      } catch (groqError) {
        console.warn("Groq vision failed, trying SambaNova...", groqError);
        // Final fallback: SambaNova
        if (CONFIG.API_KEYS.SAMBANOVA) {
          return await visionScan.sambaNova(base64Image, contextualPrompt);
        }
        throw new Error("All vision providers failed.");
      }
    }
  }

  async runTextCompletion(prompt: string, systemPrompt?: string, useContext = true) {
    const contextualPrompt = useContext ? await this.getContextualPrompt(prompt) : prompt;
    try {
      // Primary: Groq Llama 3.3
      if (CONFIG.API_KEYS.GROQ) {
        return await textCompletion.groq(contextualPrompt, systemPrompt);
      }
      throw new Error("No Groq key");
    } catch (error) {
      console.warn("Groq text failed, trying SambaNova...", error);
      try {
        // Backup: SambaNova GPT OSS 120B
        if (CONFIG.API_KEYS.SAMBANOVA) {
          return await textCompletion.sambaNova(contextualPrompt, systemPrompt);
        }
        throw new Error("No SambaNova key");
      } catch (sambaError) {
        console.warn("SambaNova text failed, trying Mistral...", sambaError);
        try {
          // Fallback: Mistral
          if (CONFIG.API_KEYS.MISTRAL) {
            return await textCompletion.mistral(contextualPrompt, systemPrompt);
          }
          throw new Error("No Mistral key");
        } catch (mistralError) {
          console.warn("Mistral text failed, trying Cerebras...", mistralError);
          // Backup Fallback: Cerebras
          if (CONFIG.API_KEYS.CEREBRAS) {
            return await textCompletion.cerebras(contextualPrompt, systemPrompt);
          }
          throw new Error("All text providers failed or missing keys.");
        }
      }
    }
  }
}

export const aiService = AIProviderService.getInstance();
