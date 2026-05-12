import { GoogleGenerativeAI } from '@google/generative-ai';
import { CONFIG } from '../../config';

// Helper to strip data URL prefix if present
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, "");
};

export const visionScan = {
  gemini: async (base64Image: string, prompt: string) => {
    const genAI = new GoogleGenerativeAI(CONFIG.API_KEYS.GEMINI || '');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite-preview-06-17" });

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
        model: "Llama-4-Scout-17B-16E-Instruct",
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

  cloudVision: async (base64Image: string) => {
    // Final fallback using Google Cloud Vision REST API
    const base64 = stripBase64Prefix(base64Image);
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${CONFIG.API_KEYS.GOOGLE}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [{
            image: { content: base64 },
            features: [
              { type: 'LABEL_DETECTION', maxResults: 10 },
              { type: 'SAFE_SEARCH_DETECTION' }
            ]
          }]
        })
      }
    );
    if (!response.ok) throw new Error(`Cloud Vision error: ${response.status}`);
    const data = await response.json();
    const result = data.responses?.[0];
    if (!result) throw new Error('No Cloud Vision result');
    // Convert to same format as Gemini
    const labels = (result.labelAnnotations || []).map((l: any) => `${l.description}`);
    return JSON.stringify({
      labels: result.labelAnnotations?.map((l: any) => ({ description: l.description, score: l.score })) || [],
      isSafe: result.safeSearchAnnotation?.adult === 'VERY_UNLIKELY',
      hasPlastic: labels.some((l: string) => ['plastic', 'bottle', 'waste', 'bag', 'container'].includes(l.toLowerCase())),
      text: result.fullTextAnnotation?.text || ''
    });
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
