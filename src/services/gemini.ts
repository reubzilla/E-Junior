import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[] = []) => {
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a helpful and patient ESL (English as a Second Language) tutor. Your goal is to help students practice their English. Use simple language when appropriate, correct their grammar gently, and encourage them. If they ask for a translation, provide it but also explain the context.",
    },
  });

  // Note: sendMessage only accepts the message parameter
  const response = await chat.sendMessage({ message: prompt });
  return response.text;
};
