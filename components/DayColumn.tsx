import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Sparkles } from 'lucide-react';
import { PlaceCard } from 'PlaceCard.tsx';

export default function DayColumn({ dayNum, places, addPlace, toggleVisited, updateMemo, removePlace }: any) {
  return (
    // border-[6px]와 border-[#fbcfe8]로 분홍색 라인을 확실하게 살렸습니다.
    <div className="flex-none w-[380px] flex flex-col h-full rounded-[4rem] bg-white/40 backdrop-blur-md border-[6px] border-[#fbcfe8] shadow-2xl relative pt-12">
      <div className="absolute top-6 left-12 text-[9px] font-digital text-green-300 tracking-[0.5em] uppercase opacity-60">REEL_{dayNum}</div>
      <div className="p-12 pb-8 flex items-center justify-between">
        <div className="relative">
          <span className="font-script text-orange-400 text-3xl absolute -top-10 -left-4 -rotate-6">Lucky</span>
          <h2 className="text-8xl font-retro text-green-600 leading-none italic uppercase tracking-tighter">D{dayNum}</h2>
        </div>
        <button onClick={() => addPlace(dayNum)} className="w-14 h-14 bg-green-500 text-white rounded-[1.5rem] flex items-center justify-center hover:scale-110 shadow-xl transition-all border-4 border-white"><Plus size={28} /></button>
      </div>
      <div className="px-8 py-4 flex-1 overflow-y-auto custom-scrollbar">
        <SortableContext items={places.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
            {places.map((place: any) => (
              <PlaceCard key={place.id} place={place} toggleVisited={toggleVisited} updateMemo={updateMemo} removePlace={removePlace} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}