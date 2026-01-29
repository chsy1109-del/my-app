import React, { useState } from 'react';
import { Music, MapPin, Trash2, Camera } from 'lucide-react';

export const PlaceCard = ({ place, toggleVisited, updateMemo, removePlace }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-[3rem] p-8 border-[4px] border-white shadow-xl transition-all mb-8">
      <div className="flex justify-between items-start mb-4">
        <button onClick={() => toggleVisited(place.id)} className={`p-3 rounded-full ${place.visited ? 'bg-green-500 text-white' : 'bg-green-50 text-green-300 border-2 border-green-100 shadow-sm'}`}>✓</button>
      </div>
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer mb-6 relative">
        <span className="font-script text-orange-400 text-2xl absolute -top-8 left-0 opacity-80">The Story of...</span>
        <h3 className="text-3xl font-retro text-slate-800 leading-tight mt-2">{place.name}</h3>
      </div>
      {isExpanded && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#dcfce7]/40 p-5 rounded-[2.5rem] border-4 border-white shadow-sm">
              <label className="text-[9px] font-digital text-green-700 uppercase block mb-2 font-bold tracking-widest">Route</label>
              <input className="w-full bg-transparent text-xs font-bold outline-none" value={place.transport || ''} onChange={(e) => updateMemo(place.id, 'transport', e.target.value)} placeholder="Direct access" />
            </div>
            <div className="bg-[#ffedd5]/40 p-5 rounded-[2.5rem] border-4 border-white shadow-sm">
              <label className="text-[9px] font-digital text-orange-700 uppercase block mb-2 font-bold tracking-widest">Cost</label>
              <input className="w-full bg-transparent text-xs font-bold outline-none font-digital" value={place.cost || ''} onChange={(e) => updateMemo(place.id, 'cost', e.target.value)} placeholder="100 yen / 5 usd" />
            </div>
          </div>
          <div className="bg-[#fce7f3]/40 p-4 rounded-[2rem] border-4 border-white shadow-sm flex items-center gap-4">
            <Music size={16} className="text-pink-400" />
            <input className="bg-transparent flex-1 text-xs font-digital outline-none" value={place.musicLink || ''} onChange={(e) => updateMemo(place.id, 'musicLink', e.target.value)} placeholder="Melon/Apple Music URL" />
          </div>
          <div className="bg-white border-[3px] border-[#fbcfe8] p-6 rounded-[2.5rem] shadow-inner">
             <textarea className="bg-transparent w-full outline-none text-sm font-bubbly text-slate-600 resize-none" rows={3} value={place.description || ''} onChange={(e) => updateMemo(place.id, 'description', e.target.value)} placeholder="Add your memories here..." />
          </div>
          <div className="flex justify-between items-center pt-2">
            <button className="text-[10px] font-black text-green-500 flex items-center gap-2 uppercase tracking-widest"><MapPin size={12}/> Map Sync</button>
            <button onClick={() => removePlace(place.id)} className="text-pink-100 hover:text-red-400 transition-colors"><Trash2 size={16} /></button>
          </div>
        </div>
      )}
    </div>
  );
};