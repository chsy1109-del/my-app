import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import DayColumn from './components/DayColumn';
import { AddPlaceModal } from './components/AddPlaceModal';
import { CurrencyConverter } from './components/CurrencyConverter';

export default function App() {
  const [places, setPlaces] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  // 🔗 공유 기능: URL에 tripId가 있으면 해당 방으로 접속, 없으면 기본값(fukuoka) 사용
  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'lucky-fukuoka-trip';

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "trips", tripId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setPlaces(data.places || []);
        setMeta(data.meta || { destination: 'FUKUOKA', duration: 3 });
      }
    });
    return () => unsub();
  }, [tripId]);

  const syncData = async (newPlaces: any) => {
    await setDoc(doc(db, "trips", tripId), { places: newPlaces, meta }, { merge: true });
  };

  return (
    <div className="min-h-screen flex flex-col font-bubbly bg-clover-pixel">
      {/* 🌸 상단 헤더: 메탈릭 핑크 라인 적용 */}
      <header className="px-10 py-5 flex items-center justify-between glass-light sticky top-0 z-[100] border-b-[3px] border-[#fbcfe8]">
        <div className="flex items-center gap-8">
          <h1 className="text-3xl font-retro arkiv-logo-3d">ARKIV</h1>
          <div className="border-l-2 border-[#fbcfe8] pl-8 font-retro text-orange-500 text-xl">{meta?.destination}</div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsCurrencyOpen(true)} className="px-5 py-2 bg-white text-green-600 rounded-full text-[10px] font-black border-2 border-[#fbcfe8] hover:bg-pink-50 transition-all">EXCHANGE</button>
          <button onClick={() => {
            const shareUrl = `${window.location.origin}${window.location.pathname}?tripId=${tripId}`;
            navigator.clipboard.writeText(shareUrl);
            alert("공유 링크가 복사되었습니다! 친구에게 보내주세요. 🍀");
          }} className="px-5 py-2 bg-pink-400 text-white rounded-full text-[10px] font-black border-2 border-white shadow-sm hover:bg-pink-500 transition-all">SHARE TRIP +</button>
        </div>
      </header>

      {/* 🗓️ 메인 타임라인 영역 */}
      <main className="flex-1 overflow-x-auto p-12 flex items-start gap-12 custom-scrollbar">
        {[1, 2, 3].map(day => (
          <DayColumn 
            key={day} dayNum={day} 
            places={places.filter(p => p.day === day)} 
            addPlace={(d: any) => setActiveDay(d)}
            syncPlaces={(updated: any) => syncData(updated)}
          />
        ))}
      </main>

      {/* ➕ 장소 추가 모달 (구글맵 연동) */}
      {activeDay && <AddPlaceModal day={activeDay} onClose={() => setActiveDay(null)} onAdd={(newP: any) => {
        const updated = [...places, { ...newP, id: Date.now(), day: activeDay, photos: [] }];
        syncData(updated); 
        setActiveDay(null);
      }} />}
      
      {/* 💰 환율계산기 모달 */}
      <CurrencyConverter isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} />
    </div>
  );
}