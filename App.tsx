import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Plane, ArrowRight, Share2 } from 'lucide-react';

import DayColumn from './components/DayColumn';
import { AddPlaceModal } from './components/AddPlaceModal';
import { CurrencyConverter } from './components/CurrencyConverter';
import { ReceiptModal } from './components/ReceiptModal';

export default function App() {
  const [places, setPlaces] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [tempDest, setTempDest] = useState('');

  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'lucky-trip';

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "trips", tripId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlaces(data.places || []);
        if (data.meta) { setMeta(data.meta); setIsLaunched(true); }
      }
    });
    return () => unsub();
  }, [tripId]);

  const syncData = async (newPlaces: any, newMeta?: any) => {
    await setDoc(doc(db, "trips", tripId), { places: newPlaces, meta: newMeta || meta }, { merge: true });
  };

  // 1번 페이지 디자인 복구 (image_e1ada4.png)
  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel relative overflow-hidden" style={{backgroundColor: '#f7fee7'}}>
        <div className="absolute top-10 left-10 text-[8px] font-digital uppercase tracking-[0.5em] text-green-300 opacity-50 font-bold">STUDIO: ARKIV</div>
        <div className="absolute top-10 right-10 text-[8px] font-digital uppercase tracking-[0.5em] text-green-300 opacity-50 font-bold">ARCHIVE: v10.0</div>
        
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 text-center z-10">
          <div className="relative mb-8">
            <div className="script-overlay font-script" style={{position: 'absolute', top: '-2rem', left: '50%', transform: 'translateX(-50%) rotate(-10deg)', fontSize: '4rem', color: '#f97316', zIndex: 20}}>Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none">ARKIV</h1>
            <p className="text-orange-500 text-xs tracking-[1em] uppercase font-bubbly font-black -mt-4">MEMORIES ARCHIVE</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl bg-white/40 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <div className="w-44 h-44 rounded-[3rem] aircraft-icon-container flex items-center justify-center text-white animate-float flex-shrink-0" style={{background: 'linear-gradient(135deg, #84cc16 0%, #fbbf24 100%)'}}>
                <Plane size={80} />
             </div>
             <form onSubmit={e => { e.preventDefault(); const m = { destination: tempDest, duration: 3 }; setMeta(m); setIsLaunched(true); syncData(places, m); }} className="flex-1 space-y-8 text-left">
                <p className="font-bubbly text-green-600 text-sm uppercase tracking-widest leading-relaxed font-bold">FOR BOLD LOOKS, RETRO ROOTS. START YOUR LUCKY JOURNEY ARCHIVE BELOW.</p>
                <input required placeholder="TARGET DESTINATION..." className="w-full bg-white/60 border-b-4 border-green-200 py-4 px-6 rounded-full text-3xl font-retro outline-none focus:border-green-400 shadow-sm" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button className="bg-[#4ade80] text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-3 shadow-lg active:scale-95 uppercase tracking-widest">LAUNCH <ArrowRight /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-bubbly bg-clover-pixel" style={{backgroundColor: '#f7fee7'}}>
      <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-[100] glass-light border-b-[3px] border-[#fbcfe8]">
        <div className="flex items-center gap-8 cursor-pointer" onClick={() => setIsLaunched(false)}>
          <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
          <div className="border-l-2 border-[#fbcfe8] pl-8 font-retro text-orange-500 text-xl uppercase tracking-widest">{meta?.destination}</div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsCurrencyOpen(true)} className="px-6 py-2 bg-white text-green-600 rounded-full text-[10px] font-black border-2 border-[#fbcfe8] hover:bg-pink-50 transition-all">EXCHANGE</button>
          <button onClick={() => setShowReceipt(true)} className="px-6 py-2 bg-white text-pink-400 rounded-full text-[10px] font-black border-2 border-[#fbcfe8] hover:bg-pink-50 transition-all">RECEIPT</button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-pink-400 text-white font-black px-8 py-2 rounded-full text-[10px] border-2 border-white shadow-md flex items-center gap-2">SHARE <Share2 size={12} /></button>
        </div>
      </header>
      
      <main className="flex-1 overflow-x-auto p-12 flex items-start gap-12 custom-scrollbar">
        {[1, 2, 3].map(day => (
          <DayColumn key={day} dayNum={day} places={places.filter(p => p.day === day)} addPlace={(d: any) => setActiveDay(d)} toggleVisited={(id: any) => { const u = places.map(p => p.id === id ? {...p, visited: !p.visited} : p); setPlaces(u); syncData(u); }} updateMemo={(id: any, f: any, v: any) => { const u = places.map(p => p.id === id ? {...p, [f]: v} : p); setPlaces(u); syncData(u); }} removePlace={(id: any) => { const u = places.filter(p => p.id !== id); setPlaces(u); syncData(u); }} />
        ))}
      </main>

      <CurrencyConverter isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} />
      {showReceipt && <ReceiptModal places={places} onClose={() => setShowReceipt(false)} />}
      {activeDay && <AddPlaceModal isOpen={activeDay !== null} onClose={() => setActiveDay(null)} onAdd={(newP: any) => { const u = [...places, { ...newP, id: Date.now(), day: activeDay, photos: [], transport: '', cost: '', description: '' }]; setPlaces(u); syncData(u); setActiveDay(null); }} />}
    </div>
  );
}