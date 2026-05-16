import { CONFIG } from '../../config';

export const textCompletion = {
  groq: async (prompt: string, systemPrompt?: string, memoryContext?: string) => {
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    if (memoryContext) messages.push({ role: "system", content: `USER CONTEXT: ${memoryContext}` });
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.GROQ}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  sambaNova: async (prompt: string, systemPrompt?: string, memoryContext?: string) => {
    const messages = [];
    if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
    if (memoryContext) messages.push({ role: "system", content: `USER CONTEXT: ${memoryContext}` });
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.sambanova.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.SAMBANOVA}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-oss-120b", // Corrected model name
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`SambaNova API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  mistral: async (prompt: string, systemPrompt?: string) => {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.MISTRAL}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "ministral-3b-latest",
        messages: [
          { role: "system", content: systemPrompt || "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) throw new Error(`Mistral API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  cerebras: async (prompt: string, systemPrompt?: string) => {
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.CEREBRAS}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.1-8b",
        messages: [
          { role: "system", content: systemPrompt || "You are a helpful assistant." },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) throw new Error(`Cerebras API error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  together: async (prompt: string, systemPrompt?: string) => {
    const response = await fetch("https://api.together.xyz/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.TOGETHER_AI}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "DeepSeek-V3-0324",
        messages: [
          { role: "system", content: systemPrompt || "You are Chloe, an eco-assistant." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error(`Together AI error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  siliconFlow: async (prompt: string, systemPrompt?: string) => {
    const response = await fetch("https://api.siliconflow.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.SILICON_API}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-V3",
        messages: [
          { role: "system", content: systemPrompt || "You are Chloe, an eco-assistant." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error(`SiliconFlow error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  },

  openai: async (prompt: string, systemPrompt?: string) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${CONFIG.API_KEYS.OPENAI}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt || "You are Chloe, an eco-assistant." },
          { role: "user", content: prompt }
        ]
      })
    });
    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  }
};
