
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
        setErrorMessage(`「${targetTopic}」目前搜尋不到相關新聞 JSON。但已為您找到參考網頁連結。`);
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 sm:p-7 flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start gap-4">
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
           <button onClick={() => setSearchModel(MODELS.FLASH_3)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${searchModel === MODELS.FLASH_3 ? 'bg-white text-indigo-600 shadow-sm' : 'text-stone-400'}`}>FLASH 3</button>
           <button onClick={() => setSearchModel(MODELS.FLASH_2_5)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${searchModel === MODELS.FLASH_2_5 ? 'bg-white text-blue-600 shadow-sm' : 'text-stone-400'}`}>V2.5</button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-6 space-y-4">
        <form onSubmit={(e) => { e.preventDefault(); if(manualSearchTerm.trim()) handleSearch(manualSearchTerm); }} className="relative">
          <input 
            type="text" 
            className="w-full pl-5 pr-32 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="搜尋最新話題素材..."
            value={manualSearchTerm}
            onChange={(e) => setManualSearchTerm(e.target.value)}
          />
          <button type="submit" disabled={isSearching} className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-indigo-600 text-white rounded-lg text-xs font-bold disabled:opacity-50">
            {isSearching ? '⏳' : '搜尋'}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
            {keywords.map(kw => (
              <button key={kw} onClick={() => handleSearch(kw)} disabled={isSearching} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${searchTopic === kw ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'}`}>
                {kw}
              </button>
            ))}
        </div>
      </div>

      {/* Results / Error Area */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 font-bold">
          ⚠️ 錯誤：{errorMessage}
          {errorMessage.includes("API_KEY") && <p className="mt-2 text-[10px] text-red-400">提示：如果您剛設定完變數，請在 Vercel 專案頁面點擊 "Redeploy"。</p>}
        </div>
      )}

      {(groundingSources.length > 0 || newsResults.length > 0) && (
        <div className="mb-6 bg-stone-50 rounded-xl p-4 border border-stone-100 max-h-[300px] overflow-y-auto custom-scrollbar">
          {groundingSources.length > 0 && (
            <div className="mb-4">
              <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">AI 參考來源網頁</span>
              <div className="flex flex-wrap gap-2">
                {groundingSources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="px-2 py-1 bg-white border border-stone-200 rounded text-[10px] text-indigo-600 hover:bg-indigo-50">
                    🔗 {s.title}
                  </a>
                ))}
              </div>
            </div>
          )}
          {newsResults.map((news, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-stone-200 last:border-0">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-700 line-clamp-1">{news.title}</div>
                <div className="text-[10px] text-stone-400">{news.source} • {news.time}</div>
              </div>
              <button onClick={() => handleSelectNews(news)} className="ml-4 px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-[10px] font-black text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                引用
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Text Area */}
      <div className="mt-4 flex flex-col gap-4">
        <div className="relative">
          <textarea 
            className="w-full min-h-[300px] p-5 bg-stone-50 border border-stone-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm leading-relaxed"
            placeholder="貼上新聞或輸入您的想法..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {showSavedToast && (
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">
              草稿已儲存
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <select 
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="w-full sm:w-auto p-3 bg-white border border-stone-200 rounded-xl text-sm"
          >
            <option value="professional">專業分析</option>
            <option value="storytelling">故事敘述</option>
            <option value="humorous">幽默風趣</option>
          </select>
          <button 
            onClick={() => onGenerate(text, selectedStyle)} 
            disabled={isLoading || !text.trim()} 
            className="w-full flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50"
          >
            {isLoading ? '✨ 正在生成中...' : '🪄 生成雙語內容套餐'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
