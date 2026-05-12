import { CONFIG } from '../config';
import { moderationService } from './moderation';
import { searchService } from './search';
import { visionService } from './vision';
import Groq from 'groq-sdk';

// Multi-provider setup
const groq = new Groq({ 
  apiKey: CONFIG.API_KEYS.GROQ || '',
  dangerouslyAllowBrowser: true 
});

export const chloeIntelligence = {
  /**
   * Orchestrates an intelligent response using the best available model and context.
   */
  async ask(prompt: string, context: any = {}): Promise<string> {
    // 1. MODERATION PRE-FLIGHT
    const { isRelevant, message } = moderationService.checkRelevance(prompt);
    if (!isRelevant) return message || "I only discuss things that help the planet!";

    // 2. ENHANCE PROMPT WITH CONTEXT (Weather, News, etc.)
    let enhancedPrompt = prompt;
    if (context.location) {
      // Future: fetch weather/news based on location
      enhancedPrompt += `\n[Context: User is at ${context.location}]`;
    }

    try {
      // 3. ROUTE TO PRIMARY MODEL (Groq Llama 3)
      const completion = await groq.chat.completions.create({
        messages: [
          { 
            role: 'system', 
            content: `You are Chloe, the PlastiNet Operating Intelligence (OI). 
            Your purpose is to orchestrate environmental actions and provide sustainability research. 
            Be futuristic, analytical, but encouraging. 
            Format responses with clear structure, bold text, and bullet points. 
            Current Date: ${new Date().toLocaleDateString()}` 
          },
          { role: 'user', content: enhancedPrompt }
        ],
        model: "llama-3.3-70b-versatile",
      });

      return completion.choices[0]?.message?.content || "I'm processing this through my neural layers...";
    } catch (error) {
      console.warn("Chloe Primary Brain Error, switching to fallback...", error);
      return this.fallbackAsk(prompt);
    }
  },

  async fallbackAsk(prompt: string): Promise<string> {
    // Placeholder for Gemini/OpenRouter fallback
    return "Chloe: My primary neural link is unstable, but my eco-sensors indicate we should continue our mission! (Fallback engaged)";
  },

  /**
   * Analyzes environmental impact of an object
   */
  async analyzeWaste(imageUri: string) {
    const analysis = await visionService.analyzeImage(imageUri);
    if (!analysis) return null;

    // Post-process with AI logic to determine recyclability
    // This is where "Interconnectivity" happens
    return analysis;
  }
};
