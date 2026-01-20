
import React, { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  Trash2, 
  CheckCircle, 
  Circle, 
  GripVertical, 
  Sparkles, 
  Languages, 
  Loader2, 
  MapPin,
  Camera,
  Music,
  ExternalLink,
  Plus,
  X
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingTip, setLoadingTip] = useState(false);
  const [loadingTranslate, setLoadingTranslate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
  };

  const handleGetTip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingTip(true);
    try {
      const tip = await getQuickTip(place.name);
      updateMemo(place.id, 'description', `${place.description}\n\n💡 TIP: ${tip}`.trim());
    } finally {
      setLoadingTip(false);
    }
  };

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingTranslate(true);
    try {
      const translated = await translateText(place.description);
      updateMemo(place.id, 'description', translated);
    } finally {
      setLoadingTranslate(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const currentPhotos = place.photos || [];
        updateMemo(place.id, 'photos', [...currentPhotos, base64String]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index: number) => {
    const currentPhotos = [...(place.photos || [])];
    currentPhotos.splice(index, 1);
    updateMemo(place.id, 'photos', currentPhotos);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative mb-6 rounded-[2rem] bg-white shadow-lg overflow-hidden transition-all duration-300 border border-white hover:border-[#fbcfe8] ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${place.visited ? 'grayscale opacity-40' : ''}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div {...attributes} {...listeners} className="p-1.5 bg-pink-50 rounded-md text-pink-300 cursor-grab hover:text-pink-500 transition-colors">
            <GripVertical size={14} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleVisited(place.id)} className={`p-2 rounded-full transition-all ${place.visited ? 'bg-green-500 text-white' : 'bg-green-50 text-green-300 hover:bg-green-100'} shadow-sm`}>
              {place.visited ? <CheckCircle size={14} /> : <Circle size={14} />}
            </button>
          </div>
        </div>

        <div className="cursor-pointer group relative" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="font-script text-orange-400 text-base absolute -top-5 left-0 opacity-70">The Story of...</span>
          <span className="text-[7px] font-digital text-green-500 uppercase tracking-widest mt-1 block">{place.category || 'LOCATION'}</span>
          <h3 className="text-xl font-retro text-slate-800 group-hover:text-green-600 transition-colors mt-0.5 leading-tight">{place.name}</h3>
        </div>

        {isExpanded && (
          <div className="mt-5 space-y-4 animate-in slide-in-from-top-4 duration-300">
            {/* Photos Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[8px] font-digital text-green-600 uppercase tracking-widest">MEMORIES</label>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <Camera size={12} />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handlePhotoUpload} 
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {place.photos?.map((photo, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-pink-100">
                    <img src={photo} className="w-full h-full object-cover" alt="Memory" />
                    <button 
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-0.5 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {(!place.photos || place.photos.length === 0) && (
                  <div className="w-full h-16 border border-dashed border-green-100 rounded-xl flex items-center justify-center text-[10px] text-green-200 uppercase font-digital">
                    Empty Reel
                  </div>
                )}
              </div>
            </div>

            {/* Music Section */}
            <div className="bg-pink-50/30 p-3 rounded-xl border border-white space-y-2">
              <div className="flex items-center gap-2">
                <Music size={12} className="text-pink-400" />
                <label className="text-[8px] font-digital text-pink-400 uppercase tracking-widest">PLAYLIST LINK</label>
              </div>
              <div className="flex gap-2">
                <input 
                  className="bg-transparent flex-1 outline-none font-bubbly text-pink-900 text-[10px]" 
                  value={place.musicLink || ''} 
                  onChange={(e) => updateMemo(place.id, 'musicLink', e.target.value)}
                  placeholder="Apple Music / Melon URL..."
                />
                {place.musicLink && (
                  <a href={place.musicLink} target="_blank" rel="noreferrer" className="text-pink-400">
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50/50 p-3 rounded-xl border border-white">
                <label className="text-[8px] font-digital text-green-600 uppercase tracking-widest block mb-1">ROUTE</label>
                <input className="bg-transparent w-full outline-none font-bubbly text-green-900 text-[10px]" value={place.transport || ''} onChange={(e) => updateMemo(place.id, 'transport', e.target.value)} />
              </div>
              <div className="bg-orange-50/50 p-3 rounded-xl border border-white">
                <label className="text-[8px] font-digital text-orange-600 uppercase tracking-widest block mb-1">COST</label>
                <input className="bg-transparent w-full outline-none font-bubbly text-orange-900 text-[10px]" value={place.cost || ''} onChange={(e) => updateMemo(place.id, 'cost', e.target.value)} />
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-[#fbcfe8] relative shadow-inner">
               <textarea className="bg-transparent w-full outline-none text-slate-500 leading-relaxed font-bubbly text-[10px] resize-none" rows={2} value={place.description || ''} onChange={(e) => updateMemo(place.id, 'description', e.target.value)} placeholder="..." />
               <div className="flex gap-2 absolute bottom-2 right-2">
                  <button onClick={handleTranslate} className="text-pink-200 hover:text-green-500">{loadingTranslate ? <Loader2 size={10} className="animate-spin" /> : <Languages size={12} />}</button>
                  <button onClick={handleGetTip} className="text-pink-200 hover:text-orange-500">{loadingTip ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={12} />}</button>
               </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[#fbcfe8]">
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`} target="_blank" className="text-green-600 text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                <MapPin size={10} /> MAP SYNC
              </a>
              <button onClick={() => removePlace(place.id)} className="text-pink-100 hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
