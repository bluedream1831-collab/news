
export interface EnglishBloggerPackage {
  seoStrategy: {
    permalinkSlug: string;
    searchDescription: string;
    labels: string[];
  };
  visualInstructions: {
    imagePrompt: string;
    imageAltText: string;
  };
  articleContent: {
    h1Title: string;
    fullHtml: string;
  };
  operatingSuggestions: {
    longTailKeywords: string[];
    internalLinkTip: string;
    trafficGrowthTip: string;
  };
}

export interface ChineseSocialPackage {
  titleStrategies: {
    intuitive: string;
    suspense: string;
    benefit: string;
  };
  content: {
    style: string;
    markdownBody: string;
    callToAction: string;
    instagramQuote: string;
    instagramCaption: string;
  };
  threadsPost: {
    hook: string;
    content: string;
    cta: string;
    tags: string;
  };
  visualInstructions: {
    imagePrompt: string;
    imageAltText: string;
    quoteImagePrompt: string;
    storyImagePrompt: string;
  };
  operatingSuggestions: {
    vocusCollection: string;
    interactionQuestion: string;
    crossPromotionTip: string;
  };
}

export interface GeneratedArticle {
  english: EnglishBloggerPackage;
  chinese: ChineseSocialPackage;
  metadata?: {
    modelUsed: string;
    timestamp: number;
    originalInput: string;
  };
}

export interface NewsItem {
  title: string;
  source: string;
  snippet: string;
  time: string;
  link?: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
  modelUsed: string;
  data: GeneratedArticle;
}

// 核心修復：將介面直接定義在全域空間中
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

// 為了讓其他檔案能 import，我們保留一個 export，但主要的型別已經在 global 了
export interface AIStudioExport extends AIStudio {}
