
import React, { useState } from 'react';
import { EnglishBloggerPackage } from '../types';

interface EnglishResultProps {
  data: EnglishBloggerPackage;
}

const EnglishResult: React.FC<EnglishResultProps> = ({ data }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!data || !data.seoStrategy) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <p className="text-slate-500">無法加載英文版數據，請重試。</p>
      </div>
    );
  }

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );

  // Helper (Clean Style)
  const formatEmojiText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/###\s?/g, "📌 ")
      .replace(/、/g, " ✨ ");
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 sm:p-5">
        <h3 className="text-indigo-900 font-bold mb-4 flex items-center gap-2">
           <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded">SEO</span>
           設定 (Metadata)
        </h3>
        <div className="grid gap-6 text-sm">
          {/* Slug Section */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-semibold text-indigo-700 min-w-[130px] pt-1">網址代稱 (Slug):</span>
            <div className="flex-1 min-w-0 flex items-center gap-2">
                <code className="bg-white px-2 py-1.5 rounded border border-indigo-200 text-slate-600 font-mono break-all flex-1 text-xs sm:text-sm">
                    {data.seoStrategy.permalinkSlug}
                </code>
                <button onClick={() => copyToClipboard(data.seoStrategy.permalinkSlug, 'slug')} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded transition-colors">
                    {copiedSection === 'slug' ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>
          </div>
          {/* Description Section */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-semibold text-indigo-700 min-w-[130px] pt-1">搜尋說明:</span>
            <div className="flex-1 min-w-0 flex items-start gap-2">
                <p className="bg-white/50 p-2 rounded border border-indigo-100 text-slate-700 italic flex-1 text-xs sm:text-sm">
                    {formatEmojiText(data.seoStrategy.searchDescription)}
                </p>
                <button onClick={() => copyToClipboard(data.seoStrategy.searchDescription, 'desc')} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded mt-1">
                     {copiedSection === 'desc' ? <CheckIcon /> : <CopyIcon />}
                </button>
            </div>
          </div>
          {/* Labels Section */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="font-semibold text-indigo-700 min-w-[130px] pt-1">標籤 (Labels):</span>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {data.seoStrategy.labels?.map((label, i) => (
                  <span key={i} className="bg-white border border-indigo-200 text-indigo-600 px-2 py-0.5 rounded-full text-xs">{label}</span>
                ))}
              </div>
              <button onClick={() => copyToClipboard(data.seoStrategy.labels?.join(',') || '', 'labels')} className="text-xs font-medium bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded flex items-center gap-1 transition-colors">
                {copiedSection === 'labels' ? <><CheckIcon /> 已複製</> : <><CopyIcon /> 一鍵複製 (逗號分隔)</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Blogger Operating Advice */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-orange-900 font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          Blogger 經營指南 (Traffic Strategy)
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                <span className="text-xs font-bold text-orange-600 uppercase mb-2 block">長尾關鍵字追蹤</span>
                <ul className="text-xs sm:text-sm text-slate-600 list-disc list-inside space-y-1">
                    {data.operatingSuggestions?.longTailKeywords?.map((kw, i) => (<li key={i}>{kw}</li>))}
                </ul>
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                <span className="text-xs font-bold text-orange-600 uppercase mb-2 block">內部連結建議</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{formatEmojiText(data.operatingSuggestions?.internalLinkTip)}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                <span className="text-xs font-bold text-orange-600 uppercase mb-2 block">外部導流策略</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{formatEmojiText(data.operatingSuggestions?.trafficGrowthTip)}</p>
            </div>
        </div>
      </div>

      {/* Visuals */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
          視覺指令 (Visual Instructions)
        </h3>
        <div className="space-y-3 text-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 block">圖片提示詞 (16:9):</span>
                <button onClick={() => copyToClipboard(data.visualInstructions?.imagePrompt || '', 'eng_img_prompt')} className="text-indigo-500 hover:text-indigo-700 text-xs flex items-center gap-1">
                    {copiedSection === 'eng_img_prompt' ? <span className="text-green-600 flex items-center gap-1"><CheckIcon/> 已複製</span> : <span className="flex items-center gap-1"><CopyIcon/> 複製</span>}
                </button>
            </div>
            <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600 text-xs sm:text-sm">{data.visualInstructions?.imagePrompt}</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-slate-700 block">替代文字 (Alt Text):</span>
                <button onClick={() => copyToClipboard(data.visualInstructions?.imageAltText || '', 'eng_img_alt')} className="text-indigo-500 hover:text-indigo-700 text-xs flex items-center gap-1">
                    {copiedSection === 'eng_img_alt' ? <span className="text-green-600 flex items-center gap-1"><CheckIcon/> 已複製</span> : <span className="flex items-center gap-1"><CopyIcon/> 複製</span>}
                </button>
            </div>
            <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600 text-xs sm:text-sm">{data.visualInstructions?.imageAltText}</p>
          </div>
        </div>
      </div>

      {/* HTML Content */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-100 px-4 sm:px-5 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2 text-sm sm:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            HTML 內容
          </h3>
          <button onClick={() => copyToClipboard(`<h1>${data.articleContent?.h1Title || ''}</h1>\n` + (data.articleContent?.fullHtml || ''), 'html')} className="text-xs font-semibold bg-white border border-slate-300 hover:text-indigo-600 px-3 py-1.5 rounded flex items-center gap-1">
            {copiedSection === 'html' ? <><CheckIcon /> 已複製</> : '複製代碼'}
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{formatEmojiText(data.articleContent?.h1Title || '')}</h1>
          <div className="prose prose-slate max-w-none text-slate-700 text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: data.articleContent?.fullHtml || '' }} />
        </div>
      </div>
    </div>
  );
};

export default EnglishResult;
