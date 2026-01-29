import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plane, Plus, X, Loader2, Coins, Link as LinkIcon, Download, ArrowRightLeft, ArrowRight } from 'lucide-react';

import { Place, TripMetadata } from './types';
import DayColumn from './components/DayColumn';
import { ReceiptModal } from './components/ReceiptModal'; // 영수증 컴포넌트 추가
import { generateItinerarySuggestions, getLiveExchangeRate, extractPlaceInfo } from './services/geminiService';

const STORAGE_KEY = 'arkiv_v10_storage';
const META_KEY = 'arkiv_v10_meta';

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [meta, setMeta] = useState<TripMetadata | null>(null);
  const [isGenerating, setIsGenerating] = useState<Record<number, boolean>>({});
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false); // 영수증 상태
  const [activeDayForAdd, setActiveDayForAdd] = useState<number | null>(null);
  const [tempDest, setTempDest] = useState('');
  const [tempDays, setTempDays] = useState(3);

  // 🔗 협업 기능: URL 파라미터 tripId가 있으면 해당 데이터를 우선시하도록 설정 가능
  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'lucky-default';

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedMeta = localStorage.getItem(META_KEY);
    if (saved) setPlaces(JSON.parse(saved));
    if (savedMeta) setMeta(JSON.parse(savedMeta));
  }, []);

  useEffect(() => {
    if (meta) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    }
  }, [places, meta]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = places.findIndex(i => i.id === active.id);
      const newIndex = places.findIndex(i => i.id === over.id);
      const overItem = places.find(i => i.id === over.id);
      const updated = arrayMove(places, oldIndex, newIndex);
      setPlaces(updated.map(p => p.id === active.id ? { ...p, day: overItem?.day || p.day } : p));
    }
  };

  const handleAddPlace = (day: number, data: Partial<Place>) => {
    const newPlace: Place = {
      id: `pl-${Date.now()}`,
      name: data.name || 'New Entry',
      day,
      visited: false,
      transport: '', cost: '', description: '',
      category: 'POINT', photos: [], musicLink: ''
    };
    setPlaces([...places, newPlace]);
  };

  // 1. 오프닝 LAUNCH 페이지 복구 (image_e4513a.png 디자인 적용)
  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-clover-pixel">
        <div className="w-full max-w-5xl flex flex-col items-center gap-8 z-10">
          <div className="relative mb-8 text-center">
            <div className="script-overlay font-script">Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none">ARKIV</h1>
            <p className="text-orange-500 text-xs tracking-[1em] uppercase font-bubbly font-black -mt-4">MEMORIES ARCHIVE</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl bg-white/60 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <div className="w-40 h-40 rounded-[2.5rem] aircraft-icon-container flex items-center justify-center text-white animate-float"><Plane size={60} /></div>
             <div className="flex-1 space-y-4">
                <p className="font-bubbly text-green-600 text-base max-w-xs uppercase">Start Your Lucky Journey Archive Below.</p>
                <form onSubmit={e => { e.preventDefault(); setMeta({ destination: tempDest, duration: tempDays }); }} className="space-y-4">
                  <input required placeholder="TARGET DESTINATION..." className="w-full bg-transparent border-b-4 border-green-200 py-4 text-3xl font-retro outline-none focus:border-green-400" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                  <button className="bg-[#4ade80] hover:bg-green-500 text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-2 shadow-lg transition-all">LAUNCH <ArrowRight size={20} /></button>
                </form>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-bubbly relative bg-clover-pixel">
      <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-[100] glass-light">
        <div className="flex items-center gap-8 cursor-pointer" onClick={() => setMeta(null)}>
          <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
          <div className="border-l-2 border-[#fbcfe8] pl-8">
            <span className="text-[8px] font-digital text-green-600 tracking-widest block uppercase">DATA REEL</span>
            <h1 className="text-xl font-retro text-orange-500 uppercase">{meta.destination}</h1>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsCurrencyOpen(true)} className="px-4 py-2 bg-white text-green-600 rounded-full text-[10px] font-black border-2 border-[#fbcfe8]">EXCHANGE</button>
          <button onClick={() => setShowReceipt(true)} className="px-4 py-2 bg-white text-pink-400 rounded-full text-[10px] font-black border-2 border-[#fbcfe8]">RECEIPT</button>
          <button onClick={() => window.print()} className="bg-orange-400 text-white font-black px-6 py-2 rounded-full text-[10px] shadow-md border-2 border-white"><Download size={12} /></button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto custom-scrollbar px-12 py-12 flex items-start gap-12">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {Array.from({ length: meta.duration }, (_, i) => i + 1).map((dayNum) => (
            <DayColumn key={dayNum} dayNum={dayNum} places={places.filter(p => p.day === dayNum)} addPlace={(day) => setActiveDayForAdd(day)} toggleVisited={(id) => setPlaces(places.map(p => p.id === id ? {...p, visited: !p.visited} : p))} updateMemo={(id, f, v) => setPlaces(places.map(p => p.id === id ? {...p, [f]: v} : p))} removePlace={(id) => setPlaces(places.filter(p => p.id !== id))} />
          ))}
          <button onClick={() => setMeta({ ...meta, duration: meta.duration + 1 })} className="flex-none w-16 h-80 bg-white/40 border-4 border-dashed border-[#fbcfe8] rounded-[3rem] flex items-center justify-center text-[#fbcfe8] hover:text-green-500 transition-colors"><Plus size={32} /></button>
        </DndContext>
      </main>

      <AddPlaceModal isOpen={activeDayForAdd !== null} onClose={() => setActiveDayForAdd(null)} onAdd={(data) => activeDayForAdd && handleAddPlace(activeDayForAdd, data)} />
      <CurrencyConverter isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} />
      {showReceipt && <ReceiptModal places={places} homeCurrency="KRW" onClose={() => setShowReceipt(false)} />}
    </div>
  );
}