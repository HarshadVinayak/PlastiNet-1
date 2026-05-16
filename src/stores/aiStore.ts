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
STRICT TOPIC RULE: You are ONLY permitted to discuss: POLLUTION, ENVIRONMENT, ECO, ECOSYSTEM, PLANTS, NATURE, and PlastiNet features.
If a user asks about unrelated topics, politely steer them back to these core environmental subjects.
Be high-energy, encouraging, and use eco-tech terminology.

LOCATION AWARENESS: You have direct access to the user's real-time GPS location and local recycling points. Use this to provide convenient advice.

NEWS ACCESS: You have access to real-time environmental news headlines. Use them to keep the user informed about global eco-events.

FORMATTING RULE: Format your responses like an engaging story! Always make them detailed, neat, with plenty of content and words. Use clean bullet points and proper paragraphs.
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
      const { newsService } = await import('../services/newsService');
      
      const { city, nearbyPlaces } = useLocationStore.getState();
      const { preferences } = usePreferenceStore.getState();
      const ecoNews = await newsService.fetchEcoNews();

      let dynamicSystemPrompt = GLOBAL_MODERATION_RULE;
      dynamicSystemPrompt += `\n\nCURRENT USER DATA:\n- Location: ${city || 'Unknown Area'}\n- Accessibility: ${preferences.accessibility}\n`;
      
      if (nearbyPlaces.length > 0) {
        dynamicSystemPrompt += `- Local Recycling Centers within 6km:\n`;
        nearbyPlaces.slice(0, 3).forEach(p => {
          dynamicSystemPrompt += `  * ${p.name}: ${p.address}\n`;
        });
      }

      if (ecoNews.length > 0) {
        dynamicSystemPrompt += `\n- LATEST GLOBAL ECO NEWS:\n`;
        ecoNews.slice(0, 3).forEach(n => {
          dynamicSystemPrompt += `  * ${n.title}\n`;
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
        model: "openai/gpt-oss-20b",
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
