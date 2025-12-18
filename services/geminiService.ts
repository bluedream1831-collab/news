
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeneratedArticle, NewsItem } from "../types";

// Added LITE_2_5 to fix compilation errors in components/ModelInfoModal.tsx
export const MODELS = {
  PRO_3: "gemini-3-pro-preview",
  FLASH_3: "gemini-3-flash-preview",
  FLASH_2_5: "gemini-2.5-flash-preview-09-2025",
  FLASH_2_0: "gemini-2.0-flash-exp",
  LITE_2_5: "gemini-flash-lite-latest",
  IMAGE_GEN: "gemini-2.5-flash-image"
};

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  // 檢查是否為空字串、undefined 或是字串型態的 "undefined"
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const extractJson = (text: string | undefined): any => {
  if (!text) return null;
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) { 
      try { return JSON.parse(jsonMatch[0]); } catch { return null; }
    }
  }
  return null;
};

export const getTrendingTopics = async (model: string = MODELS.FLASH_3): Promise<string[]> => {
  try {
    const ai = getAIClient();
    const resp = await ai.models.generateContent({
      model: model,
      contents: "列出目前台灣最熱門的 8 個關鍵字。回傳格式：[\"A\", \"B\"]",
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(resp.text) || [];
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING") throw new Error("環境變數 API_KEY 缺失。請在 Vercel 設定後點擊 Redeploy。");
    throw err;
  }
};

export interface SearchResult {
  news: NewsItem[];
  sources: { title: string; uri: string }[];
}

export const searchNews = async (topic: string, model: string = MODELS.FLASH_3): Promise<SearchResult> => {
  try {
    const ai = getAIClient();
    const resp = await ai.models.generateContent({
      model: model,
      contents: `搜尋「${topic}」的最新新聞，回傳 JSON 陣列含 title, snippet, source, time, link。`,
      config: { tools: [{ googleSearch: {} }] }
    });

    const news = extractJson(resp.text) || [];
    const groundingChunks = resp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title || "來源", uri: c.web.uri }));

    return { news: Array.isArray(news) ? news : [], sources };
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING") throw new Error("環境變數 API_KEY 缺失。請在 Vercel 設定後點擊 Redeploy。");
    throw err;
  }
};

export const generateBilingualContent = async (input: string, style: string, modelType: string): Promise<GeneratedArticle> => {
  const ai = getAIClient();
  // Fixed: Use direct string for contents and ensure systemInstruction is in config
  const response = await ai.models.generateContent({
    model: modelType,
    contents: `Original Material: ${input}`,
    config: {
      responseMimeType: "application/json",
      systemInstruction: `You are an expert bilingual content creator. Style: ${style}. Return detailed English and Chinese versions in JSON.`,
      temperature: 0.7,
    }
  });
  
  const article = extractJson(response.text) as GeneratedArticle;
  return {
    ...article,
    metadata: {
      modelUsed: modelType,
      timestamp: Date.now(),
      originalInput: input
    }
  };
};
