export const CONFIG = {
  API_KEYS: {
    GEMINI: import.meta.env.VITE_GEMINI_API_KEY,
    OPENROUTER: import.meta.env.VITE_OPENROUTER_API_KEY,
    GROQ: import.meta.env.VITE_GROQ_API_KEY,
    TOGETHER_AI: import.meta.env.VITE_TOGETHER_AI_KEY,
    SAMBANOVA: import.meta.env.VITE_SAMBANOVA_API_KEY,
    TRIPY_AI: import.meta.env.VITE_TRIPY_AI_KEY,
    HUGGING_FACE: import.meta.env.VITE_HUGGING_FACE_KEY,
    SILICON_API: import.meta.env.VITE_SILICON_API_KEY,
    OPENAI: import.meta.env.VITE_OPENAI_API_KEY,
    GOOGLE: import.meta.env.VITE_GOOGLE_API_KEY,
    PERENUAL: import.meta.env.VITE_PERENUAL_API_KEY,
    OPENWEATHER: import.meta.env.VITE_OPENWEATHER_API_KEY,
    NEWS_API: import.meta.env.VITE_NEWS_API_KEY,
    MISTRAL: import.meta.env.VITE_MISTRAL_API_KEY,
    CEREBRAS: import.meta.env.VITE_CEREBRAS_API_KEY,
    SEARCH_ENGINE_ID: import.meta.env.VITE_SEARCH_ENGINE_ID,
    GOOGLE_MAPS: import.meta.env.VITE_GOOGLE_API_KEY,

  },
  REWARDS: {
    CONVERSION_RATE: 1000, // 1000 PLC = 1 INR
    BASE_POINTS: 50,
    DIFFICULTY_MULTIPLIERS: {
      LOW: 1,
      MEDIUM: 1.5,
      HIGH: 2.5,
    }
  },
  APP: {
    NAME: 'PlastiNet',
    VERSION: '1.0.0',
    POWERED_BY: 'Chloe AI',
  }
}
