import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plane, ArrowRight, Download } from 'lucide-react';

import { Place, TripMetadata } from './types';
import DayColumn from './components/DayColumn';
import { ReceiptModal } from './components/ReceiptModal';
import { extractPlaceInfo } from './services/geminiService';

const STORAGE_KEY = 'arkiv_v10_storage';
const META_KEY = 'arkiv_v10_meta';

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [meta, setMeta] = useState<TripMetadata | null>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [tempDest, setTempDest] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedMeta = localStorage.getItem(META_KEY);
    if (saved) setPlaces(JSON.parse(saved));
    if (savedMeta) {
      setMeta(JSON.parse(savedMeta));
      setIsLaunched(true);
    }
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

  const updateMemo = (id: string, field: keyof Place, value: any) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel">
        <div className="w-full max-w-5xl flex flex-col items-center gap-8 z-10">
          <div className="relative mb-12">
            <div className="script-overlay font-script">Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none">ARKIV</h1>
            <p className="text-orange-500 text-xs tracking-[1em] uppercase font-bubbly font-black text-center -mt-2">MEMORIES ARCHIVE</p>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl bg-white/60 p-12 rounded-[4rem] border-8 border-white shadow-2xl">
             <div className="w-40 h-40 rounded-[2.5rem] aircraft-icon-container flex items-center justify-center text-white animate-float"><Plane size={60} /></div>
             <form onSubmit={e => { e.preventDefault(); setMeta({ destination: tempDest, duration: 3 }); setIsLaunched(true); }} className="flex-1 space-y-6">
                <input required placeholder="TARGET DESTINATION..." className="w-full bg-transparent border-b-4 border-green-200 py-4 text-3xl font-retro outline-none focus:border-green-400" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button className="bg-[#4ade80] hover:bg-green-500 text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-2 shadow-lg transition-all">LAUNCH <ArrowRight size={20} /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-bubbly bg-clover-pixel">
      <header className="px-10 py-5 flex items-center justify-between sticky top-0 z-[100] glass-light">
        <div className="flex items-center gap-8" onClick={() => setIsLaunched(false)}>
          <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
          <div className="border-l-2 border-green-200 pl-8"><h1 className="text-xl font-retro text-orange-500 uppercase">{meta?.destination}</h1></div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowReceipt(true)} className="px-6 py-2 border-2 border-green-500 text-green-500 rounded-full font-bold text-xs">RECEIPT</button>
          <button onClick={() => window.print()} className="bg-orange-400 text-white font-black px-8 py-2 rounded-full text-xs shadow-md flex items-center gap-2"><Download size={14} /> EXPORT</button>
        </div>
      </header>
      <main className="flex-1 overflow-x-auto px-12 py-12 flex items-start gap-12">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {Array.from({ length: meta?.duration || 0 }, (_, i) => i + 1).map(dayNum => (
            <DayColumn key={dayNum} dayNum={dayNum} places={places.filter(p => p.day === dayNum)} updateMemo={updateMemo} addPlace={(day) => setPlaces([...places, { id: `pl-${Date.now()}`, name: 'New Place', day, visited: false, category: 'POINT', photos: [] }])} removePlace={(id) => setPlaces(prev => prev.filter(p => p.id !== id))} toggleVisited={(id) => setPlaces(prev => prev.map(p => p.id === id ? {...p, visited: !p.visited} : p))} />
          ))}
        </DndContext>
      </main>
      {showReceipt && <ReceiptModal places={places} homeCurrency="KRW" onClose={() => setShowReceipt(false)} />}
    </div>
  );
}