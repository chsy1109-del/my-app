import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Plane, ArrowRight, Share2, Plus, X, Music, MapPin, Trash2 } from 'lucide-react';

// 중요: DayColumn 파일을 components 폴더에서 불러옵니다.
import DayColumn from './components/DayColumn';

// --- 1. 영수증 모달 (이미지 4번의 환율 자동 합산 로직 포함) ---
const ReceiptModal = ({ places, onClose }: any) => {
  const [totalKRW, setTotalKRW] = useState(0);
  const rates: any = { yen: 9.2, usd: 1350, eur: 1450, sgd: 1010, krw: 1 };

  useEffect(() => {
    let sum = 0;
    places.forEach((p: any) => {
      const costStr = (p.cost || "").toLowerCase();
      // "1,750 yen"에서 숫자 1750만 정확히 추출합니다.
      const amount = parseFloat(costStr.replace(/[^0-9.]/g, "")) || 0;
      let currency = "krw"; 
      if (costStr.includes("yen") || costStr.includes("jpy")) currency = "yen";
      else if (costStr.includes("usd") || costStr.includes("$")) currency = "usd";
      sum += amount * (rates[currency] || 1);
    });
    setTotalKRW(Math.round(sum));
  }, [places]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[5000] flex items-center justify-center p-6">
      <div className="bg-[#f4f1ea] w-full max-w-sm p-10 rounded-sm text-zinc-800 font-mono shadow-2xl animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black italic uppercase text-center border-b-2 border-zinc-200 pb-4 mb-6 tracking-tighter">Receipt</h2>
        <div className="space-y-4 mb-10 min-h-[120px]">
          {places.map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-xs uppercase items-center">
              <span className="truncate pr-4">{p.name}</span>
              <span className="font-bold flex-shrink-0">{p.cost || '0'}</span>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-zinc-800 pt-6 flex justify-between items-end mb-10">
          <span className="text-xl font-black italic">TOTAL (KRW)</span>
          <span className="text-3xl font-black tabular-nums">{totalKRW.toLocaleString()}</span>
        </div>
        <button onClick={onClose} className="w-full py-5 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.3em] active:scale-95 transition-transform shadow-lg">Close Record</button>
      </div>
    </div>
  );
};

// --- 2. 메인 앱 컴포넌트 ---
export default function App() {
  const [places, setPlaces] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [isLaunched, setIsLaunched] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [tempDest, setTempDest] = useState('');

  // Trip ID를 URL에서 가져오거나 기본값을 사용합니다.
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

  // --- 3. 런치 페이지 디자인 (이미지 2, 3번 복구) ---
  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel relative overflow-hidden" style={{backgroundColor: '#f7fee7'}}>
        <div className="absolute top-10 left-10 text-[8px] font-digital uppercase tracking-[0.5em] text-green-300 opacity-50 font-bold">STUDIO: ARKIV</div>
        <div className="absolute top-10 right-10 text-[8px] font-digital uppercase tracking-[0.5em] text-green-300 opacity-50 font-bold">ARCHIVE: v10.0</div>
        
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 text-center z-10">
          <div className="relative mb-8">
            <div className="script-overlay font-script" style={{position: 'absolute', top: '-2.2rem', left: '50%', transform: 'translateX(-50%) rotate(-10deg)', fontSize: '4.5rem', color: '#f97316', zIndex: 20, textShadow: '3px 3px 0px #ffffff'}}>Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none" style={{fontFamily: 'Shrikhand, cursive', background: 'linear-gradient(to bottom, #ffffff 0%, #4ade80 50%, #22c55e 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 6px 0 rgba(251, 207, 232, 0.8))'}}>ARKIV</h1>
            <p className="text-orange-500 text-xs tracking-[1em] uppercase font-black -mt-4">MEMORIES ARCHIVE</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl bg-white/40 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <div className="w-44 h-44 rounded-[3rem] flex items-center justify-center text-white animate-float flex-shrink-0" style={{background: 'linear-gradient(135deg, #84cc16 0%, #fbbf24 100%)', border: '2px solid white', boxShadow: '0 8px 20px rgba(132, 204, 22, 0.2)'}}>
                <Plane size={80} />
             </div>
             <form onSubmit={e => { e.preventDefault(); const m = { destination: tempDest, duration: 3 }; setMeta(m); setIsLaunched(true); syncData(places, m); }} className="flex-1 space-y-8 text-left">
                <p className="font-bold text-green-600 text-sm uppercase tracking-widest leading-relaxed">FOR BOLD LOOKS, RETRO ROOTS. START YOUR LUCKY JOURNEY ARCHIVE BELOW.</p>
                <input required placeholder="TARGET DESTINATION..." className="w-full bg-white/80 border-b-4 border-green-200 py-4 px-8 rounded-full text-3xl font-retro outline-none text-green-900 shadow-sm" value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button className="bg-[#4ade80] text-white font-black px-12 py-5 rounded-full text-xl flex items-center gap-3 shadow-lg active:scale-95 uppercase tracking-widest transition-all hover:bg-green-500">LAUNCH <ArrowRight /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. 메인 대시보드 (이미지 1번 테마 및 닫히지 않은 태그 수정) ---
  return (
    <div className="min-h-screen flex flex-col font-bubbly bg-clover-pixel" style={{backgroundColor: '#f7fee7'}}>
      <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-[100] border-b-[3px] border-[#fbcfe8]" style={{background: 'rgba(247, 254, 231, 0.85)', backdropFilter: 'blur(12px)'}}>
        <div className="flex items-center gap-8 cursor-pointer" onClick={() => setIsLaunched(false)}>
          <h2 className="text-3xl arkiv-logo-3d">ARKIV</h2>
          <div className="border-l-2 border-[#fbcfe8] pl-8 font-retro text-orange-500 text-xl uppercase tracking-widest">{meta?.destination}</div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setShowReceipt(true)} className="px-6 py-2 bg-white text-pink-400 rounded-full text-[10px] font-black border-2 border-[#fbcfe8] shadow-sm hover:bg-pink-50 transition-all">RECEIPT</button>
          <button onClick={() => navigator.clipboard.writeText(window.location.href)} className="bg-pink-400 text-white font-black px-8 py-2 rounded-full text-[10px] border-2 border-white shadow-md flex items-center gap-2">SHARE <Share2 size={12} /></button>
        </div>
      </header>
      
      <main className="flex-1 p-12 overflow-x-auto flex items-start gap-12 custom-scrollbar">
        {[1, 2, 3].map(day => (
          <DayColumn 
            key={day} 
            dayNum={day} 
            places={places.filter(p => p.day === day)} 
            addPlace={(d: number) => { /* 장소 추가 로직 */ }}
            toggleVisited={(id: number) => { /* 방문 체크 로직 */ }}
            updateMemo={(id: number, field: string, value: string) => { /* 업데이트 로직 */ }}
            removePlace={(id: number) => { /* 삭제 로직 */ }}
          />
        ))}
      </main>

      {showReceipt && <ReceiptModal places={places} onClose={() => setShowReceipt(false)} />}
    </div>
  ); // 👈 닫는 태그 에러를 해결했습니다!
}