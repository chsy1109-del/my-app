import React, { useState } from 'react';
import { Music, MapPin, Trash2, ExternalLink } from 'lucide-react';

export const PlaceCard = ({ place }: any) => {
  // 기본적으로 펼쳐진 상태로 시작 (원하시면 false로 변경)
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    // 가장 바깥 테두리는 흰색입니다 (이미지 기준)
    <div className="bg-white rounded-[3rem] p-8 border-[4px] border-white shadow-xl transition-all relative overflow-hidden group hover:border-[#fbcfe8]">
      
      {/* 클릭하면 접었다 폈다 할 수 있는 헤더 */}
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer relative z-10">
        <span className="font-script text-orange-400 text-2xl block -mb-3 opacity-80 relative -left-2">The Story of...</span>
        <h3 className="text-4xl font-retro text-slate-800 leading-tight break-words">{place.name}</h3>
      </div>

      {isExpanded && (
        <div className="mt-8 space-y-5 animate-in fade-in slide-in-from-top-2 duration-500 relative z-10">
          
          {/* Route & Cost: 흰색 테두리 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#dcfce7] p-5 rounded-[2rem] border-[3px] border-white shadow-sm">
              <label className="text-[9px] font-digital text-green-700 uppercase block mb-1 tracking-widest">Route</label>
              <div className="text-sm font-bubbly font-bold text-green-900">{place.transport || 'Direct access'}</div>
            </div>
            <div className="bg-[#ffedd5] p-5 rounded-[2rem] border-[3px] border-white shadow-sm">
              <label className="text-[9px] font-digital text-orange-700 uppercase block mb-1 tracking-widest">Cost</label>
              <div className="text-sm font-bubbly font-bold text-orange-900">{place.cost || 'Free entry'}</div>
            </div>
          </div>

          {/* Music: 흰색 테두리 */}
          <div className="bg-[#fce7f3] p-4 rounded-[2rem] border-[3px] border-white shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-400 shadow-sm">
               <Music size={18} />
            </div>
            <div className="flex-1 min-w-0">
                 <label className="text-[8px] font-digital text-pink-500 uppercase block tracking-widest">Soundtrack</label>
                 <div className="text-xs font-bubbly text-pink-900 truncate">{place.musicLink || 'No track linked'}</div>
            </div>
            {place.musicLink && <ExternalLink size={14} className="text-pink-400" />}
          </div>

          {/* Memo 박스: 여기만 핑크색 메탈 테두리! */}
          <div className="bg-white border-[3px] border-[#fbcfe8] p-6 rounded-[2.5rem] text-sm leading-relaxed text-slate-600 font-bubbly shadow-sm relative loading-dots relative">
            {place.description ? place.description : <span className="opacity-50 italic">No memories recorded yet...</span>}
             <div className="absolute bottom-2 right-4 text-[8px] font-digital text-[#fbcfe8] uppercase tracking-widest opacity-50">FRAGMENT_LOG</div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-between items-center pt-4 pl-2">
            <button className="text-[9px] font-black text-green-500/70 flex items-center gap-1 uppercase tracking-[0.2em] hover:text-green-600 transition-colors">
                <MapPin size={12}/> Map Sync
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-pink-200 hover:text-red-400 hover:bg-red-50 rounded-full transition-all">
                <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};