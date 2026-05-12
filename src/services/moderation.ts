import { CONFIG } from '../config';

const ECO_KEYWORDS = [
  'plastic', 'environment', 'nature', 'plants', 'recycle', 'waste', 'eco', 
  'climate', 'sustainable', 'green', 'pollution', 'ocean', 'earth', 'forest',
  'sustainability', 'upcycle', 'carbon', 'biodiversity', 'energy', 'water',
  'clean', 'solar', 'wind', 'compost', 'biodegradable', 'conservation'
];

const SOCIAL_PHRASES = [
  'hi', 'hello', 'hey', 'yo', 'good morning', 'good afternoon', 'good evening',
  'how are you', 'what are you doing', 'nice', 'super', 'cool', 'awesome', 'great',
  'thank you', 'thanks', 'bye', 'goodbye', 'wow', 'interesting'
];

export const moderationService = {
  /**
   * Checks if a prompt/query is environmentally relevant.
   * Returns { isRelevant: boolean, score: number, message?: string }
   */
  checkRelevance(text: string): { isRelevant: boolean; score: number; message?: string } {
    const lowerText = text.toLowerCase().trim();
    
    // 1. Check for Social/Greeting Phrases (Allowed for natural conversation)
    const isSocial = SOCIAL_PHRASES.some(phrase => {
      // Use word boundaries or exact match to avoid accidental hits
      const regex = new RegExp(`\\b${phrase}\\b`, 'i');
      return regex.test(lowerText);
    });

    // 2. Simple Keyword Match for Eco-content
    const matches = ECO_KEYWORDS.filter(kw => lowerText.includes(kw));
    const score = (matches.length / ECO_KEYWORDS.length) * 100;
    
    // 3. Threshold check
    // Allow if it contains eco keywords, social phrases, or is a known eco-command
    const isRelevant = matches.length > 0 || isSocial || this.isEcoCommand(lowerText);

    if (!isRelevant && lowerText.length > 0) {
      return {
        isRelevant: false,
        score: 0,
        message: "Chloe: This doesn't seem related to our eco-mission. I only process things that help the planet! 🌍"
      };
    }

    return { isRelevant: true, score: Math.min(score * 5, 100) }; 
  },

  isEcoCommand(text: string): boolean {
    const commands = ['how to', 'what is', 'find', 'calculate', 'scan'];
    return commands.some(cmd => text.includes(cmd)) && (text.includes('recycling') || text.includes('impact'));
  },

  /**
   * Advanced AI-based moderation (placeholder for future implementation with Groq/Gemini)
   */
  async aiModeration(text: string): Promise<boolean> {
    // In a production app, we would call an LLM here to classify the prompt
    // For now, we rely on the robust keyword system + the LLM's own system prompt.
    return true;
  }
};
