
import React from 'react';
import { 
  SortableContext, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { Plus, Sparkles, Loader2, Camera } from 'lucide-react';
import { Place } from '../types';
import PlaceCard from './PlaceCard';

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
  dayNum, 
  places, 
  addPlace, 
  toggleVisited, 
  updateMemo, 
  removePlace,
  generateAI,
  isGenerating
}) => {
  const SortableContextAny = SortableContext as any;

  return (
    <div className="flex-none w-[380px] flex flex-col h-full rounded-[3rem] bg-white/40 backdrop-blur-md border-2 border-[#fbcfe8] shadow-xl relative pt-10 print:border-none print:shadow-none print:bg-transparent">
      <div className="absolute top-4 left-10 text-[8px] font-digital text-green-300 tracking-[0.4em] uppercase print:hidden">TIMELINE_LOG</div>
      <div className="absolute top-4 right-10 text-[8px] font-digital text-green-300 tracking-[0.4em] uppercase print:hidden">REEL_{dayNum}</div>
      
      <div className="p-10 pb-6 flex items-center justify-between relative">
        <div className="relative">
          <span className="font-script text-orange-400 text-2xl absolute -top-8 -left-3 -rotate-6 opacity-60">Lucky</span>
          <h2 className="text-6xl font-retro text-green-600 leading-none">D{dayNum}</h2>
        </div>
        <div className="flex gap-3 print:hidden">
           <button 
            onClick={() => generateAI(dayNum)} 
            disabled={isGenerating}
            className="w-10 h-10 bg-white text-orange-400 hover:text-orange-600 rounded-2xl flex items-center justify-center shadow-lg border border-white transition-all hover:scale-110"
          >
            {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          </button>
          <button 
            onClick={() => addPlace(dayNum)} 
            className="w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:bg-green-600 shadow-lg transition-all hover:scale-110 border border-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="px-6 py-2 flex-1 overflow-y-auto custom-scrollbar print:overflow-visible">
        {places.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-white rounded-[2rem] text-green-200 print:hidden">
            <Camera size={32} className="mb-3 opacity-50" />
            <p className="font-retro text-lg uppercase tracking-widest">NO_REEL_DATA</p>
          </div>
        ) : (
          <SortableContextAny items={places.map(p => p.id)} strategy={verticalListSortingStrategy}>
            {places.map(place => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                toggleVisited={toggleVisited} 
                updateMemo={updateMemo}
                removePlace={removePlace}
              />
            ))}
          </SortableContextAny>
        )}
      </div>
    </div>
  );
};

export default DayColumn;
