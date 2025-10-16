// configs/AiModel.jsx
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// NOTE: You’re using a public key in the client. This is fine for prototyping.
// For production, prefer a server route or server action so the key isn’t exposed.
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Choose the model shown in your screenshot
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

// Your generation config from the screenshot
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const CodeGenerationConfig={
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
}

/**
 * If you prefer a “run()” function exactly like the Gemini quickstart:
 * (kept here for parity with your screenshot)
 */
export const chatSession = model.startChat({
    generationConfig,
    history: [],
  });

// Gemini wants: [{ role: 'user' | 'model', parts: [{ text }] }, ...]
const toGeminiHistory = (messages = []) =>
  messages
    .filter(m => m?.content?.trim?.())
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model', // your 'ai'/'assistant' -> 'model'
      parts: [{ text: m.content }],
    }));

// Use it when creating the chat
export const GenAiCode = (messages) =>
  model.startChat({
    generationConfig: CodeGenerationConfig,
    history: toGeminiHistory(messages),
  });

