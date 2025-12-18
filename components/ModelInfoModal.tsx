
import React from 'react';
import { MODELS } from '../services/geminiService';

interface ModelInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModelInfoModal: React.FC<ModelInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const comparisonData = [
    {
      id: MODELS.PRO_3,
      name: 'Gemini 3 Pro',
      label: 'Preview (巔峰推理)',
      speed: '🚀🚀🚀',
      reasoning: '⭐⭐⭐⭐⭐',
      stability: '💎💎',
      bestFor: '需要最強大的邏輯推理、長篇深度文章與專業洞察。',
      style: 'text-rose-600 bg-rose-50'
    },
    {
      id: MODELS.FLASH_3,
      name: 'Gemini 3 Flash',
      label: 'Stable (穩定極速)',
      speed: '🚀🚀🚀🚀🚀',
      reasoning: '⭐⭐⭐',
      stability: '💎💎💎💎💎',
      bestFor: '追求快速生成、結合 Google Search 熱搜時事。',
      style: 'text-indigo-600 bg-indigo-50'
    },
    {
      id: MODELS.FLASH_2_5,
      name: 'Gemini 2.5 Flash',
      label: 'Enhanced (增強穩定)',
      speed: '🚀🚀🚀🚀',
      reasoning: '⭐⭐⭐⭐',
      stability: '💎💎💎💎',
      bestFor: '長文本處理、雙語轉換最自然、長度控制極佳。',
      style: 'text-blue-600 bg-blue-50'
    },
    {
      id: MODELS.FLASH_2_0,
      name: 'Gemini 2.0 Flash',
      label: 'Exp (經典平衡)',
      speed: '🚀🚀🚀🚀🚀',
      reasoning: '⭐⭐⭐',
      stability: '💎💎💎',
      bestFor: '經典的 2.0 版本，反應極快，適合一般日常內容。',
      style: 'text-cyan-600 bg-cyan-50'
    },
    {
      id: MODELS.LITE_2_5,
      name: 'Gemini Flash Lite',
      label: 'Lite (高效輕量)',
      speed: '🚀🚀🚀🚀🚀',
      reasoning: '⭐⭐',
      stability: '💎💎💎💎💎',
      bestFor: '簡單摘要任務、基礎翻譯與低功耗生成。',
      style: 'text-emerald-600 bg-emerald-50'
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h3 className="text-lg font-bold text-slate-800">引擎版本詳細對比</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-stone-100">
                    <th className="pb-3 font-bold">版本</th>
                    <th className="pb-3 font-bold">反應速度</th>
                    <th className="pb-3 font-bold">推理深度</th>
                    <th className="pb-3 font-bold">穩定度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {comparisonData.map((m) => (
                    <tr key={m.id} className="text-sm">
                      <td className="py-4 pr-4">
                        <div className="font-bold text-slate-800">{m.name}</div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${m.style}`}>{m.label}</span>
                      </td>
                      <td className="py-4 text-xs">{m.speed}</td>
                      <td className="py-4 text-xs">{m.reasoning}</td>
                      <td className="py-4 text-xs">{m.stability}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">使用建議 (Recommendations)</h4>
              {comparisonData.map((m) => (
                <div key={m.id} className="flex gap-3 items-start p-3 rounded-xl border border-stone-100 hover:border-indigo-100 transition-colors">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      m.id === MODELS.FLASH_3 ? 'bg-indigo-500' : 
                      m.id === MODELS.LITE_2_5 ? 'bg-emerald-500' : 
                      m.id === MODELS.FLASH_2_5 ? 'bg-blue-500' : 
                      m.id === MODELS.FLASH_2_0 ? 'bg-cyan-500' : 'bg-rose-500'
                  }`}></div>
                  <div>
                    <span className="text-sm font-bold text-slate-800">{m.name}：</span>
                    <span className="text-sm text-slate-600">{m.bestFor}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
              <span className="text-xl">💡</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>小提示：</strong> 選擇引擎時請考慮素材長度。長篇技術文章建議使用 3 PRO 或 2.5 Flash；日常熱搜新聞則適合 3 FLASH 或 2.0 FLASH。
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm"
          >
            我瞭解了
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelInfoModal;
