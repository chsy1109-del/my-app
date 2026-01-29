import React, { useState } from 'react';
import { Music, MapPin, Trash2, Camera } from 'lucide-react';

export const PlaceCard = ({ place, toggleVisited, updateMemo, removePlace }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-[3rem] p-8 border-4 border-white shadow-xl">
      <div className="flex justify-between items-start mb-4">
        <button onClick={() => toggleVisited(place.id)} className={`p-3 rounded-full ${place.visited ? 'bg-green-500 text-white' : 'bg-green-50 text-green-300 border-2 border-green-100 shadow-sm'}`}>✓</button>
      </div>
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer mb-6">
        <span className="font-script text-orange-400 text-2xl block -mb-2">The Story of...</span>
        <h3 className="text-3xl font-retro text-slate-800 leading-tight">{place.name}</h3>
      </div>
      {isExpanded && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-3xl border-2 border-white">
              <label className="text-[8px] font-digital text-green-600 uppercase block mb-1">Route</label>
              <input className="w-full bg-transparent text-xs font-bold outline-none" value={place.transport || ''} onChange={(e) => updateMemo(place.id, 'transport', e.target.value)} placeholder="Direct access" />
            </div>
            <div className="bg-orange-50 p-4 rounded-3xl border-2 border-white">
              <label className="text-[8px] font-digital text-orange-600 uppercase block mb-1">Cost</label>
              <input className="w-full bg-transparent text-xs font-bold outline-none" value={place.cost || ''} onChange={(e) => updateMemo(place.id, 'cost', e.target.value)} placeholder="Free entry" />
            </div>
          </div>
          <div className="bg-pink-50 p-4 rounded-3xl border-2 border-white flex items-center gap-3">
            <Music size={16} className="text-pink-400" />
            <input className="bg-transparent flex-1 text-xs font-digital outline-none" value={place.musicLink || ''} onChange={(e) => updateMemo(place.id, 'musicLink', e.target.value)} placeholder="Melon/Spotify URL" />
          </div>
          {/* 📝 메모 박스: 분홍색 메탈 테두리 적용 */}
          <div className="bg-white border-[3px] border-[#fbcfe8] p-6 rounded-[2rem] shadow-inner">
             <textarea className="bg-transparent w-full outline-none text-xs font-bubbly text-slate-600" rows={3} value={place.description || ''} onChange={(e) => updateMemo(place.id, 'description', e.target.value)} placeholder="Add your memories..." />
          </div>
          <div className="flex justify-between items-center"><button className="text-[9px] font-black text-green-500 flex items-center gap-2 uppercase"><MapPin size={12}/> Map Sync</button><button onClick={() => removePlace(place.id)} className="text-pink-100 hover:text-red-400"><Trash2 size={16} /></button></div>
        </div>
      )}
    </div>
  );
};