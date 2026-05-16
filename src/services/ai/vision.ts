import { CONFIG } from '../../config';

// Helper to strip data URL prefix if present
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:image\/[a-z]+;base64,/, "");
};

export const visionScan = {
  gemini: async (base64Image: string, prompt: string) => {
    // Using REST API directly (confirmed working)
    const mimeType = base64Image.match(/data:([^;]+);/)?.[1] || 'image/jpeg';
    const base64Data = stripBase64Prefix(base64Image);
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${CONFIG.API_KEYS.GEMINI}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { data: base64Data, mimeType } }
            ]
          }]
        })
      }
    );
    if (!response.ok) {
      const err = await response.json();
      throw new Error(`Gemini API error: ${err?.error?.message || response.status}`);
    }
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  sambaNova: async (base64Image: string, prompt: string) => {
    const dataUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.SAMBANOVA}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Llama-4-Maverick-17B-128E-Instruct",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }],
        temperature: 0.1
      })
    });

    if (!response.ok) {
      throw new Error(`SambaNova Vision API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },

  groq: async (base64Image: string, prompt: string) => {
    const dataUrl = base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.GROQ}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`Groq Vision API error: ${response.status}`);
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
        model: "google/gemma-4-31b-it:free", // Using a free vision-capable model or fallback
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
  },

  huggingface: async (base64Image: string, prompt: string) => {
    const response = await fetch("https://api-inference.huggingface.co/models/Qwen/Qwen3.6-35B-A3B", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.HUGGING_FACE}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: {
          image: stripBase64Prefix(base64Image),
          text: prompt
        }
      })
    });
    if (!response.ok) throw new Error(`Hugging Face Vision error: ${response.status}`);
    const data = await response.json();
    return data[0]?.generated_text || '';
  }
};
