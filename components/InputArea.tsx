
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
  const [searchTopic, setSearchTopic] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualSearchTerm, setManualSearchTerm] = useState('');
  const [keywords, setKeywords] = useState<string[]>(['隨機', ...ORIGINAL_KEYWORDS]);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [searchModel, setSearchModel] = useState<string>(MODELS.FLASH_3);
  const [showSavedToast, setShowSavedToast] = useState(false);

  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  useEffect(() => {
    const savedDraft = localStorage.getItem('current_draft');
    if (savedDraft && !initialText) {
      setText(savedDraft);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text && text !== initialText) {
        localStorage.setItem('current_draft', text);
        setLastSaved(Date.now());
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [text]);

  const handleSaveManual = () => {
    localStorage.setItem('current_draft', text);
    setLastSaved(Date.now());
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  const handleSearch = useCallback(async (topic: string) => {
    if (isSearching) return;
    setIsSearching(true);
    setErrorMessage(null);
    setNewsResults([]);

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
      } catch (e) {
        targetTopic = keywords[1];
      }
    }

    setSearchTopic(targetTopic);
    try {
      const results = await searchNews(targetTopic, searchModel);
      if (results && results.length > 0) {
        setNewsResults(results);
      } else {
        setErrorMessage(`「${targetTopic}」目前搜尋不到相關新聞。`);
      }
    } catch (e) {
      setErrorMessage("搜尋服務目前連線不穩定，請稍後再試。");
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, keywords, searchModel]);

  const handleSelectNews = (item: NewsItem) => {
    const formatted = `【引用新聞素材】\n標題: ${item.title}\n摘要: ${item.snippet}\n連結: ${item.link || '無'}\n時間: ${item.time}\n---\n\n`;
    setText(prev => formatted + prev);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-7 flex flex-col relative overflow-hidden">
      {/* Header & Engine Toggle */}
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

      {/* Manual Search & Quick Keywords */}
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
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.307-.349-2.533-.967-3.588a1 1 0 00-1.75.367c-.03.105-.05.215-.06.329-.08.896-.752 1.617-1.56 1.97.101-1.098.1-2.285-.04-3.44-.148-1.212-.485-2.426-1.228-3.085z" clipRule="evenodd" /></svg>
               熱門主題:
            </span>
            {keywords.map(kw => (
              <button key={kw} onClick={() => handleSearch(kw)} disabled={isSearching} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${searchTopic === kw ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-indigo-300'}`}>
                {kw}
              </button>
            ))}
        </div>
        
        {/* News Results & Search Status */}
        <div className="relative min-h-[60px]">
          {isSearching && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-indigo-200 animate-pulse">
                <div className="flex items-center gap-3 text-indigo-600">
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase">正在以 {searchModel.includes('2.0') ? '2.0 FLASH' : searchModel.includes('2.5') ? 'V2.5' : 'FLASH 3'} 搜尋「{searchTopic}」中...</span>
                </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold mb-4 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
               {errorMessage}
            </div>
          )}

          {newsResults.length > 0 && !isSearching && (
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 space-y-3 max-h-56 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">搜尋結果：{searchTopic}</span>
                 <button onClick={() => setNewsResults([])} className="text-[10px] text-stone-300 hover:text-stone-500 font-bold">清除搜尋</button>
              </div>
              {newsResults.map((news, i) => (
                <div key={i} className="flex justify-between items-center gap-4 py-2 border-b border-stone-200 last:border-0 hover:bg-stone-100/50 rounded transition-colors px-1">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-slate-700 line-clamp-1 group-hover:text-indigo-600 transition-colors">{news.title}</div>
                    <div className="text-[10px] text-stone-400 mt-0.5">{news.source} • {news.time}</div>
                  </div>
                  <button 
                    onClick={() => handleSelectNews(news)} 
                    className="px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm shrink-0"
                  >
                    引用素材
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col gap-4 border-t border-stone-100 pt-6">
        <div className="relative group">
          <textarea 
            className="w-full min-h-[380px] p-6 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed shadow-inner transition-all group-hover:bg-white group-hover:border-stone-300"
            placeholder="請將原始新聞、想法或筆記貼在這裡... AI 將為您轉化為多平台內容！"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          {/* Saved Status Indicator */}
          <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white text-[10px] font-black shadow-xl transition-all duration-500 ${showSavedToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
             草稿已自動儲存
          </div>

          <button 
            onClick={handleSaveManual} 
            className="absolute bottom-4 right-4 p-3 bg-white border border-stone-200 rounded-2xl shadow-lg text-stone-400 hover:text-indigo-600 hover:border-indigo-300 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
            title="手動儲存草稿"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full lg:w-auto bg-stone-100/50 p-2 rounded-2xl border border-stone-200/50">
             <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest pl-2">寫作風格:</span>
             <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {[
                    { id: 'professional', label: '專業分析' },
                    { id: 'storytelling', label: '故事敘述' },
                    { id: 'humorous', label: '幽默風趣' },
                    { id: 'simple', label: '淺顯易懂' }
                ].map(style => (
                    <button 
                        key={style.id} 
                        onClick={() => setSelectedStyle(style.id)} 
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedStyle === style.id ? 'bg-white text-indigo-600 shadow-sm border border-stone-200' : 'text-stone-500 hover:text-stone-700'}`}
                    >
                        {style.label}
                    </button>
                ))}
             </div>
          </div>
          
          <button 
            onClick={() => onGenerate(text, selectedStyle)} 
            disabled={isLoading || !text.trim()} 
            className="w-full lg:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <><span className="animate-spin text-xl">✨</span> 正在生成雙語版本 2.1...</>
            ) : (
              <><span className="text-xl">🪄</span> 開始生成 雙語文章</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
