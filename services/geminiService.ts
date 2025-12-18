
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

const ARTICLE_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    english: {
      type: Type.OBJECT,
      properties: {
        seoStrategy: {
          type: Type.OBJECT,
          properties: {
            permalinkSlug: { type: Type.STRING },
            searchDescription: { type: Type.STRING },
            labels: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["permalinkSlug", "searchDescription", "labels"]
        },
        visualInstructions: {
          type: Type.OBJECT,
          properties: {
            imagePrompt: { type: Type.STRING },
            imageAltText: { type: Type.STRING }
          },
          required: ["imagePrompt", "imageAltText"]
        },
        articleContent: {
          type: Type.OBJECT,
          properties: {
            h1Title: { type: Type.STRING },
            fullHtml: { type: Type.STRING }
          },
          required: ["h1Title", "fullHtml"]
        },
        operatingSuggestions: {
          type: Type.OBJECT,
          properties: {
            longTailKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            internalLinkTip: { type: Type.STRING },
            trafficGrowthTip: { type: Type.STRING }
          },
          required: ["longTailKeywords", "internalLinkTip", "trafficGrowthTip"]
        }
      },
      required: ["seoStrategy", "visualInstructions", "articleContent", "operatingSuggestions"]
    },
    chinese: {
      type: Type.OBJECT,
      properties: {
        titleStrategies: {
          type: Type.OBJECT,
          properties: {
            intuitive: { type: Type.STRING },
            suspense: { type: Type.STRING },
            benefit: { type: Type.STRING }
          },
          required: ["intuitive", "suspense", "benefit"]
        },
        content: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            markdownBody: { type: Type.STRING },
            callToAction: { type: Type.STRING },
            instagramQuote: { type: Type.STRING },
            instagramCaption: { type: Type.STRING }
          },
          required: ["style", "markdownBody", "callToAction", "instagramQuote", "instagramCaption"]
        },
        threadsPost: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            content: { type: Type.STRING },
            cta: { type: Type.STRING },
            tags: { type: Type.STRING }
          },
          required: ["hook", "content", "cta", "tags"]
        },
        visualInstructions: {
          type: Type.OBJECT,
          properties: {
            imagePrompt: { type: Type.STRING },
            imageAltText: { type: Type.STRING },
            quoteImagePrompt: { type: Type.STRING },
            storyImagePrompt: { type: Type.STRING }
          },
          required: ["imagePrompt", "imageAltText", "quoteImagePrompt", "storyImagePrompt"]
        },
        operatingSuggestions: {
          type: Type.OBJECT,
          properties: {
            vocusCollection: { type: Type.STRING },
            interactionQuestion: { type: Type.STRING },
            crossPromotionTip: { type: Type.STRING }
          },
          required: ["vocusCollection", "interactionQuestion", "crossPromotionTip"]
        }
      },
      required: ["titleStrategies", "content", "threadsPost", "visualInstructions", "operatingSuggestions"]
    }
  },
  required: ["english", "chinese"]
};

const extractJson = (text: string | undefined): any => {
  if (!text) return null;
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) { try { return JSON.parse(objectMatch[0]); } catch {} }
  }
  return null;
};

export const getTrendingTopics = async (model: string = MODELS.FLASH_3): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const resp = await ai.models.generateContent({
    model: model,
    contents: "列出目前台灣最熱門的 8 個搜尋趨勢關鍵字。請回傳純 JSON 陣列格式。",
    config: { tools: [{ googleSearch: {} }] }
  });
  return extractJson(resp.text) || [];
};

export const searchNews = async (topic: string, model: string = MODELS.FLASH_3): Promise<NewsItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const resp = await ai.models.generateContent({
    model: model,
    contents: `搜尋「${topic}」的 5 則最新繁體中文新聞。回傳 JSON 陣列，含：title, snippet(摘要), source, time(發布時間), link。`,
    config: { tools: [{ googleSearch: {} }] }
  });
  const data = extractJson(resp.text);
  if (Array.isArray(data)) return data.slice(0, 5);
  return [];
};

export const generateBilingualContent = async (input: string, style: string, modelType: string): Promise<GeneratedArticle> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const visualStyleGuideline = `
    VERSION 2.1 VISUAL STYLE (MANDATORY):
    1. NO MARKDOWN HEADERS: Do not use "###". Instead, start headers with 📌 or 🚀.
    2. NO LIST COMMAS: Do not use "、" for lists. Use ✨ or ✅ as bullet points.
    3. CLEAN WHITESPACE: Do NOT use decorative dividers like "〰️〰️〰️". Use simple empty lines (double newlines) for separation.
    4. ENGLISH HTML: Use <h2> and <h3> with emojis (e.g., <h2>🚀 Key Takeaways</h2>).
    
    TONE: Engaging, localized for Taiwan (Trad. Chinese) and SEO-optimized (English).
  `;

  const config: any = {
    responseMimeType: "application/json",
    responseSchema: ARTICLE_RESPONSE_SCHEMA,
    systemInstruction: `You are a world-class content curator. Style: ${style}. ${visualStyleGuideline}`,
    temperature: 0.7,
  };

  if (modelType === MODELS.PRO_3) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else if (modelType === MODELS.FLASH_2_5 || modelType === MODELS.FLASH_3) {
    config.thinkingConfig = { thinkingBudget: 16384 };
  }

  const response = await ai.models.generateContent({
    model: modelType,
    contents: [{ role: "user", parts: [{ text: `Original Material: ${input}` }] }],
    config: config
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

export const generateImage = async (prompt: string, aspectRatio: any): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const resp = await ai.models.generateContent({
    model: MODELS.IMAGE_GEN,
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio } }
  });
  const part = resp.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("Generation Failed");
};
