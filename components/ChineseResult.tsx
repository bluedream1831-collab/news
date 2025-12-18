
import React, { useState } from 'react';
import { ChineseSocialPackage } from '../types';

interface ChineseResultProps {
  data: ChineseSocialPackage;
}

const ChineseResult: React.FC<ChineseResultProps> = ({ data }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // 核心修復：如果 data 為 undefined，顯示錯誤狀態而非崩潰
  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center font-chinese">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-slate-800 font-bold mb-2">繁體中文內容解析失敗</h3>
        <p className="text-slate-500 text-sm">AI 未能正確輸出繁體中文部分，這可能是因為素材內容過於簡短或格式異常。請嘗試更換模型或調整素材後重新生成。</p>
      </div>
    );
  }

  // UI-level Emoji Formatter (Clean Style)
  const formatEmojiContent = (text: string) => {
    if (!text) return "";
    return text
      .replace(/###\s?/g, "📌 ") // 替換 ### 標題
      .replace(/、/g, " ✨ ");   // 替換列舉逗號
  };

  const threadsPost = data.threadsPost || { hook: '', content: '', cta: '', tags: '' };
  const visual = data.visualInstructions || { imagePrompt: '', imageAltText: '', quoteImagePrompt: '', storyImagePrompt: '' };
  const suggestions = data.operatingSuggestions || { vocusCollection: '', interactionQuestion: '', crossPromotionTip: '' };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(formatEmojiContent(text));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const renderWithLinksAndEmoji = (text: string, className: string = "") => {
    if (!text) return null;
    const formattedText = formatEmojiContent(text);
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = formattedText.split(urlRegex);

    return (
        <span className={className}>
            {parts.map((part, index) => {
                if (part.match(urlRegex)) {
                    return (
                        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 break-all">
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
  };

  const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
  );

  return (
    <div className="space-y-6 font-chinese">
      {/* Title Strategies */}
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 sm:p-5">
        <h3 className="text-rose-900 font-bold mb-4 flex items-center gap-2">
           <span className="bg-rose-600 text-white text-xs px-2 py-1 rounded">標題策略</span>
           (Title Options)
        </h3>
        <div className="grid gap-3">
            {[
                { label: '直覺型 (Intuitive)', val: data.titleStrategies?.intuitive, key: 'title_intuitive' },
                { label: '懸念型 (Suspense)', val: data.titleStrategies?.suspense, key: 'title_suspense' },
                { label: '利益型 (Benefit)', val: data.titleStrategies?.benefit, key: 'title_benefit' }
            ].map(item => (
                <div key={item.key} className="bg-white p-3 rounded border border-rose-200 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-rose-500 uppercase">{item.label}</span>
                        <button onClick={() => copyToClipboard(item.val || '', item.key)} className="text-rose-400 hover:text-rose-600 p-1.5 rounded">
                            {copiedSection === item.key ? <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><CheckIcon/> 已複製</span> : <CopyIcon/>}
                        </button>
                    </div>
                    <p className="font-medium text-slate-800 text-sm sm:text-base">{formatEmojiContent(item.val || '')}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Threads Section */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm">
         <div className="bg-black text-white px-4 py-3 flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <div className="bg-white text-black rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">@</div>
                 <h3 className="font-bold text-sm sm:text-base">Threads 導流短文</h3>
             </div>
             <button onClick={() => copyToClipboard(`${threadsPost.hook}\n\n${threadsPost.content}\n\n${threadsPost.cta}\n\n${threadsPost.tags}`, 'threads')} className="text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-white border border-stone-700 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1">
                {copiedSection === 'threads' ? '已複製' : '複製串文'}
             </button>
         </div>
         <div className="p-4 sm:p-6">
             <div className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">
                 <div className="font-bold mb-3">{formatEmojiContent(threadsPost.hook)}</div>
                 <div className="mb-3 text-slate-800">{formatEmojiContent(threadsPost.content)}</div>
                 <div className="mb-3 font-semibold text-blue-600 underline">{renderWithLinksAndEmoji(threadsPost.cta)}</div>
                 <div className="text-blue-500 text-xs font-bold">{threadsPost.tags}</div>
             </div>
         </div>
      </div>

      {/* Main Blog Body */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="bg-slate-100 px-4 sm:px-5 py-3 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 text-sm sm:text-base flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
            部落格/方格子文章
          </h3>
          <button onClick={() => copyToClipboard((data.content?.markdownBody || "") + "\n\n" + (data.content?.callToAction || ""), 'body')} className="text-xs font-semibold bg-white border border-slate-300 hover:border-rose-500 hover:text-rose-600 px-3 py-1.5 rounded transition-colors flex items-center gap-1">
            {copiedSection === 'body' ? '已複製' : '複製全文明細'}
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="prose prose-slate max-w-none text-slate-700 font-chinese whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
            {renderWithLinksAndEmoji(data.content?.markdownBody || "")}
          </div>
          <div className="mt-8 pt-6 border-t border-slate-100">
             <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                <span className="block text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">🚀 行動呼籲 (CTA)</span>
                <p className="text-rose-600 font-bold text-sm sm:text-base">{formatEmojiContent(data.content?.callToAction || "")}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Operating Suggestions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-amber-900 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.974 0l7 4.5A1 1 0 0119 6.388v8.225a1 1 0 01-.726.96l-7 2.25a1 1 0 01-.548 0l-7-2.25A1 1 0 013 14.613V6.388a1 1 0 01.726-.96l7-4.381zM10 3.033L4.606 6.406 10 9.873l5.394-3.467L10 3.033zM4 8.259v5.233l5 1.607v-5.233l-5-1.607zm12 0l-5 1.607v5.233l5-1.607V8.259z" clipRule="evenodd" /></svg>
          社群經營指南 (Growth Strategy)
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <span className="text-xs font-bold text-amber-600 uppercase mb-2 block">方格子專題建議</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{suggestions.vocusCollection}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <span className="text-xs font-bold text-amber-600 uppercase mb-2 block">社群互動問題</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{suggestions.interactionQuestion}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <span className="text-xs font-bold text-amber-600 uppercase mb-2 block">跨平台導流技巧</span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{suggestions.crossPromotionTip}</p>
            </div>
        </div>
      </div>

      {/* Visual Instructions */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-sm sm:text-base">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
          視覺指令與 AI 提示詞
        </h3>
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500">IG 貼文背景提示詞 (4:5)</span>
                <button onClick={() => copyToClipboard(visual.quoteImagePrompt || '', 'quote_prompt')} className="text-xs text-indigo-600 font-bold hover:underline">複製</button>
             </div>
             <p className="text-xs text-slate-600">{visual.quoteImagePrompt}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
             <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-500">IG 限動視覺提示詞 (9:16)</span>
                <button onClick={() => copyToClipboard(visual.storyImagePrompt || '', 'story_prompt')} className="text-xs text-indigo-600 font-bold hover:underline">複製</button>
             </div>
             <p className="text-xs text-slate-600">{visual.storyImagePrompt}</p>
          </div>
        </div>
      </div>

      {/* Instagram Caption */}
      <div className="bg-white border border-purple-100 rounded-xl overflow-hidden shadow-sm">
         <div className="bg-purple-50 px-4 py-3 border-b border-purple-100 flex justify-between items-center">
             <h3 className="font-bold text-purple-900 text-sm sm:text-base flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" /></svg>
                Instagram 貼文文案
             </h3>
             <button onClick={() => copyToClipboard(data.content?.instagramCaption || '', 'ig_caption')} className="text-xs font-semibold bg-white border border-purple-200 hover:border-purple-400 hover:text-purple-700 px-3 py-1.5 rounded transition-colors">
                {copiedSection === 'ig_caption' ? '已複製!' : '複製文案'}
             </button>
         </div>
         <div className="p-4 sm:p-6">
             <div className="text-sm sm:text-base text-slate-700 whitespace-pre-wrap leading-relaxed font-chinese">
                {renderWithLinksAndEmoji(data.content?.instagramCaption || "")}
             </div>
         </div>
      </div>
    </div>
  );
};

export default ChineseResult;
