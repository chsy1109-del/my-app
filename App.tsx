import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent 
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Plane, ArrowRight, Download, Share2 } from 'lucide-react';

import { Place, TripMetadata } from './types';
import DayColumn from './components/DayColumn';
import { AddPlaceModal } from './components/AddPlaceModal';
import { CurrencyConverter } from './components/CurrencyConverter';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [meta, setMeta] = useState<TripMetadata | null>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [tempDest, setTempDest] = useState('');

  // 🔗 공유 기능: URL에 tripId가 있으면 협업 모드 (없으면 기본 fukuoka-trip)
  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'lucky-fukuoka-archive';

  useEffect(() => {
    // Firebase에서 실시간으로 데이터를 가져옵니다.
    const unsub = onSnapshot(doc(db, "trips", tripId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlaces(data.places || []);
        if (data.meta) {
          setMeta(data.meta);
          setIsLaunched(true); // 데이터가 있으면 두 번째 페이지로 바로 이동!
        }
      }
    });
    return () => unsub();
  }, [tripId]);

  const syncData = async (newPlaces: any, newMeta?: any) => {
    await setDoc(doc(db, "trips", tripId), { 
      places: newPlaces, 
      meta: newMeta || meta 
    }, { merge: true });
  };

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
      const final = updated.map(p => p.id === active.id ? { ...p, day: overItem?.day || p.day } : p);
      setPlaces(final);
      syncData(final);
    }
  };

  // 1. 오프닝 LAUNCH 페이지 복구
  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel">
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 z-10">
          <div className="relative mb-8 text-center">
            <div className="script-overlay font-script">Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none">ARKIV</h1>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl bg-white/60 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <div className="w-44 h-44 rounded-[3rem] aircraft-icon-container flex items-center justify-center text-white animate-float flex-shrink-0">
                <Plane size={80} />
             </div>
             <form onSubmit={e => { 
               e.preventDefault(); 
               const newMeta = { destination: tempDest, duration: 3 };
               setMeta(newMeta); setIsLaunched(true); syncData(places, newMeta);
             }} className="flex-1 space-y-8">
                <p className="font-bubbly text-green-600 text-lg uppercase">Start Your Lucky Journey Archive Below.</p>
                <input required placeholder="TARGET DESTINATION..." className="w-full bg-transparent border-b-4 border-green-200 py-4 text-3xl font-retro outline-none focus:border-green-400" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button className="bg-[#4ade80] text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-3 shadow-lg transition-all active:scale-95">LAUNCH <ArrowRight size={24} /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. 메인 대시보드 (두 번째 페이지)
  return (
    <div className="min-h-screen flex flex-col font-bubbly bg-clover-pixel">
      <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-[100] glass-light">
        <div className="flex items-center gap-8 cursor-pointer" onClick={() => setIsLaunched(false)}>
          <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
          <div className="border-l-2 border-[#fbcfe8] pl-8">
            <h1 className="text-xl font-retro text-orange-500 uppercase">{meta?.destination}</h1>
          </div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsCurrencyOpen(true)} className="px-6 py-2 bg-white text-green-600 rounded-full text-[10px] font-black border-2 border-[#fbcfe8]">EXCHANGE</button>
          <button onClick={() => setShowReceipt(true)} className="px-6 py-2 bg-white text-pink-400 rounded-full text-[10px] font-black border-2 border-[#fbcfe8]">RECEIPT</button>
          <button onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?tripId=${tripId}`);
            alert("공유 링크 복사 완료! 🍀");
          }} className="bg-pink-400 text-white font-black px-8 py-2 rounded-full text-[10px] shadow-md border-2 border-white flex items-center gap-2 shadow-sm"><Share2 size={14} /> SHARE +</button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto px-12 py-12 flex items-start gap-12 custom-scrollbar">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {Array.from({ length: meta?.duration || 3 }, (_, i) => i + 1).map((dayNum) => (
            <DayColumn 
              key={dayNum} dayNum={dayNum} places={places.filter(p => p.day === dayNum)}
              addPlace={(day: number) => setActiveDay(day)}
              toggleVisited={(id: string) => { const updated = places.map(p => p.id === id ? {...p, visited: !p.visited} : p); setPlaces(updated); syncData(updated); }}
              updateMemo={(id: string, f: any, v: any) => { const updated = places.map(p => p.id === id ? {...p, [f]: v} : p); setPlaces(updated); syncData(updated); }}
              removePlace={(id: string) => { const updated = places.filter(p => p.id !== id); setPlaces(updated); syncData(updated); }}
            />
          ))}
        </DndContext>
      </main>

      {activeDay && <AddPlaceModal day={activeDay} onClose={() => setActiveDay(null)} onAdd={(newP: any) => {
        const updated = [...places, { ...newP, id: `pl-${Date.now()}`, day: activeDay, photos: [], transport: '', cost: '', description: '' }];
        setPlaces(updated); syncData(updated); setActiveDay(null);
      }} />}
      
      <CurrencyConverter isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} />
      {showReceipt && <ReceiptModal places={places} homeCurrency="KRW" onClose={() => setShowReceipt(false)} />}
    </div>
  );
}