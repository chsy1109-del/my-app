import React, { useState } from 'react';
import { X, Link as LinkIcon, Loader2 } from 'lucide-react';
// 주의: 실제 AI 서비스 파일 경로에 맞춰 수정해주세요. 없다면 임시 함수를 사용하세요.
// import { extractPlaceInfo } from '../services/geminiService'; 

export const AddPlaceModal = ({ day, onClose, onAdd }: any) => {
  // 입력값을 저장하는 상태입니다. 이 부분이 제대로 작동해야 타이핑이 됩니다.
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // 임시 로직: 실제 AI 연결 전까지는 입력한 텍스트 그대로 추가
    onAdd({ name: input, transport: '', cost: '', description: '' });
    setInput(''); // 입력창 비우기
    
    // --- 실제 AI 서비스 연결 시 주석 해제 ---
    // setLoading(true);
    // try {
    //   const extracted = await extractPlaceInfo(input);
    //   onAdd(extracted);
    // } catch (err) {
    //   onAdd({ name: input });
    // } finally {
    //   setLoading(false);
    // }
    // ------------------------------------
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-green-900/20 backdrop-blur-sm">
      {/* 1. 전체 창 테두리: 메탈릭 핑크 복구 (border-[#fbcfe8]) */}
      <div className="w-full max-w-md bg-white rounded-[3rem] border-[6px] border-[#fbcfe8] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-retro text-green-600 leading-none">NEW_RECORD</h3>
          <button onClick={onClose} className="text-pink-300 hover:text-pink-500 transition-colors">
            <X size={28} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-[10px] font-digital text-green-400 uppercase tracking-widest">
            Paste Google Maps link for auto-sync.
          </p>
          
          {/* 2. 입력창 테두리: 메탈릭 핑크 복구 & 입력 기능 정상화 */}
          <div className="relative">
            <input 
              autoFocus
              className="w-full bg-green-50/50 border-[3px] border-[#fbcfe8] py-5 px-6 rounded-2xl font-bubbly text-xl text-green-900 outline-none placeholder:text-green-200/50 focus:bg-white transition-all" 
              placeholder="Search or Link..." 
              value={input} // 상태 연결 (중요!)
              onChange={e => setInput(e.target.value)} // 입력 이벤트 연결 (중요!)
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-500 hover:bg-green-600 text-white font-black text-lg py-5 rounded-full flex items-center justify-center gap-3 border-4 border-white shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : <LinkIcon size={24} />}
            {loading ? 'ANALYZING...' : 'CAPTURE DATA'}
          </button>
        </form>
      </div>
    </div>
  );
};