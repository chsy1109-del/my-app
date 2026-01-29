import React from 'react';
import { Trash2, MapPin, CheckCircle, Circle, Coins, MessageSquare } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function PlaceCard({ place, toggleVisited, updateMemo, removePlace }: any) {
  // 드래그 앤 드롭을 위한 설정
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: place.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white/60 backdrop-blur-sm rounded-[2rem] border-[4px] transition-all duration-300 ${
        place.visited ? 'border-green-400 shadow-none opacity-80' : 'border-[#fbcfe8] shadow-lg hover:shadow-pink-100'
      }`}
    >
      {/* 상단: 장소 이름 및 체크 버튼 */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0" {...attributes} {...listeners}>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={14} className="text-pink-400" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-pink-300">LOCATION ARCHIVE</span>
            </div>
            <h3 className="text-2xl font-black italic text-green-700 leading-none truncate uppercase tracking-tighter">
              {place.name}
            </h3>
          </div>
          <button 
            onClick={() => toggleVisited(place.id)}
            className={`mt-1 transition-colors ${place.visited ? 'text-green-500' : 'text-pink-200 hover:text-pink-400'}`}
          >
            {place.visited ? <CheckCircle size={32} weight="fill" /> : <Circle size={32} />}
          </button>
        </div>

        {/* 입력 영역: 비용 및 메모 */}
        <div className="space-y-3">
          {/* 비용 입력: 여기에 '1750 yen' 등을 적으면 영수증에 합산됩니다 */}
          <div className="flex items-center gap-3 bg-white/50 rounded-full px-4 py-2 border-2 border-[#fbcfe8]/30">
            <Coins size={14} className="text-orange-400" />
            <input
              placeholder="COST (e.g. 1750 yen)"
              className="bg-transparent text-xs font-bold outline-none w-full text-zinc-600 uppercase"
              value={place.cost || ''}
              onChange={(e) => updateMemo(place.id, 'cost', e.target.value)}
            />
          </div>

          <div className="flex items-start gap-3 bg-white/50 rounded-2xl px-4 py-3 border-2 border-[#fbcfe8]/30">
            <MessageSquare size={14} className="text-green-400 mt-1" />
            <textarea
              placeholder="ADD MEMORIES..."
              className="bg-transparent text-xs font-bold outline-none w-full h-16 resize-none text-zinc-500 leading-relaxed"
              value={place.description || ''}
              onChange={(e) => updateMemo(place.id, 'description', e.target.value)}
            />
          </div>
        </div>

        {/* 하단: 삭제 버튼 */}
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => removePlace(place.id)}
            className="p-2 text-zinc-300 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}