
import React, { useState, useCallback, useEffect } from 'react';
import { searchNews, getTrendingTopics, MODELS } from '../services/geminiService';
import { NewsItem } from '../types';

interface InputAreaProps {
  onGenerate: (text: string, style: string) => void;
  isLoading: boolean;
  currentModel: string;
  onModelChange: (model: string) => void;
  initialText?: string;
}

const ORIGINAL_KEYWORDS = [
  '職場心情', '安靜離職', '遠距工作', '台灣生活', '租屋補助', 
  '美食打卡', '心理健康', '自我成長', '科技趨勢', '台股盤勢', 
  '美股動態', 'AI 工具', '國際局勢', '健康醫療', '退休金', '勞保議題'
];

const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isLoading, initialText = "" }) => {
  const [text, setText] = useState(initialText);
  const [isSearching, setIsSearching] = useState(false);
  const [newsResults, setNewsResults] = useState<NewsItem[]>([]);
  const [groundingSources, setGroundingSources] = useState<{title: string, uri: string}[]>([]);
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualSearchTerm, setManualSearchTerm] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['隨機', ...ORIGINAL_KEYWORDS]);
  const [searchModel, setSearchModel] = useState<string>(MODELS.FLASH_3);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showClearedToast, setShowClearedToast] = useState(false);

  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('current_draft');
    if (savedDraft && !initialText) {
      setText(savedDraft);
    }
  }, [initialText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text && text !== initialText) {
        localStorage.setItem('current_draft', text);
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [text, initialText]);

  const handleSearch = useCallback(async (topic: string) => {
    if (isSearching) return;
    setIsSearching(true);
    setErrorMessage(null);
    setNewsResults([]);
    setGroundingSources([]);

    let targetTopic = topic;
    if (topic === '隨機') {
      try {
        const trends = await getTrendingTopics(searchModel);
        if (trends && trends.length > 0) {
          const combined = Array.from(new Set([...trends, ...ORIGINAL_KEYWORDS]));
          const shuffled = combined.sort(() => Math.random() - 0.5);
          const newList = ['隨機', ...shuffled].slice(0, 20);
          setKeywords(newList);
          targetTopic = newList.find(k => k !== '隨機') || '科技趨勢';
        }
      } catch (e: any) {
        setErrorMessage(e.message || "熱搜獲取失敗。");
        targetTopic = keywords[1] === '隨機' ? keywords[2] : keywords[1];
      }
    }

    setSearchTopic(targetTopic);
    try {
      const { news, sources } = await searchNews(targetTopic, searchModel);
      if (news && news.length > 0) {
        setNewsResults(news);
        setGroundingSources(sources);
      } else {
        setErrorMessage(`「${targetTopic}」目前搜尋不到相關新聞數據，但已為您找到參考網頁連結。`);
        setGroundingSources(sources);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "搜尋失敗，請確認 API Key 是否正確設定並已重新部署。");
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, keywords, searchModel]);

  const handleSelectNews = (item: NewsItem) => {
    const formatted = `【引用新聞素材】\n標題: ${item.title}\n摘要: ${item.snippet}\n連結: ${item.link || '無'}\n時間: ${item.time}\n---\n\n`;
    setText(prev => formatted + prev);
  };

  const handleClear = () => {
    // 優化：僅清空輸入框文字與緩存，保留搜尋狀態與結果
    setText("");
    localStorage.removeItem('current_draft');
    
    setShowClearedToast(true);
    setTimeout(() => setShowClearedToast(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-7 flex flex-col relative overflow-hidden">
      {/* 頂部控制欄：素材中心 */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-stone-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            靈感與新聞素材中心
          </h2>
          <p className="text-sm text-slate-500">輸入關鍵字或點擊熱搜，獲取即時創作素材。</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl shrink-0">
           <button onClick={() => setSearchModel(MODELS.FLASH_3)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${searchModel === MODELS.FLASH_3 ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400'}`}>3 FLASH</button>
           <button onClick={() => setSearchModel(MODELS.FLASH_2_5)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${searchModel === MODELS.FLASH_2_5 ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}>V2.5</button>
           <button onClick={() => setSearchModel(MODELS.FLASH_2_0)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${searchModel === MODELS.FLASH_2_0 ? 'bg-white text-cyan-600 shadow-sm' : 'text-stone-400'}`}>2.0</button>
        </div>
      </div>

      {/* 搜尋組件 */}
      <div className="mb-6 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); if(manualSearchTerm.trim()) handleSearch(manualSearchTerm); }} className="relative">
          <input 
            type="text" 
            className="w-full pl-5 pr-32 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="搜尋最新話題素材..."
            value={manualSearchTerm}
            onChange={(e) => setManualSearchTerm(e.target.value)}
          />
          <button type="submit" disabled={isSearching} className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2">
            {isSearching ? <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div> : '搜尋'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <button key={kw} onClick={() => handleSearch(kw)} disabled={isSearching} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${searchTopic === kw ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 active:scale-95'}`}>
                {kw}
              </button>
            ))}
        </div>
      </div>

      {/* 搜尋結果顯示區 */}
      {isSearching && (
        <div className="mb-6 bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-4">
           {[1, 2].map(i => (
             <div key={i} className="flex justify-between items-center py-2 animate-pulse">
               <div className="flex-1 space-y-2">
                 <div className="h-4 bg-stone-200 rounded w-3/4"></div>
                 <div className="h-3 bg-stone-200 rounded w-1/2"></div>
               </div>
             </div>
           ))}
        </div>
      )}

      {/* Render news results if search is complete */}
      {!isSearching && newsResults.length > 0 && (
        <div className="mb-6 bg-stone-50 rounded-xl p-4 border border-stone-100 max-h-64 overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-center mb-3 px-2">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">搜尋到的素材結果</h3>
            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2 py-0.5 rounded">對象：{searchTopic}</span>
          </div>
          <div className="space-y-3">
            {newsResults.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm hover:border-indigo-300 transition-colors group">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.snippet}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md">{item.source}</span>
                      <span className="text-[10px] text-stone-400">{item.time}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSelectNews(item)}
                    className="shrink-0 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all active:scale-90"
                    title="引用至輸入框"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message with Grounding Sources if any */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-600 flex flex-col gap-2">
          <div className="flex items-center gap-2 font-bold">
            <span>⚠️</span> {errorMessage}
          </div>
          {groundingSources.length > 0 && (
            <div className="mt-2 pl-6 space-y-1">
              <p className="text-stone-500 font-bold mb-1 uppercase tracking-tighter">參考連結：</p>
              {groundingSources.map((source, idx) => (
                <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="block text-indigo-500 hover:underline truncate">
                  • {source.title}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 主要文字輸入區 */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        <div className="flex justify-between items-center mb-2 px-1">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">輸入您的創作素材或大綱</label>
          <div className="flex items-center gap-4">
             {showSavedToast && <span className="text-[10px] text-emerald-500 font-bold animate-pulse">✨ 已自動儲存</span>}
             {showClearedToast && <span className="text-[10px] text-rose-500 font-bold">🗑️ 已清空內容</span>}
             <button onClick={handleClear} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors">僅清空輸入框</button>
          </div>
        </div>
        <textarea 
          className="flex-1 w-full p-5 bg-stone-50 border border-stone-200 rounded-2xl text-sm sm:text-base outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none font-chinese leading-relaxed"
          placeholder="貼上剛才引用的新聞、您自己的草稿或任何關鍵想法。AI 將會為您生成包含 SEO 英文與社群中文的全套內容套餐..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* 底部按鈕區 */}
      <div className="mt-6 flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-stone-100">
        <div className="w-full sm:w-auto flex-1 flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 shrink-0">生成風格:</span>
          <div className="flex bg-stone-100 p-1 rounded-xl w-full">
            {[
              { id: 'professional', label: '專業嚴謹' },
              { id: 'creative', label: '爆款創意' },
              { id: 'storytelling', label: '敘事共鳴' }
            ].map(style => (
              <button 
                key={style.id} 
                onClick={() => setSelectedStyle(style.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${selectedStyle === style.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400'}`}
              >
                {style.label}
              </button>
            ))}
          </div>
        </div>
        <button 
          onClick={() => onGenerate(text, selectedStyle)}
          disabled={isLoading || !text.trim()}
          className={`w-full sm:w-auto px-12 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isLoading || !text.trim() ? 'bg-stone-300 shadow-none' : 'bg-indigo-600 shadow-indigo-100 hover:bg-indigo-700'}`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-3 border-white border-t-transparent rounded-full"></div>
              <span>生成中...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span>立即生成全套餐內容</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
