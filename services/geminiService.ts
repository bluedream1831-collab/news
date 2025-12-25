
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
  const apiKey = process.env.API_KEY;
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
      systemInstruction: `你是一位精通 SEO 策略與深度內容創作的資深主編，擅長透過社群視覺引流至部落格長文。

⏰ 時間覺醒指令：
- 必須精確識別素材中的【年份】。若素材為 2025 年，生成內容嚴禁出現 2024。

🚫 視覺與排版優化：
- **嚴禁使用 Markdown 標題標籤**：禁止使用 #, ##, ### 等符號。
- **改用 Emoji 分段**：請在段落或小節開頭使用生動的 Emoji (如 📌, 🚀, ✨, 💡, 📝, 🔍, 🔥)。
- **禁止粗體語法**：嚴禁在文中出現 ** 符號。
- 透過「Emoji + 換行」來創造呼吸感。

🎯 核心行動號召 (CTA) 指令：
- 所有中文輸出（包含部落格正文、Instagram 文案、Threads 貼文）的結尾，**必須聚焦於以下兩點**：
  1. 「追蹤我的方格子 (Vocus) 部落格」
  2. 「在下方留言分享你的看法/討論」
- 請用感性且自然的口吻撰寫，不要太像罐頭訊息。

風格設定：${style}。
輸出語言：英文 (SEO 部落格導向) 與 繁體中文 (社群引流與方格子深度文章)。

輸出格式 (必須嚴格遵守以下 JSON 結構)：
{
  "english": {
    "seoStrategy": { "permalinkSlug": "...", "searchDescription": "...", "labels": [...] },
    "visualInstructions": { "imagePrompt": "...", "imageAltText": "..." },
    "articleContent": { "h1Title": "...", "fullHtml": "..." },
    "operatingSuggestions": { "longTailKeywords": [...], "internalLinkTip": "...", "trafficGrowthTip": "..." }
  },
  "chinese": {
    "titleStrategies": { "intuitive": "...", "suspense": "...", "benefit": "..." },
    "visualInstructions": { "imagePrompt": "...", "imageAltText": "...", "quoteImagePrompt": "...", "storyImagePrompt": "..." },
    "content": { 
      "markdownBody": "正文內容，每個重點前加 Emoji，結尾需有追蹤方格子與留言的邀請。", 
      "instagramQuote": "視覺金句", 
      "instagramCaption": "IG 文案，結尾需導流至方格子與邀請留言。", 
      "callToAction": "強力的結尾邀請語（追蹤方格子+留言）" 
    },
    "threadsPost": { "hook": "...", "content": "...", "cta": "Threads 結尾（追蹤方格子+留言）", "tags": "..." },
    "operatingSuggestions": { "vocusCollection": "...", "interactionQuestion": "...", "crossPromotionTip": "..." }
  }
}`,
      temperature: 0.8,
    }
  });
  
  const article = extractJson(response.text) as GeneratedArticle;
  if (!article || !article.english || !article.chinese) {
    throw new Error("AI 回傳格式不完整，請嘗試重新生成。");
  }
  return {
    ...article,
    metadata: { modelUsed: modelType, timestamp: Date.now(), originalInput: input }
  };
};
