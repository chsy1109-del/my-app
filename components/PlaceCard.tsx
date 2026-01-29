import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, CheckCircle, Circle, GripVertical, Sparkles, Languages, Loader2, MapPin, Camera, Music, ExternalLink, X } from 'lucide-react';
import { getQuickTip, translateText } from '../services/geminiService';

export const PlaceCard = ({ place, toggleVisited, updateMemo, removePlace }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: place.id });
  const [isExpanded, setIsExpanded] = useState(true); // 항상 펼쳐진 상태로 복구
  const [loadingTip, setLoadingTip] = useState(false);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto' };

  return (
    <div ref={setNodeRef} style={style} className={`relative mb-8 rounded-[3rem] bg-white shadow-xl border-[4px] border-white hover:border-[#fbcfe8] transition-all ${isDragging ? 'opacity-50 scale-95' : ''} ${place.visited ? 'grayscale opacity-40' : ''}`}>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div {...attributes} {...listeners} className="p-2 bg-pink-50 rounded-xl text-pink-200 cursor-grab hover:text-pink-400 print-hide"><GripVertical size={16} /></div>
          <button onClick={() => toggleVisited(place.id)} className={`p-3 rounded-full transition-all ${place.visited ? 'bg-green-500 text-white' : 'bg-green-50 text-green-300 border-2 border-green-100 shadow-sm'}`}>
            {place.visited ? <CheckCircle size={18} /> : <Circle size={18} />}
          </button>
        </div>

        <div className="cursor-pointer mb-6" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="font-script text-orange-400 text-2xl absolute -top-6 left-6 opacity-80">The Story of...</span>
          <h3 className="text-3xl font-retro text-slate-800 leading-tight mt-2">{place.name}</h3>
        </div>

        {isExpanded && (
          <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
            {/* 📸 추억 사진 섹션 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center"><label className="text-[9px] font-digital text-green-600 uppercase tracking-widest font-bold">MEMORIES</label><button onClick={() => fileInputRef.current?.click()} className="p-2 bg-green-50 text-green-500 rounded-2xl hover:bg-green-100 print-hide"><Camera size={16} /></button></div>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {place.photos?.map((photo: any, i: number) => <img key={i} src={photo} className="w-24 h-24 rounded-[1.5rem] object-cover border-4 border-white shadow-md" />)}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e: any) => { const reader = new FileReader(); reader.onloadend = () => updateMemo(place.id, 'photos', [...(place.photos || []), reader.result]); reader.readAsDataURL(e.target.files[0]); }} />
              </div>
            </div>

            {/* 🎵 뮤직 링크 */}
            <div className="bg-[#fce7f3]/30 p-4 rounded-[2rem] border-4 border-white shadow-sm flex items-center gap-4">
              <Music size={14} className="text-pink-400" />
              <input className="bg-transparent flex-1 outline-none font-bubbly text-pink-900 text-xs" value={place.musicLink || ''} onChange={(e) => updateMemo(place.id, 'musicLink', e.target.value)} placeholder="Apple Music / Melon URL..." />
            </div>

            {/* 🛣️ 가는 길 & 비용 (이미지 2번 디자인 복구) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#dcfce7]/40 p-5 rounded-[2.5rem] border-4 border-white shadow-sm">
                <label className="text-[9px] font-digital text-green-700 uppercase tracking-widest block mb-2 font-bold">ROUTE</label>
                <input className="bg-transparent w-full outline-none font-bubbly text-green-900 text-xs" value={place.transport || ''} onChange={(e) => updateMemo(place.id, 'transport', e.target.value)} placeholder="How to get..." />
              </div>
              <div className="bg-[#ffedd5]/40 p-5 rounded-[2.5rem] border-4 border-white shadow-sm">
                <label className="text-[9px] font-digital text-orange-700 uppercase tracking-widest block mb-2 font-bold">COST</label>
                <input className="bg-transparent w-full outline-none font-bubbly text-orange-900 text-xs" value={place.cost || ''} onChange={(e) => updateMemo(place.id, 'cost', e.target.value)} placeholder="Price..." />
              </div>
            </div>

            {/* 📝 메모 박스 (분홍색 메탈 테두리 확실히 적용) */}
            <div className="bg-white p-6 rounded-[2.5rem] border-[3px] border-[#fbcfe8] relative shadow-inner">
               <textarea className="bg-transparent w-full outline-none text-slate-600 font-bubbly text-sm resize-none" rows={3} value={place.description || ''} onChange={(e) => updateMemo(place.id, 'description', e.target.value)} placeholder="Fragments of time..." />
               <div className="flex gap-3 absolute bottom-3 right-5 print-hide">
                  <button onClick={async (e) => { e.stopPropagation(); setLoadingTranslate(true); const t = await translateText(place.description); updateMemo(place.id, 'description', t); setLoadingTranslate(false); }} className="text-pink-200 hover:text-green-500">{loadingTranslate ? <Loader2 size={12} className="animate-spin" /> : <Languages size={14} />}</button>
                  <button onClick={async (e) => { e.stopPropagation(); setLoadingTip(true); const t = await getQuickTip(place.name); updateMemo(place.id, 'description', `${place.description}\n\n💡 TIP: ${t}`); setLoadingTip(false); }} className="text-pink-200 hover:text-orange-500">{loadingTip ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={14} />}</button>
               </div>
            </div>

            <div className="flex justify-between items-center pt-5 border-t-2 border-[#fbcfe8]/30">
              <a href={`https://www.google.com/maps/search/${encodeURIComponent(place.name)}`} target="_blank" rel="noreferrer" className="text-green-500 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><MapPin size={12} /> MAP_SYNC</a>
              <button onClick={() => removePlace(place.id)} className="text-pink-100 hover:text-red-400 print-hide"><Trash2 size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};