import React from 'react';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Plus, Sparkles, Loader2, Camera } from 'lucide-react';
import { Place } from '../types';
import { PlaceCard } from './PlaceCard'; // 명시적 임포트 확인

interface DayColumnProps {
  dayNum: number;
  places: Place[];
  addPlace: (day: number) => void;
  toggleVisited: (id: string) => void;
  updateMemo: (id: string, field: keyof Place, value: any) => void;
  removePlace: (id: string) => void;
  generateAI: (day: number) => void;
  isGenerating: boolean;
}

const DayColumn: React.FC<DayColumnProps> = ({ 
  dayNum, places, addPlace, toggleVisited, updateMemo, removePlace, generateAI, isGenerating 
}) => {
  const SortableContextAny = SortableContext as any;

  return (
    // 1. 메탈릭 핑크 테두리 강화: border-4와 색상(#fbcfe8)을 확실하게 적용했습니다.
    <div className="flex-none w-[380px] flex flex-col h-full rounded-[4rem] bg-white/40 backdrop-blur-md border-[6px] border-[#fbcfe8] shadow-2xl relative pt-12 transition-all hover:shadow-pink-100/50 print:border-none print:shadow-none print:bg-transparent">
      
      {/* 2. 상단 디지털 로그 텍스트 복구 */}
      <div className="absolute top-6 left-12 text-[9px] font-digital text-green-300 tracking-[0.5em] uppercase opacity-60 print-hide">TIMELINE_LOG</div>
      <div className="absolute top-6 right-12 text-[9px] font-digital text-green-300 tracking-[0.5em] uppercase opacity-60 print-hide">REEL_{dayNum}</div>
      
      <div className="p-12 pb-8 flex items-center justify-between relative">
        <div className="relative">
          {/* 3. "Lucky" 필기체 오버레이 디자인 */}
          <span className="font-script text-orange-400 text-3xl absolute -top-10 -left-4 -rotate-6 drop-shadow-sm">Lucky</span>
          <h2 className="text-8xl font-retro text-green-600 leading-none italic uppercase tracking-tighter">D{dayNum}</h2>
        </div>
        
        {/* 4. 액션 버튼 영역 */}
        <div className="flex gap-4 print-hide">
           <button 
            onClick={() => generateAI(dayNum)} 
            disabled={isGenerating} 
            className="w-12 h-12 bg-white text-orange-400 hover:text-orange-600 rounded-[1.2rem] flex items-center justify-center shadow-lg border-2 border-white transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          </button>
          <button 
            onClick={() => addPlace(dayNum)} 
            className="w-14 h-14 bg-green-500 text-white rounded-[1.5rem] flex items-center justify-center hover:bg-green-600 shadow-xl transition-all hover:scale-110 active:scale-95 border-4 border-white"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* 5. 장소 카드 리스트 영역 */}
      <div className="px-8 py-4 flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
        {places.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center border-4 border-dashed border-white/60 rounded-[3rem] text-green-200/50 print-hide">
            <Camera size={48} className="mb-4 opacity-30" />
            <p className="font-retro text-xl uppercase tracking-[0.2em]">NO_REEL_DATA</p>
          </div>
        ) : (
          <SortableContextAny items={places.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-8">
              {places.map(place => (
                <PlaceCard 
                  key={place.id} 
                  place={place} 
                  toggleVisited={toggleVisited} 
                  updateMemo={updateMemo} 
                  removePlace={removePlace} 
                />
              ))}
            </div>
          </SortableContextAny>
        )}
      </div>
    </div>
  );
};

export default DayColumn;