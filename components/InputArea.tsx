
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

/**
 * InputArea Component
 * Handles search grounding for news and provides input area for article generation.
 */
const InputArea: React.FC<InputAreaProps> = ({ onGenerate, isLoading, currentModel, onModelChange, initialText = "" }) => {
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

  // Sync initialText with local state if it changes from history or external source
  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  // Load draft from local storage on mount if no initialText provided
  useEffect(() => {
    const savedDraft = localStorage.getItem('current_draft');
    if (savedDraft && !initialText) {
      setText(savedDraft);
    }
  }, [initialText]);

  // Auto-save draft logic with debounce effect
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

  // Handle news search using Gemini Search Grounding
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
        targetTopic = keywords[1];
      }
    }

    setSearchTopic(targetTopic);
    try {
      const { news, sources } = await searchNews(targetTopic, searchModel);
      if (news && news.length > 0) {
        setNewsResults(news);
        setGroundingSources(sources);
      } else {
        setErrorMessage(`「${targetTopic}」目前搜尋不到相關新聞 JSON。`);
        setGroundingSources(sources);
      }
    } catch (e: any) {
      setErrorMessage(e.message || "搜尋連線失敗，請檢查 API Key 設定。");
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, keywords, searchModel]);

  // Inject selected news snippet into the main text area
  const handleSelectNews = (item: NewsItem) => {
    const formatted = `【引用新聞素材】\n標題: ${item.title}\n摘要: ${item.snippet}\n連結: ${item.link || '無'}\n時間: ${item.time}\n---\n\n`;
    setText(prev => formatted + prev);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-7 flex flex-col relative overflow-hidden">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            靈感與新聞素材中心
          </h2>
          <p className="text-sm text-slate-500">透過手動關鍵字或熱搜話題，快速建立文章素材庫。</p>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-xl shrink-0 overflow-x-auto no-scrollbar">
           <span className="hidden lg:inline-flex items-center px-2 text-[10px] font-bold text-stone-400 uppercase mr-1">搜尋版本</span>
           <button onClick={() => setSearchModel(MODELS.FLASH_3)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${searchModel === MODELS.FLASH_3 ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>FLASH 3</button>
           <button onClick={() => setSearchModel(MODELS.FLASH_2_5)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${searchModel === MODELS.FLASH_2_5 ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>V2.5</button>
           <button onClick={() => setSearchModel(MODELS.FLASH_2_0)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${searchModel === MODELS.FLASH_2_0 ? 'bg-white text-cyan-600 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}>2.0 FLASH</button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <form 
          onSubmit={(e) => { e.preventDefault(); if(manualSearchTerm.trim()) handleSearch(manualSearchTerm); }}
          className="relative group"
        >
          <input 
            type="text" 
            className="w-full pl-5 pr-32 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-stone-300 shadow-inner transition-all group-hover:bg-white"
            placeholder="輸入您感興趣的關鍵字，如：2025 AI 趨勢..."
            value={manualSearchTerm}
            onChange={(e) => setManualSearchTerm(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={isSearching || !manualSearchTerm.trim()}
            className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {isSearching ? <span className="animate-spin text-lg">⏳</span> : '搜尋新聞'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
            <span className="text-xs font-bold text-stone-400 flex items-center gap-1 py-1.5 pr-1">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.307-.349-2.533-.967-3.588a1 1 0 00-1.75.367c-.03.105-.05.215-.06.329-.08.896-.752 1.617-1.56 1.97.101" clipRule="evenodd" /></svg>
               熱門話題
            </span>
            {keywords.map((kw, i) => (
              <button 
                key={i} 
                onClick={() => handleSearch(kw)}
                disabled={isSearching}
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-full text-xs transition-colors"
              >
                {kw}
              </button>
            ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <span>⚠️</span> {errorMessage}
        </div>
      )}

      {newsResults.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">搜尋結果：{searchTopic}</h3>
            {groundingSources.length > 0 && (
              <div className="flex gap-2">
                {groundingSources.slice(0, 3).map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 hover:underline">
                    [{idx + 1}] {source.title.slice(0, 10)}...
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {newsResults.map((item, i) => (
              <div key={i} className="p-3 border border-stone-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group" onClick={() => handleSelectNews(item)}>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600">{item.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{item.snippet}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] text-slate-400">{item.source} · {item.time}</span>
                  <span className="text-[9px] font-bold text-indigo-500 opacity-0 group-hover:opacity-100">點擊引用 +</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 mt-auto">
        <div className="flex justify-between items-end gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">文章素材內容</label>
              {showSavedToast && <span className="text-[10px] text-emerald-500 font-bold animate-pulse">已自動儲存草稿</span>}
            </div>
            <textarea 
              className="w-full h-40 p-4 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-stone-300 resize-none"
              placeholder="貼上新聞內容或輸入您的想法..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="w-40 shrink-0">
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">寫作風格</label>
             <select 
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full p-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
             >
                <option value="professional">專業知性</option>
                <option value="humorous">幽默風趣</option>
                <option value="empathetic">感性共鳴</option>
                <option value="analytical">深度分析</option>
             </select>
          </div>
        </div>

        <button 
          onClick={() => onGenerate(text, selectedStyle)}
          disabled={isLoading || !text.trim()}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="animate-spin text-xl">🌀</span>
              正在思考與生成雙語內容...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
              立即生成雙語社群全餐
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputArea;
