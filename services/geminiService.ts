
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
- 必須精確識別 Original Material 中的【年份資訊】與【日期】。
- 如果素材提到 2025 年，產出的文章年份必須與之 100% 匹配。嚴禁寫成 2024 年。

🚫 視覺排版優化 (CRITICAL)：
- **嚴禁使用 Markdown 標題標籤**：禁止使用 #, ##, ###。
- **改用 Emoji 分段**：請使用生動的 Emoji (如 📌, 🚀, ✨, 💡, 📝, 🔍, 🔥) 作為每個小節或段落的開頭標誌。
- **嚴禁粗體語法**：嚴禁使用 ** 符號。
- 透過「Emoji + 換行」來創造呼吸感與層次感。

風格設定：${style}。
輸出語言：英文 (SEO 導向) 與 繁體中文 (深度閱讀與引流導向)。

⚡️ 繁體中文引流規範：
1. **標題策略**：必須提供 titleStrategies 物件，包含 intuitive, suspense, benefit 三種標題（不使用##）。
2. **文案導流**：instagramCaption 與 threadsPost.cta 必須包含引流語句。
3. **視覺導流 (quoteImagePrompt)**：1:1 指令並描述「底部保留約 1/5 空間作為導流文字區」。

輸出格式：
{
  "english": { ... },
  "chinese": {
    "titleStrategies": { "intuitive": "...", "suspense": "...", "benefit": "..." },
    "visualInstructions": { "imagePrompt": "...", "imageAltText": "...", "quoteImagePrompt": "...", "storyImagePrompt": "..." },
    "content": { "markdownBody": "...", "instagramQuote": "...", "instagramCaption": "...", "callToAction": "..." },
    "threadsPost": { "hook": "...", "content": "...", "cta": "...", "tags": "..." },
    "operatingSuggestions": { "vocusCollection": "...", "interactionQuestion": "...", "crossPromotionTip": "..." }
  }
}`,
      temperature: 0.85,
    }
  });
  
  const article = extractJson(response.text) as GeneratedArticle;
  if (!article || !article.english || !article.chinese) {
    throw new Error("AI 回傳格式不完整，請嘗試切換引擎或重新生成。");
  }
  return {
    ...article,
    metadata: { modelUsed: modelType, timestamp: Date.now(), originalInput: input }
  };
};
