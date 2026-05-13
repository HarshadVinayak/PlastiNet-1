import { create } from 'zustand';
import Groq from 'groq-sdk';

const groq = new Groq({ 
  apiKey: import.meta.env.VITE_GROQ_API_KEY || '',
  dangerouslyAllowBrowser: true 
});

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: string[];
}

interface AIState {
  messages: Message[];
  isTyping: boolean;
  sendMessage: (content: string, attachments?: string[]) => Promise<void>;
  clearHistory: () => void;
}

const GLOBAL_MODERATION_RULE = `
You are Chloe, the PlastiNet AI Impact Agent. 
Your core mission is to help users recycle better and track their environmental impact.
STRICT RULE: ONLY discuss environmental science, recycling, sustainability, PlastiNet features, and PlastiCoin earnings.
If a user asks about unrelated topics (politics, entertainment, non-eco sports, etc.), politely steer them back to sustainability.
Be high-energy, encouraging, and use eco-tech terminology.

LOCATION AWARENESS: You have direct access to the user's real-time GPS location and surrounding eco-infrastructure. Use this data to provide specific, convenient recommendations. Never say you don't have access to their location.

FORMATTING RULE: Format your responses like an engaging story! Always make them detailed, neat, with plenty of content and words. Use clean bullet points and proper paragraphs to make the text highly readable and well-structured.
`;

export const useAIStore = create<AIState>((set, get) => ({
  messages: [
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey there! I'm Chloe. Ready to turn some waste into wealth today? How can I help you boost your environmental impact?",
      timestamp: Date.now(),
    }
  ],
  isTyping: false,
  sendMessage: async (content, attachments) => {
    const userMsg: Message = {
      id: Math.random().toString(36).substr(2, 9),
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments
    };

    set(state => ({ messages: [...state.messages, userMsg], isTyping: true }));

    try {
      const assistantMsgId = Math.random().toString(36).substr(2, 9);
      const assistantMsg: Message = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      set(state => ({ 
        messages: [...state.messages, assistantMsg],
        isTyping: true 
      }));

      const { useLocationStore } = await import('./locationStore');
      const { usePreferenceStore } = await import('./preferenceStore');
      const { city, nearbyPlaces } = useLocationStore.getState();
      const { preferences } = usePreferenceStore.getState();

      let dynamicSystemPrompt = GLOBAL_MODERATION_RULE;
      dynamicSystemPrompt += `\n\nCURRENT USER DATA:\n- Location: ${city || 'Unknown Area'}\n- Accessibility: ${preferences.accessibility}\n`;
      
      if (nearbyPlaces.length > 0) {
        dynamicSystemPrompt += `- Local Recycling Centers within 6km:\n`;
        nearbyPlaces.slice(0, 3).forEach(p => {
          dynamicSystemPrompt += `  * ${p.name}: ${p.address}\n`;
        });
      }

      const stream = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: dynamicSystemPrompt },
          ...get().messages.slice(0, -1).map(m => ({
            role: m.role,
            content: m.content
          })),
          { role: 'user', content }
        ],
        model: "llama-3.3-70b-versatile",
        stream: true,
      });
      
      let fullText = '';
      let isFirstChunk = true;
      for await (const chunk of stream) {
        const chunkText = chunk.choices[0]?.delta?.content || '';
        if (chunkText && isFirstChunk) {
          set({ isTyping: false });
          isFirstChunk = false;
        }
        fullText += chunkText;
        
        set(state => ({
          messages: state.messages.map(m => 
            m.id === assistantMsgId ? { ...m, content: fullText } : m
          )
        }));
      }

      // Voice output is now user-initiated — see the speaker button per message in ChloeFloatingButton

      if (isFirstChunk) {
        set({ isTyping: false });
      }

      set({ isTyping: false });
    } catch (error) {
      console.error('AI Error:', error);
      
      const errorMsg: Message = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: "Oops! I hit a snag in the eco-network. Please check your Groq API key in the .env file! ♻️",
        timestamp: Date.now(),
      };
      
      set(state => ({ 
        messages: [...state.messages, errorMsg],
        isTyping: false 
      }));
    }
  },
  clearHistory: () => set({ 
    messages: [{
      id: 'welcome',
      role: 'assistant',
      content: "History cleared! Let's start fresh. What's our next eco-mission?",
      timestamp: Date.now(),
    }] 
  }),
}));
