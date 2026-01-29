import React, { useState } from 'react';
import { Music, MapPin, ExternalLink, Trash2 } from 'lucide-react';

export const PlaceCard = ({ place }: any) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[3rem] p-8 border-4 border-white shadow-xl transition-all">
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
        <span className="font-script text-orange-400 text-xl block -mb-2">The Story of...</span>
        <h3 className="text-3xl font-retro text-slate-800 leading-tight">{place.name}</h3>
      </div>

      {isExpanded && (
        <div className="mt-8 space-y-6 animate-in fade-in duration-500">
          {/* 장소 정보 그리드: Route & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-3xl border-2 border-white">
              <label className="text-[8px] font-digital text-green-600 uppercase block mb-1">Route</label>
              <div className="text-xs font-bold">{place.transport || 'Directly connected'}</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-3xl border-2 border-white">
              <label className="text-[8px] font-digital text-orange-600 uppercase block mb-1">Cost</label>
              <div className="text-xs font-bold">{place.cost || 'Free admission'}</div>
            </div>
          </div>

          {/* 뮤직 섹션 */}
          <div className="bg-pink-50 p-4 rounded-3xl border-2 border-white flex items-center gap-3">
            <Music size={16} className="text-pink-400" />
            <span className="text-[10px] flex-1 truncate font-digital">{place.musicLink || 'Apple Music / Melon URL...'}</span>
          </div>

          {/* 메모 섹션 */}
          <div className="bg-white border-2 border-[#fbcfe8] p-6 rounded-[2rem] text-xs leading-relaxed text-slate-600 italic">
            {place.description || 'Add your memories here...'}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-[#fbcfe8]">
            <button className="text-[8px] font-black text-green-600 flex items-center gap-1 uppercase tracking-widest"><MapPin size={10}/> Map Sync</button>
            <button className="text-pink-200 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};