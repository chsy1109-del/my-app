import React, { useState, useEffect, useMemo } from 'react';
import { db } from './services/firebase'; // Firebase 설정 파일 경로 확인
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { PlaceCard } from './components/PlaceCard.tsx';
import { ReceiptModal } from './components/ReceiptModal.tsx';

export default function App() {
  const [places, setPlaces] = useState([]);
  const [dayTitles, setDayTitles] = useState({ 1: "Day 1 - Hakata", 2: "Day 2", 3: "Day 3" });
  const [showReceipt, setShowReceipt] = useState(false);
  
  // 💰 초기 통화 및 환율 설정 (집 & 여행지)
  const [globalSettings, setGlobalSettings] = useState({ home: 'KRW', target: 'JPY' });

  // 🔗 실시간 공유 및 공동 작업 기능
  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'my-travel-archive';

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "trips", tripId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlaces(data.places || []);
        setDayTitles(data.dayTitles || { 1: "Day 1", 2: "Day 2", 3: "Day 3" });
        setGlobalSettings(data.settings || { home: 'KRW', target: 'JPY' });
      }
    });
    return () => unsub();
  }, [tripId]);

  const syncData = async (updatedPlaces, updatedTitles, updatedSettings) => {
    await setDoc(doc(db, "trips", tripId), { 
      places: updatedPlaces || places, 
      dayTitles: updatedTitles || dayTitles,
      settings: updatedSettings || globalSettings
    }, { merge: true });
  };

  // 🧾 영수증 합산 로직
  const totalCost = useMemo(() => {
    return places.reduce((sum, p) => sum + Number(p.cost || 0), 0);
  }, [places]);

  return (
    <div className="min-h-screen p-6 md:p-16 max-w-6xl mx-auto">
      {/* 필름 & 매거진 스타일 헤더 */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 border-b border-white/10 pb-12">
        <div>
          <h1 className="magazine-header text-5xl md:text-7xl font-light tracking-tighter text-stone-200">
            Arkiv: Fragments of Lumina
          </h1>
          <p className="text-[9px] tracking-[0.5em] text-zinc-500 mt-3 uppercase">
            Archive No. 01 / Fukuoka Fragments
          </p>
        </div>
        <div className="flex gap-4 mt-8 md:mt-0">
          <button 
            onClick={() => setShowReceipt(true)} 
            className="text-[10px] tracking-widest border border-stone-800 px-6 py-3 hover:bg-stone-100 hover:text-black transition-all duration-500 uppercase"
          >
            Receipt
          </button>
          <button 
            onClick={() => navigator.clipboard.writeText(window.location.href)} 
            className="text-[10px] tracking-widest bg-stone-200 text-black px-6 py-3 font-bold transition-all duration-500 uppercase"
          >
            Share +
          </button>
        </div>
      </header>
      {/* 💰 여행 시작 통화 설정 */}
      <section className="mb-16 grid grid-cols-2 gap-8 p-6 bg-white/5 border border-white/5 rounded-sm">
        <div className="space-y-2">
          <label className="text-[8px] tracking-widest text-white/30 uppercase">Home Currency</label>
          <select 
            value={globalSettings.home} 
            onChange={(e) => syncData(null, null, { ...globalSettings, home: e.target.value })}
            className="bg-transparent text-xl font-bold outline-none border-b border-white/10"
          >
            <option value="KRW">🇰🇷 KRW</option>
            <option value="SGD">🇸🇬 SGD</option>
            <option value="USD">🇺🇸 USD</option>
          </select>
        </div>
        <div className="text-right space-y-2">
          <label className="text-[8px] tracking-widest text-rose-400/40 uppercase">Base Destination</label>
          <select 
            value={globalSettings.target} 
            onChange={(e) => syncData(null, null, { ...globalSettings, target: e.target.value })}
            className="bg-transparent text-xl font-bold outline-none border-b border-white/10 text-rose-300"
          >
            <option value="JPY">🇯🇵 JPY</option>
            <option value="AED">🇦🇪 AED</option>
            <option value="SGD">🇸🇬 SGD</option>
          </select>
        </div>
      </section>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-16">
        {[1, 2, 3].map(day => (
          <div key={day} className="space-y-10">
            {/* 6. 데이 헤더 직접 타이핑 수정 */}
            <input 
              value={dayTitles[day]} 
              onChange={(e) => {
                const newTitles = { ...dayTitles, [day]: e.target.value };
                setDayTitles(newTitles);
                syncData(null, newTitles, null);
              }}
              className="magazine-header bg-transparent text-3xl font-light w-full outline-none border-b border-white/5 pb-4 focus:border-rose-500/30 transition-colors"
            />
            
            {places.filter(p => p.day === day).map(place => (
              <PlaceCard 
                key={place.id} 
                place={place} 
                homeCurrency={globalSettings.home}
                onUpdate={(updated) => {
                  const newPlaces = places.map(p => p.id === place.id ? updated : p);
                  setPlaces(newPlaces);
                  syncData(newPlaces, null, null);
                }} 
              />
            ))}
            <button className="w-full py-6 border border-dashed border-white/5 text-[9px] tracking-[0.5em] text-white/20 hover:text-white transition">+ RECORD PLACE</button>
          </div>
        ))}
      </main>

      {showReceipt && <ReceiptModal places={places} total={totalCost} homeCurrency={globalSettings.home} onClose={() => setShowReceipt(false)} />}
    </div>
  );
}