
import React, { useState, useRef, useEffect } from 'react';
import { generateBilingualContent, MODELS } from './services/geminiService';
import { GeneratedArticle, HistoryItem } from './types';
import InputArea from './components/InputArea';
import EnglishResult from './components/EnglishResult';
import ChineseResult from './components/ChineseResult';
import ModelInfoModal from './components/ModelInfoModal';

const App: React.FC = () => {
  const [generatedData, setGeneratedData] = useState<GeneratedArticle | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'english' | 'chinese'>('chinese');
  const [selectedModel, setSelectedModel] = useState<string>(MODELS.FLASH_3);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentInputText, setCurrentInputText] = useState("");
  const [hasKey, setHasKey] = useState<boolean>(true); // 預設為 true 以避免 Flash 模型閃爍
  
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('gen_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // 檢查是否有選取 API Key
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleOpenKeySelector = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasKey(true); // 觸發後假設成功以進入應用
    }
  };

  const handleGenerate = async (text: string, style: string) => {
    // 如果是 Pro 模型且沒金鑰，先攔截
    if (selectedModel === MODELS.PRO_3 && !hasKey) {
      setError("使用 Pro 模型需要先選取付費 API 金鑰。");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedData(null);
    setCurrentInputText(text);

    try {
      const result = await generateBilingualContent(text, style, selectedModel);
      setGeneratedData(result);
      
      const newHistoryItem: HistoryItem = {
        id: Math.random().toString(36).substr(2, 9),
        title: result.chinese.titleStrategies.intuitive.replace(/[📌🚀]/g, '').slice(0, 25) + "...",
        timestamp: Date.now(),
        modelUsed: selectedModel,
        data: result
      };
      
      const updatedHistory = [newHistoryItem, ...history].slice(0, 15);
      setHistory(updatedHistory);
      localStorage.setItem('gen_history', JSON.stringify(updatedHistory));

      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 300);
    } catch (err: any) {
      // 處理實體未找到的錯誤 (通常與金鑰無效有關)
      if (err.message && err.message.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("API 金鑰驗證失敗，請重新選取有效的付費專案金鑰。");
      } else {
        setError(err.message || "內容生成發生異常。");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromHistory = (item: HistoryItem) => {
    setGeneratedData(item.data);
    setCurrentInputText(item.data.metadata?.originalInput || "");
    setIsHistoryOpen(false);
    setActiveTab('chinese');
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const modelOptions = [
    { id: MODELS.PRO_3, label: '3 PRO', color: 'text-rose-500' },
    { id: MODELS.FLASH_3, label: '3 FLASH', color: 'text-indigo-500' },
    { id: MODELS.FLASH_2_5, label: 'V2.5', color: 'text-blue-500' },
    { id: MODELS.FLASH_2_0, label: '2.0 FLASH', color: 'text-cyan-500' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F5] relative">
      <ModelInfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

      {/* API Key Required Overlay */}
      {!hasKey && (
        <div className="fixed inset-0 z-[100] bg-[#050A14]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-stone-100">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-3">需要選取 API 金鑰</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              為了確保 Pro 模型的高效運作，請選取一個已啟用結算的 Google Cloud 專案金鑰。
              <br/>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold underline">瞭解結算說明</a>
            </p>
            <button 
              onClick={handleOpenKeySelector}
              className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              選取付費 API 金鑰
            </button>
          </div>
        </div>
      )}

      {/* History Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[60] transform transition-transform duration-300 border-l border-stone-100 flex flex-col ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                生成紀錄
            </h3>
            <button onClick={() => setIsHistoryOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {history.length === 0 ? (
                <div className="text-center py-12 text-stone-400 text-sm">尚無生成歷史</div>
            ) : (
                history.map(item => (
                    <button key={item.id} onClick={() => loadFromHistory(item)} className="w-full text-left p-4 rounded-xl border border-stone-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                           <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{item.modelUsed.split('-')[1].toUpperCase()}</span>
                           <span className="text-[10px] text-stone-300">{new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-indigo-700">{item.title}</div>
                    </button>
                ))
            )}
        </div>
        <div className="p-4 border-t border-stone-100">
           <button onClick={() => { setHistory([]); localStorage.removeItem('gen_history'); }} className="w-full py-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">清除所有歷史</button>
        </div>
      </div>

      <header className="bg-[#050A14] py-4 px-4 sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg"><span className="text-white font-black text-xl">B</span></div>
                <h1 className="text-white font-bold hidden sm:block tracking-tight">雙語文章生成器 <span className="text-indigo-400 ml-1 opacity-60 text-xs">V2.1</span></h1>
            </div>
            
            <div className="bg-slate-900/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-800">
                {modelOptions.map((opt) => (
                    <button key={opt.id} onClick={() => setSelectedModel(opt.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedModel === opt.id ? 'bg-slate-800 text-white shadow-lg border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}>
                        {opt.label}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <button onClick={() => setIsHistoryOpen(true)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 hover:text-white transition-all relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {history.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>}
                </button>
                <button onClick={() => setIsInfoModalOpen(true)} className="p-2.5 bg-slate-800 text-slate-400 rounded-xl border border-slate-700 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
            </div>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        <InputArea 
            onGenerate={handleGenerate} 
            isLoading={loading} 
            currentModel={selectedModel} 
            onModelChange={setSelectedModel} 
            initialText={currentInputText} 
        />
        
        <div className="mt-10" ref={resultRef}>
          {error && <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-200 mb-6 flex gap-3 shadow-sm animate-bounce"><span className="text-xl">⚠️</span> {error}</div>}

          {generatedData && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border border-stone-200 shadow-sm gap-5">
                  <div className="flex bg-stone-100 p-1 rounded-xl w-full sm:w-auto">
                    <button onClick={() => setActiveTab('chinese')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'chinese' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-400'}`}>繁中 社群貼文</button>
                    <button onClick={() => setActiveTab('english')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'english' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}>英文 SEO 內容</button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[10px] font-black text-indigo-700 tracking-widest uppercase">
                            Generated by {generatedData.metadata?.modelUsed.replace('gemini-', '').toUpperCase()}
                        </span>
                     </div>
                     <span className="text-[10px] text-stone-400 font-bold">{new Date(generatedData.metadata?.timestamp || 0).toLocaleTimeString()}</span>
                  </div>
              </div>

              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {activeTab === 'english' ? <EnglishResult data={generatedData.english} /> : <ChineseResult data={generatedData.chinese} />}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <footer className="py-10 text-center border-t border-stone-200 mt-10">
         <p className="text-stone-400 text-xs font-bold tracking-widest uppercase">Powered by Gemini AI Engine & Search Grounding</p>
         <p className="text-stone-300 text-[10px] mt-2 italic">© 2025 Bilingual Content Architect V2.1</p>
      </footer>
    </div>
  );
};

export default App;
