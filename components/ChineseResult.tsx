
import React, { useState } from 'react';
import { ChineseSocialPackage } from '../types';

interface ChineseResultProps {
  data: ChineseSocialPackage;
}

const ChineseResult: React.FC<ChineseResultProps> = ({ data }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!data) return null;

  const formatEmojiContent = (text: string) => {
    if (!text) return "";
    return text.replace(/###\s?/g, "📌 ").replace(/、/g, " ✨ ");
  };

  const copyToClipboard = (text: string, section: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
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
                    return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{part}</a>;
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
      {/* 1. 標題與部落格封面 */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 shadow-sm">
              <h3 className="text-rose-900 font-bold mb-4 flex items-center gap-2">
                 <span className="bg-rose-600 text-white text-[10px] px-2 py-0.5 rounded">標題建議</span>
              </h3>
              <div className="space-y-3">
                  {/* 核心修復：加入安全檢查與預設列表 */}
                  {[
                      { label: '直覺型', val: data.titleStrategies?.intuitive, key: 't1' },
                      { label: '懸念型', val: data.titleStrategies?.suspense, key: 't2' },
                      { label: '利益型', val: data.titleStrategies?.benefit, key: 't3' }
                  ].map(item => (
                      <div key={item.key} className="bg-white p-3 rounded-xl border border-rose-200 flex justify-between items-center group shadow-sm">
                          <p className="font-bold text-slate-800 text-sm">
                            {item.val ? formatEmojiContent(item.val) : <span className="text-slate-300 italic">尚未生成內容</span>}
                          </p>
                          {item.val && (
                            <button onClick={() => copyToClipboard(item.val || '', item.key)} className="ml-4 text-rose-400 group-hover:text-rose-600">
                               {copiedSection === item.key ? <CheckIcon/> : <CopyIcon/>}
                            </button>
                          )}
                      </div>
                  ))}
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
           <h3 className="text-slate-800 font-bold mb-3 flex items-center gap-2 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
              部落格封面指令 (Destination)
           </h3>
           <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300 relative group">
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{data.visualInstructions?.imagePrompt || "無提示詞數據"}</p>
              {data.visualInstructions?.imagePrompt && (
                <button 
                  onClick={() => copyToClipboard(data.visualInstructions?.imagePrompt || '', 'blog_hero')}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {copiedSection === 'blog_hero' ? <><CheckIcon/> 已複製</> : <><CopyIcon/> 複製封面提示詞</>}
                </button>
              )}
           </div>
           <p className="mt-3 text-[10px] text-slate-400">比例：16:9 適合方格子或 WordPress</p>
        </div>
      </div>

      {/* 2. Threads 引流串文 */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-sm">
         <div className="bg-black text-white px-5 py-3 flex justify-between items-center">
             <span className="font-black text-sm tracking-widest flex items-center gap-2">THREADS 引流串文</span>
             <button onClick={() => copyToClipboard(`${data.threadsPost?.hook}\n\n${data.threadsPost?.content}\n\n${data.threadsPost?.cta}`, 'threads')} className="text-xs font-bold bg-stone-800 px-3 py-1.5 rounded-full border border-stone-700">
                {copiedSection === 'threads' ? '已複製' : '一鍵複製內容'}
             </button>
         </div>
         <div className="p-6 text-sm leading-relaxed whitespace-pre-wrap">
            <div className="font-bold mb-2 text-indigo-600">{formatEmojiContent(data.threadsPost?.hook)}</div>
            <div className="text-slate-800 mb-4">{formatEmojiContent(data.threadsPost?.content)}</div>
            <div className="bg-indigo-50 p-3 rounded-lg border-l-4 border-indigo-500 text-indigo-900 font-bold">
               {formatEmojiContent(data.threadsPost?.cta)}
            </div>
            <div className="mt-4 text-xs text-stone-400">{data.threadsPost?.tags}</div>
         </div>
      </div>

      {/* 3. IG 引流視覺套餐 */}
      <div className="bg-white border border-purple-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-400 px-5 py-3 text-white flex justify-between items-center">
              <span className="font-black text-sm tracking-widest uppercase">Instagram 引流全套餐</span>
              <button onClick={() => copyToClipboard(data.content?.instagramCaption || '', 'ig_full')} className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors">
                 {copiedSection === 'ig_full' ? '已複製文案' : '複製引流文案'}
              </button>
          </div>
          <div className="p-6 grid md:grid-cols-2 gap-8">
              {/* 文字文案區 */}
              <div className="space-y-4">
                  <div>
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">爆款導流文案</span>
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {formatEmojiContent(data.content?.instagramCaption || '')}
                      </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                      <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">視覺核心金句</span>
                      <p className="text-lg font-black text-slate-800 italic leading-snug">"{data.content?.instagramQuote}"</p>
                  </div>
              </div>

              {/* 圖片提示詞區 */}
              <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">引流視覺指令 (流量入口)</span>
                    <div className="flex gap-2">
                        <span className="bg-green-100 text-green-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">SEO Optimized Prompt</span>
                    </div>
                  </div>
                  
                  <div className="group relative bg-white p-4 rounded-2xl border-2 border-purple-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-purple-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            金句引流圖 (Feed)
                          </span>
                          <span className="text-[10px] font-black bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">1:1 SQUARE</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-3 line-clamp-3 italic leading-relaxed">{data.visualInstructions?.quoteImagePrompt}</p>
                      <button onClick={() => copyToClipboard(data.visualInstructions?.quoteImagePrompt || '', 'ig_sq')} className="w-full py-2 bg-purple-600 text-white rounded-lg text-[11px] font-bold hover:bg-purple-700 transition-all shadow-md">
                          {copiedSection === 'ig_sq' ? '已複製' : '複製 1:1 提示詞'}
                      </button>
                      <div className="mt-3 text-[9px] text-purple-400 font-bold bg-purple-50 p-2 rounded">💡 建議：生成的圖片底部已預留空間，可手動加上「閱讀更多請見 Bio 連結」字樣。</div>
                  </div>

                  <div className="group relative bg-white p-4 rounded-2xl border-2 border-pink-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-pink-700 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                            氛圍限動 (Story)
                          </span>
                          <span className="text-[10px] font-black bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">9:16 VERTICAL</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mb-3 line-clamp-3 italic leading-relaxed">{data.visualInstructions?.storyImagePrompt}</p>
                      <button onClick={() => copyToClipboard(data.visualInstructions?.storyImagePrompt || '', 'ig_st')} className="w-full py-2 bg-pink-600 text-white rounded-lg text-[11px] font-bold hover:bg-pink-700 transition-all shadow-md">
                          {copiedSection === 'ig_st' ? '已複製' : '複製 9:16 提示詞'}
                      </button>
                  </div>
              </div>
          </div>
      </div>

      {/* 4. 部落格深度正文 */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-2 h-6 bg-indigo-500 rounded-full"></div>
             <h3 className="font-bold text-slate-700">深度內容 (適合：方格子 / Medium / 自站)</h3>
          </div>
          <button onClick={() => copyToClipboard(data.content?.markdownBody || '', 'main_body')} className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold hover:bg-indigo-100 transition-colors">
             {copiedSection === 'main_body' ? '✓ 複製成功' : '一鍵複製全文'}
          </button>
        </div>
        <div className="p-8 prose prose-slate max-w-none">
          <div className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap text-slate-700 font-chinese">
             {renderWithLinksAndEmoji(data.content?.markdownBody)}
          </div>
          <div className="mt-10 p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-inner">
             <span className="block text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest">Call to Action (行動號召)</span>
             <p className="text-indigo-900 font-bold text-lg">{formatEmojiContent(data.content?.callToAction || '')}</p>
          </div>
        </div>
      </div>

      {/* 5. 經營策略 */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 shadow-sm">
          <h3 className="text-amber-900 font-bold mb-5 text-sm flex items-center gap-2 uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            Growth Strategy 經營策略
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm group hover:border-amber-400 transition-colors">
                  <span className="text-[10px] font-bold text-amber-500 block mb-2 uppercase">留言互動導引</span>
                  <p className="text-xs text-slate-600 italic leading-relaxed">"{data.operatingSuggestions?.interactionQuestion}"</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm group hover:border-amber-400 transition-colors">
                  <span className="text-[10px] font-bold text-amber-600 block mb-2 uppercase">多平台導流小撇步</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{data.operatingSuggestions?.crossPromotionTip}</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default ChineseResult;
