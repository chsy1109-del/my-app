import React, { useState, useEffect, useMemo } from 'react';
import { db } from './services/firebase'; 
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { PlaceCard } from './components/PlaceCard.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';

export default function App() {
  const [isLaunched, setIsLaunched] = useState(false);
  const [places, setPlaces] = useState<any[]>([]);
  const [dayTitles, setDayTitles] = useState<any>({ 1: "HAKATA", 2: "TENJIN", 3: "DAZAIFU" });
  const [showReceipt, setShowReceipt] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({ home: 'KRW', target: 'JPY' });

  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'lucky-trip-01';

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "trips", tripId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlaces(data.places || []);
        setDayTitles(data.dayTitles || { 1: "HAKATA", 2: "TENJIN", 3: "DAZAIFU" });
        setGlobalSettings(data.settings || { home: 'KRW', target: 'JPY' });
      }
    });
    return () => unsub();
  }, [tripId]);

  const syncData = async (updatedPlaces: any, updatedTitles: any, updatedSettings: any) => {
    await setDoc(doc(db, "trips", tripId), { 
      places: updatedPlaces || places, 
      dayTitles: updatedTitles || dayTitles,
      settings: updatedSettings || globalSettings
    }, { merge: true });
  };

  const totalCost = useMemo(() => {
    return places.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  }, [places]);

  if (!isLaunched) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f7ed]">
        <div className="relative mb-16 text-center">
          <span className="lucky-script absolute -top-12 left-1/2 -translate-x-1/2 text-5xl text-orange-400">Lucky</span>
          <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter text-[#5bb381] leading-none opacity-80">ARKIV</h1>
          <p className="text-[10px] tracking-[0.8em] font-bold text-[#5bb381]/40 mt-4 uppercase">Memories Archive</p>
        </div>
        
        <div className="lucky-card p-10 w-full max-w-md text-center bg-white/40 backdrop-blur-md rounded-[3rem] border-8 border-white shadow-2xl">
          <p className="text-[10px] tracking-widest text-zinc-400 mb-8 uppercase font-bold">Start Your Lucky Journey Below.</p>
          <div className="border-b-2 border-dashed border-zinc-200 mb-10 pb-4">
            <input 
              placeholder="TARGET DESTINATION..." 
              className="w-full bg-transparent text-center text-2xl font-black outline-none text-[#5bb381] placeholder:text-zinc-200"
            />
          </div>
          <button onClick={() => setIsLaunched(true)} className="launch-button w-full text-xl py-5 bg-[#5bb381] text-white rounded-full font-black tracking-widest shadow-lg hover:bg-[#4a966b] transition-all">LAUNCH →</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto bg-[#f4f7ed]">
      <header className="flex justify-between items-start mb-20">
        <div>
          <span className="text-[10px] font-bold text-orange-400 tracking-widest">@LUCKY_STUDIO</span>
          <h1 className="text-4xl font-black text-[#5bb381] tracking-tighter">ARKIV</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowReceipt(true)} className="px-6 py-2 border-2 border-[#5bb381] text-[#5bb381] rounded-full text-[10px] font-bold tracking-widest hover:bg-[#5bb381] hover:text-white transition">RECEIPT</button>
          <button className="px-6 py-2 bg-orange-400 text-white rounded-full text-[10px] font-bold tracking-widest shadow-lg">SHARE +</button>
        </div>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {[1, 2, 3].map(day => (
          <div key={day} className="lucky-card p-8 min-h-[500px] flex flex-col items-center relative overflow-hidden bg-white/40 backdrop-blur-md rounded-[3rem] border-8 border-white shadow-2xl">
            <div className="absolute top-6 left-6 text-[8px] font-bold tracking-[0.3em] opacity-20 uppercase">Timeline_Log / Reel_{day}</div>
            <div className="text-[10rem] font-black italic text-[#5bb381]/5 absolute top-10 pointer-events-none">D{day}</div>
            
            <input 
              value={dayTitles[day] || ""} 
              onChange={(e) => {
                const newTitles = { ...dayTitles, [day]: e.target.value };
                setDayTitles(newTitles);
                syncData(null, newTitles, null);
              }}
              className="mt-20 mb-10 bg-transparent text-center text-4xl font-black italic text-[#5bb381] outline-none w-full"
            />

            <div className="w-full space-y-6 z-10">
              {places.filter(p => p.day === day).map(place => (
                <PlaceCard 
                  key={place.id} 
                  place={place} 
                  homeCurrency={globalSettings.home}
                  onUpdate={(updated: any) => {
                    const newPlaces = places.map(p => p.id === place.id ? updated : p);
                    setPlaces(newPlaces);
                    syncData(newPlaces, null, null);
                  }} 
                />
              ))}
            </div>

            <button className="mt-auto w-16 h-16 bg-[#5bb381] text-white rounded-full text-4xl shadow-xl hover:scale-110 transition-transform">+</button>
          </div>
        ))}
      </main>

      <footer className="mt-20 border-t-4 border-white pt-10 flex justify-between items-center opacity-30">
        <div className="text-[10px] font-bold tracking-[0.5em]">STABILITY METER</div>
        <div className="w-64 h-2 bg-white rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-[#5bb381]"></div>
        </div>
        <div className="text-[10px] font-bold tracking-[0.5em]">ARKIV V10.0 • RETRO ROOTS</div>
      </footer>

      {showReceipt && <ReceiptModal places={places} homeCurrency={globalSettings.home} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}