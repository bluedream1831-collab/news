
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
      contents: "列出目前台灣最熱門的 8 個關鍵字。直接回傳 JSON 陣列字串，格式如：[\"關鍵字1\", \"關鍵字2\"]",
      config: { tools: [{ googleSearch: {} }] }
    });
    return extractJson(resp.text) || [];
  } catch (err: any) {
    if (err.message === "API_KEY_MISSING") {
      throw new Error("環境變數 API_KEY 缺失。請在 Vercel 設定後點擊 Redeploy。");
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
      contents: `搜尋關於「${topic}」的最新新聞資訊。回傳格式必須為 JSON 陣列，每個物件包含：title, snippet, source, time, link。`,
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
      systemInstruction: `你是一位精通 SEO 與多平台社群經營的資深編輯。
風格設定：${style}。
請根據提供的素材生成雙語內容。

⚡️強制規範：
1. 豐富 Emoji：在所有生成內容中，必須根據語境嵌入大量且生動的 Emoji，增加吸引力。
2. 禁止粗體語法：嚴禁在任何輸出的文字中使用 Markdown 的雙星號粗體標記（禁止出現 ** 符號）。若需強調重點，請使用 Emoji 或直接換行。
3. 繁體中文規範：所有內容均需使用台灣常用的繁體中文術語。
4. HTML 規範：在 fullHtml 欄位中，僅使用 <h2>, <h3>, <p>, <ul>, <li> 等結構化標籤，嚴禁使用 <strong> 或 <b> 標籤。

輸出格式必須嚴格遵守以下 JSON 結構：
{
  "english": {
    "seoStrategy": { "permalinkSlug": "", "searchDescription": "", "labels": [] },
    "visualInstructions": { "imagePrompt": "", "imageAltText": "" },
    "articleContent": { "h1Title": "", "fullHtml": "" },
    "operatingSuggestions": { "longTailKeywords": [], "internalLinkTip": "", "trafficGrowthTip": "" }
  },
  "chinese": {
    "titleStrategies": { "intuitive": "", "suspense": "", "benefit": "" },
    "content": { "style": "", "markdownBody": "", "callToAction": "", "instagramQuote": "", "instagramCaption": "" },
    "threadsPost": { "hook": "", "content": "", "cta": "", "tags": "" },
    "visualInstructions": { "imagePrompt": "", "imageAltText": "", "quoteImagePrompt": "", "storyImagePrompt": "" },
    "operatingSuggestions": { "vocusCollection": "", "interactionQuestion": "", "crossPromotionTip": "" }
  }
}`,
      temperature: 0.8,
    }
  });
  
  const article = extractJson(response.text) as GeneratedArticle;
  
  if (!article || !article.english || !article.chinese) {
    throw new Error("AI 回傳的資料格式不完整，請嘗試縮減素材長度或更換模型重新生成。");
  }

  return {
    ...article,
    metadata: {
      modelUsed: modelType,
      timestamp: Date.now(),
      originalInput: input
    }
  };
};
