
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

// 解決 TypeScript 找不到 aistudio 的問題
// Fix: Defining AIStudio interface to match the expected global type name and modifiers.
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

declare global {
  interface Window {
    aistudio: AIStudio;
  }
}
