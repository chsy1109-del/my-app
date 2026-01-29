import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, CheckCircle, Circle, GripVertical, Camera, Music, Languages } from 'lucide-react';

export const PlaceCard = ({ place, toggleVisited, updateMemo, removePlace }: any) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: place.id });
  const [isExpanded, setIsExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : 'auto' };

  const handlePhotoUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateMemo(place.id, 'photos', [...(place.photos || []), reader.result]);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white rounded-[3rem] p-6 shadow-xl border-8 border-white transition-all ${isDragging ? 'opacity-50' : ''} ${place.visited ? 'grayscale opacity-40' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div {...attributes} {...listeners} className="p-2 bg-green-50 rounded-xl text-green-300 cursor-grab hover:text-green-500"><GripVertical size={16} /></div>
        <button onClick={() => toggleVisited(place.id)} className={`p-3 rounded-full transition-all ${place.visited ? 'bg-green-500 text-white' : 'bg-green-50 text-green-300'}`}>
          {place.visited ? <CheckCircle size={18} /> : <Circle size={18} />}
        </button>
      </div>
      <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer">
        <span className="text-[9px] font-digital text-green-400 uppercase tracking-widest">{place.category || 'Location'}</span>
        <h3 className="text-3xl font-retro text-slate-800 leading-tight mt-1">{place.name}</h3>
      </div>
      {isExpanded && (
        <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex gap-3 overflow-x-auto pb-4">
            {place.photos?.map((photo: any, i: number) => <img key={i} src={photo} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md" />)}
            <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 bg-green-50 border-4 border-dashed border-green-200 rounded-2xl flex items-center justify-center text-green-300"><Camera size={24} /></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
          <div className="bg-pink-50/50 p-4 rounded-3xl border-4 border-white flex gap-3 items-center">
            <Music className="text-pink-400" size={16} />
            <input className="bg-transparent text-xs font-bubbly text-pink-900 outline-none flex-1" placeholder="Music Link..." value={place.musicLink || ''} onChange={e => updateMemo(place.id, 'musicLink', e.target.value)} />
          </div>
          <textarea className="w-full bg-white border-4 border-green-100 rounded-[2rem] p-4 text-sm font-bubbly outline-none focus:border-green-400" rows={3} value={place.description || ''} onChange={e => updateMemo(place.id, 'description', e.target.value)} placeholder="Fragments of time..." />
          <div className="flex justify-between">
             <button className="text-green-400"><Languages size={18} /></button>
             <button onClick={() => removePlace(place.id)} className="text-pink-200 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
          </div>
        </div>
      )}
    </div>
  );
};