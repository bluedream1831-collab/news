
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

// Fix: Move AIStudio out of declare global so it's a local declaration that can be exported.
// This resolves "Cannot export 'AIStudio'. Only local declarations can be exported from a module."
export interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Augmenting global Window interface.
declare global {
  interface Window {
    // Fix: Using the optional modifier to prevent "All declarations of 'aistudio' must have identical modifiers"
    // if a global declaration already exists in the environment (e.g., provided by the platform bridge).
    aistudio?: AIStudio;
  }
}

// 為了保持向後相容，我們也導出它
export type { AIStudio as AIStudioType };
