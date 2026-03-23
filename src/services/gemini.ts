import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Word, Question } from "../types";

// In Vite, we use import.meta.env to access environment variables.
// Only variables prefixed with VITE_ are exposed to the client.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

export const getGeminiResponse = async (prompt: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[] = []) => {
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
    return "Error: API Key missing.";
  }
  const ai = new GoogleGenAI({ apiKey });
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are a helpful and patient ESL (English as a Second Language) tutor. Your goal is to help students practice their English. Use simple language when appropriate, correct their grammar gently, and encourage them. If they ask for a translation, provide it but also explain the context.",
    },
  });

  const response = await chat.sendMessage({ message: prompt });
  return response.text;
};

export const generateQuizQuestions = async (vocabulary: Word[], cefrLevel?: string, theme?: string): Promise<Question[]> => {
  if (!apiKey) {
    throw new Error("Gemini API Key is missing. Please set VITE_GEMINI_API_KEY in your environment variables.");
  }
  const ai = new GoogleGenAI({ apiKey });
  const contextInfo = `
Target Students CEFR Level: ${cefrLevel || 'A2'}
Unit Theme: ${theme || 'General English'}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate 10 English vocabulary quiz questions based on the following vocabulary list:
${vocabulary.map(v => `- ${v.term}: ${v.definition}`).join('\n')}

${contextInfo}

Please ensure the example sentences and distractors are appropriate for the ${cefrLevel || 'A2'} level and relate to the theme of "${theme || 'General English'}" where possible.

Include a variety of question types:
1. "multiple_choice": Standard definition matching. The prompt should be "What is the definition of [word]?" and the options MUST be 4 different definitions (one correct, three distractors). DO NOT use the word itself as an option.
2. "collocation": Target word + 3 nouns (choose the partner). Example: Heavy + [Rain / Idea / Song]. The options MUST be the potential partners (e.g., "Rain", "Idea", "Song"), NOT the target word itself.
3. "odd_one_out": 4 words, 3 similar, 1 different. Example: [Ecstatic / Thrilled / Depressed / Overjoyed].
4. "visual_context": A sentence with a blank and 3 options. Provide a description of an image that would fit. Example: "My office is very ________." [Tidy / Messy / Spacious].
5. "word_family": Sentence with blank + root word + suffix options. Example: "He is a very _______ person." Root: SUCCESS. Options: [-ful, -fully, -ion].
6. "sentence_scramble": A complete example sentence using the target word. The correctAnswer should be the full, correct sentence. The options should be the individual words of the sentence.

Provide the result as a JSON array.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['multiple_choice', 'collocation', 'odd_one_out', 'visual_context', 'word_family', 'sentence_scramble'] },
            word: { type: Type.STRING },
            prompt: { type: Type.STRING },
            correctAnswer: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            imageDescription: { type: Type.STRING },
            rootWord: { type: Type.STRING },
          },
          required: ['id', 'type', 'word', 'prompt', 'correctAnswer', 'options'],
        },
      },
    },
  });

  return JSON.parse(response.text);
};

export const generateImage = async (description: string): Promise<string | undefined> => {
  if (!apiKey) {
    console.error("Gemini API Key is missing for image generation.");
    return undefined;
  }
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A simple, clear illustration for an ESL student showing: ${description}` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return undefined;
};
