
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { GeneratedArticle, NewsItem } from "../types";

export const MODELS = {
  PRO_3: "gemini-3-pro-preview",
  FLASH_3: "gemini-3-flash-preview",
  FLASH_2_5: "gemini-2.5-flash-preview-09-2025",
  FLASH_2_0: "gemini-2.0-flash-exp",
  LITE_2_5: "gemini-flash-lite-latest",
  IMAGE_GEN: "gemini-2.5-flash-image"
};

const getAIClient = () => {
  // 嘗試從 process.env 獲取變數
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey });
};

const extractJson = (text: string | undefined): any => {
  if (!text) return null;
  // 移除 Markdown 標籤並嘗試解析
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
      contents: "列出目前台灣最熱門的 8 個關鍵字。直接回傳 JSON 陣列，例如：[\"關鍵字1\", \"關鍵字2\"]",
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(resp.text) || [];
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING") {
      throw new Error("系統偵測不到 API_KEY。請確保您已在 Vercel 設定環境變數並執行了最新的 Redeploy。");
    }
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
      contents: `搜尋「${topic}」的最新新聞，回傳 JSON 陣列，包含欄位：title, snippet, source, time, link。`,
      config: { tools: [{ googleSearch: {} }] }
    });

    const news = extractJson(resp.text) || [];
    const groundingChunks = resp.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((c: any) => c.web)
      .map((c: any) => ({ title: c.web.title || "來源", uri: c.web.uri }));

    return { news: Array.isArray(news) ? news : [], sources };
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING") throw new Error("API 金鑰缺失，請重新部署專案。");
    throw err;
  }
};

export const generateBilingualContent = async (input: string, style: string, modelType: string): Promise<GeneratedArticle> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: modelType,
    contents: `Original Material: ${input}`,
    config: {
      responseMimeType: "application/json",
      systemInstruction: `你是一位精通 SEO 與社群經營的編輯。根據提供素材生成 ${style} 風格的雙語內容。必須包含英文 Blogger SEO 封裝與繁體中文社群封裝（Threads, IG, 方格子）。`,
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
