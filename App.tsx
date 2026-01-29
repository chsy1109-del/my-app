import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import DayColumn from './components/DayColumn';
import { AddPlaceModal } from './components/AddPlaceModal';
import { CurrencyConverter } from './components/CurrencyConverter';
import { ReceiptModal } from './components/ReceiptModal';
import { Plane, ArrowRight } from 'lucide-react';

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

  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel">
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 text-center">
          <div className="relative mb-8">
            <div className="script-overlay font-script" style={{ position: 'absolute', top: '-1.5rem', left: '0', fontSize: '2.5rem', color: '#f97316' }}>Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none">ARKIV</h1>
          </div>
          <div className="bg-white/60 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <form onSubmit={e => { e.preventDefault(); const m = { destination: tempDest, duration: 3 }; setMeta(m); setIsLaunched(true); syncData(places, m); }} className="space-y-8">
                <input required placeholder="TARGET DESTINATION..." className="w-full bg-transparent border-b-4 border-green-200 py-4 text-3xl font-retro outline-none" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button className="bg-[#4ade80] text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-3">LAUNCH <ArrowRight /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-bubbly bg-clover-pixel">
      <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-[100] glass-light border-b-[3px] border-[#fbcfe8]">
        <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
        <div className="flex gap-4">
          <button onClick={() => setIsCurrencyOpen(true)} className="px-6 py-2 bg-white text-green-600 rounded-full text-[10px] font-black border-2 border-[#fbcfe8]">EXCHANGE</button>
          <button onClick={() => setShowReceipt(true)} className="px-6 py-2 bg-white text-pink-400 rounded-full text-[10px] font-black border-2 border-[#fbcfe8]">RECEIPT</button>
        </div>
      </header>
      <main className="flex-1 overflow-x-auto p-12 flex items-start gap-12">
        {[1, 2, 3].map(day => (
          <DayColumn key={day} dayNum={day} places={places.filter(p => p.day === day)} addPlace={(d: any) => setActiveDay(d)} toggleVisited={(id: any) => { const u = places.map(p => p.id === id ? {...p, visited: !p.visited} : p); setPlaces(u); syncData(u); }} updateMemo={(id: any, f: any, v: any) => { const u = places.map(p => p.id === id ? {...p, [f]: v} : p); setPlaces(u); syncData(u); }} removePlace={(id: any) => { const u = places.filter(p => p.id !== id); setPlaces(u); syncData(u); }} />
        ))}
      </main>
      <AddPlaceModal isOpen={activeDay !== null} onClose={() => setActiveDay(null)} onAdd={(newP: any) => { const u = [...places, { ...newP, id: Date.now(), day: activeDay, photos: [], transport: '', cost: '', description: '' }]; setPlaces(u); syncData(u); setActiveDay(null); }} />
      <CurrencyConverter isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} />
      {showReceipt && <ReceiptModal places={places} homeCurrency="KRW" onClose={() => setShowReceipt(false)} />}
    </div>
  );
}