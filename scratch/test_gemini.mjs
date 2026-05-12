import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY || '');

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const result = await model.generateContent("hello");
    console.log(result.response.text());
  } catch (e) {
    console.error("2.5 failed:", e.message);
    try {
      const model2 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result2 = await model2.generateContent("hello");
      console.log("1.5 worked:", result2.response.text());
    } catch (e2) {
      console.error("1.5 failed:", e2.message);
    }
  }
}
test();
