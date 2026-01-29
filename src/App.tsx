import React, { useState, useEffect } from 'react';
import { db } from './services/firebase'; // ✅ 경로 수정
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Plane, ArrowRight, Share2, Plus, X } from 'lucide-react';
import DayColumn from './components/DayColumn'; // ✅ 경로 수정

export default function App() {
  const [places, setPlaces] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLaunched, setIsLaunched] = useState(false);
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

  const syncData = async (newP: any, newM?: any) => {
    await setDoc(doc(db, "trips", tripId), { places: newP, meta: newM || meta }, { merge: true });
  };

  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel" style={{backgroundColor: '#f7fee7'}}>
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 text-center z-10">
          <div className="relative mb-8">
            <div className="font-script text-orange-500 absolute -top-10 left-1/2 -translate-x-1/2 text-6xl" style={{fontFamily: 'Pacifico'}}>Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none">ARKIV</h1>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl bg-white/40 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <div className="w-44 h-44 rounded-[3rem] aircraft-icon-container flex items-center justify-center text-white flex-shrink-0" style={{background: 'linear-gradient(135deg, #84cc16 0%, #fbbf24 100%)'}}>
                <Plane size={80} />
             </div>
             <form onSubmit={e => { e.preventDefault(); const m = { destination: tempDest }; setMeta(m); setIsLaunched(true); syncData(places, m); }} className="flex-1 space-y-8 text-left">
                <input required placeholder="TARGET DESTINATION..." className="w-full bg-white/60 border-b-4 border-green-200 py-4 px-6 rounded-full text-3xl outline-none" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button className="bg-[#4ade80] text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-3 shadow-lg active:scale-95">LAUNCH <ArrowRight /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-clover-pixel" style={{backgroundColor: '#f7fee7'}}>
      <header className="px-10 py-6 flex items-center justify-between border-b-[3px] border-[#fbcfe8]">
        <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
        <div className="text-orange-500 font-bold uppercase tracking-widest">{meta?.destination}</div>
      </header>
      <main className="flex-1 p-12 overflow-x-auto flex items-start gap-12">
        <DayColumn dayNum={1} places={places} />
      </main>
    </div> 
  ); // ✅ 닫는 태그 수정 완료!
}