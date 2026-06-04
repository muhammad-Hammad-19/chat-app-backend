import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const getSmartReplies = async (message) => {
  const prompt = `
User message: "${message}"

Generate Roman Urdu 3 short smart replies (max 8 words each).
Keep them casual and chat-friendly.
Return only replies, each on new line.
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.split("\n");
};
