import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../../config';

// Helper to strip data URL prefix if present
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, "");
};

export const visionScan = {
  gemini: async (base64Image: string, prompt: string) => {
    const genAI = new GoogleGenerativeAI(CONFIG.API_KEYS.GEMINI || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const imageParts = [
      {
        inlineData: {
          data: stripBase64Prefix(base64Image),
          mimeType: base64Image.match(/data:([^;]+);/)?.[1] || "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  },

  sambaNova: async (base64Image: string, prompt: string) => {
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.SAMBANOVA}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gemma-3-12b-it",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: base64Image }
              }
            ]
          }
        ],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`SambaNova Vision API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },

  openRouter: async (base64Image: string, prompt: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.OPENROUTER}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-2-9b-it:free", // Using a free vision-capable model or fallback
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: base64Image } // Send full data URL
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};
