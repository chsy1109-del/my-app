import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Trash2, CheckCircle, Circle, GripVertical, Sparkles, 
  Languages, Loader2, MapPin, Camera, Music, ExternalLink, X 
} from 'lucide-react';
import { Place } from '../types';
import { getQuickTip, translateText } from '../services/geminiService';

interface PlaceCardProps {
  place: Place;
  toggleVisited: (id: string) => void;
  updateMemo: (id: string, field: keyof Place, value: any) => void;
  removePlace: (id: string) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({ place, toggleVisited, updateMemo, removePlace }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: place.id });
  const [isExpanded, setIsExpanded] = useState(true); // 기본적으로 펼쳐진 상태 유지
  const [loadingTip, setLoadingTip] = useState(false);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto' };

  // AI 꿀팁 가져오기
  const handleGetTip = async (e: React.MouseEvent) => {
    e.stopPropagation(); setLoadingTip(true);
    try { 
      const tip = await getQuickTip(place.name); 
      updateMemo(place.id, 'description', `${place.description}\n\n💡 TIP: ${tip}`.trim()); 
    } finally { setLoadingTip(false); }
  };

  // 번역 기능
  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation(); setLoadingTranslate(true);
    try { 
      const translated = await translateText(place.description || ''); 
      updateMemo(place.id, 'description', translated); 
    } finally { setLoadingTranslate(false); }
  };

  return (
    <div ref={setNodeRef} style={style} className={`relative mb-8 rounded-[3rem] bg-white shadow-xl transition-all duration-300 border-[4px] border-white hover:border-[#fbcfe8] ${isDragging ? 'opacity-50 scale-95' : ''} ${place.visited ? 'grayscale opacity-40' : ''}`}>
      <div className="p-8">
        {/* 상단 컨트롤: 드래그 핸들 및 방문 체크 */}
        <div className="flex justify-between items-start mb-4">
          <div {...attributes} {...listeners} className="p-2 bg-pink-50 rounded-xl text-pink-200 cursor-grab hover:text-pink-400 transition-colors print-hide">
            <GripVertical size={16} />
          </div>
          <button onClick={() => toggleVisited(place.id)} className={`p-3 rounded-full transition-all ${place.visited ? 'bg-green-500 text-white' : 'bg-green-50 text-green-300 border-2 border-green-100 shadow-sm'}`}>
            {place.visited ? <CheckCircle size={18} /> : <Circle size={18} />}
          </button>
        </div>

        {/* 장소 헤더: "The Story of..." 필기체 디자인 복구 */}
        <div className="cursor-pointer group relative mb-6" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="font-script text-orange-400 text-2xl absolute -top-6 left-0 opacity-80">The Story of...</span>
          <span className="text-[8px] font-digital text-green-500 uppercase tracking-widest mt-2 block opacity-60">{place.category || 'LOCATION'}</span>
          <h3 className="text-3xl font-retro text-slate-800 group-hover:text-green-600 transition-colors mt-1 leading-tight">{place.name}</h3>
        </div>

        {isExpanded && (
          <div className="mt-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
            {/* 1. 추억 사진 섹션 (REEL) */}
            <div className="space-y-3">
              <div className="flex justify-between items-center px-1">
                <label className="text-[9px] font-digital text-green-600 uppercase tracking-[0.3em] font-bold">MEMORIES</label>
                <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-green-50 text-green-500 rounded-2xl hover:bg-green-100 shadow-sm print-hide transition-all"><Camera size={16} /></button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => updateMemo(place.id, 'photos', [...(place.photos || []), reader.result as string]);
                    reader.readAsDataURL(file);
                  }
                }} />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {place.photos?.map((photo, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-[1.5rem] overflow-hidden border-4 border-white shadow-md">
                    <img src={photo} className="w-full h-full object-cover" alt="Memory" />
                  </div>
                ))}
                {(!place.photos || place.photos.length === 0) && (
                  <div className="w-full h-20 border-4 border-dashed border-green-50 rounded-[1.5rem] flex items-center justify-center text-[10px] text-green-100 uppercase font-digital">Empty_Reel</div>
                )}
              </div>
            </div>

            {/* 2. 뮤직 링크 섹션 (PLAYLIST) */}
            <div className="bg-[#fce7f3]/30 p-4 rounded-[2rem] border-4 border-white shadow-sm space-y-2">
              <div className="flex items-center gap-2"><Music size={14} className="text-pink-400" /><label className="text-[9px] font-digital text-pink-400 uppercase tracking-widest font-bold">PLAYLIST LINK</label></div>
              <div className="flex gap-2 items-center bg-white/40 rounded-xl px-3 py-2 border border-pink-50">
                <input className="bg-transparent flex-1 outline-none font-bubbly text-pink-900 text-xs" value={place.musicLink || ''} onChange={(e) => updateMemo(place.id, 'musicLink', e.target.value)} placeholder="Apple Music / Melon URL..." />
                {place.musicLink && <a href={place.musicLink} target="_blank" rel="noreferrer" className="text-pink-400 hover:scale-110 transition-transform"><ExternalLink size={14} /></a>}
              </div>
            </div>

            {/* 3. 상세 정보 그리드: 가는길(ROUTE) & 비용(COST) 복구 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#dcfce7]/40 p-5 rounded-[2.5rem] border-4 border-white shadow-sm">
                <label className="text-[9px] font-digital text-green-700 uppercase tracking-widest block mb-2 font-bold">ROUTE</label>
                <input className="bg-transparent w-full outline-none font-bubbly text-green-900 text-xs border-b border-green-100 focus:border-green-400 transition-colors" value={place.transport || ''} onChange={(e) => updateMemo(place.id, 'transport', e.target.value)} placeholder="How to get there..." />
              </div>
              <div className="bg-[#ffedd5]/40 p-5 rounded-[2.5rem] border-4 border-white shadow-sm">
                <label className="text-[9px] font-digital text-orange-700 uppercase tracking-widest block mb-2 font-bold">COST</label>
                <input className="bg-transparent w-full outline-none font-bubbly text-orange-900 text-xs border-b border-orange-100 focus:border-orange-400 transition-colors" value={place.cost || ''} onChange={(e) => updateMemo(place.id, 'cost', e.target.value)} placeholder="Ticket / Food price..." />
              </div>
            </div>

            {/* 4. 메모 텍스트 섹션: 분홍색 메탈 테두리 적용 (border-[#fbcfe8]) */}
            <div className="bg-white p-6 rounded-[2.5rem] border-[3px] border-[#fbcfe8] relative shadow-inner group-focus-within:shadow-md transition-shadow">
               <textarea 
                 className="bg-transparent w-full outline-none text-slate-600 leading-relaxed font-bubbly text-sm resize-none placeholder:text-slate-300" 
                 rows={4} 
                 value={place.description || ''} 
                 onChange={(e) => updateMemo(place.id, 'description', e.target.value)} 
                 placeholder="Leave your fragments of time here..." 
               />
               <div className="flex gap-3 absolute bottom-3 right-5 print-hide">
                  <button onClick={handleTranslate} className="text-pink-200 hover:text-green-500 hover:scale-110 transition-all">{loadingTranslate ? <Loader2 size={12} className="animate-spin" /> : <Languages size={14} />}</button>
                  <button onClick={handleGetTip} className="text-pink-200 hover:text-orange-500 hover:scale-110 transition-all">{loadingTip ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={14} />}</button>
               </div>
            </div>

            {/* 하단 바: 구글맵 연동 및 삭제 */}
            <div className="flex justify-between items-center pt-5 border-t-2 border-[#fbcfe8]/30">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} target="_blank" rel="noreferrer" className="text-green-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:text-green-700 transition-colors"><MapPin size={12} /> MAP_SYNC</a>
              <button onClick={() => removePlace(place.id)} className="text-pink-100 hover:text-red-400 transition-colors print-hide"><Trash2 size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;