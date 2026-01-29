import React, { useState, useEffect } from 'react';
import { db } from './services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Plane, ArrowRight, Share2, Plus, Music, MapPin, Trash2, CheckCircle, Circle, X } from 'lucide-react';

// --- 1. 영수증 모달 (환율 자동 합산 로직 포함) ---
const ReceiptModal = ({ places, onClose }: any) => {
  const [totalKRW, setTotalKRW] = useState(0);
  const rates: any = { yen: 9.2, usd: 1350, eur: 1450, sgd: 1010, krw: 1 }; // 2026년 기준 환율

  useEffect(() => {
    let sum = 0;
    places.forEach((p: any) => {
      const costStr = (p.cost || "").toLowerCase();
      const amount = parseFloat(costStr.replace(/[^0-9.]/g, "")) || 0;
      let currency = "krw"; 
      if (costStr.includes("yen") || costStr.includes("jpy")) currency = "yen";
      else if (costStr.includes("usd") || costStr.includes("$")) currency = "usd";
      else if (costStr.includes("eur")) currency = "eur";
      else if (costStr.includes("sgd")) currency = "sgd";
      sum += amount * (rates[currency] || 1);
    });
    setTotalKRW(Math.round(sum));
  }, [places]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[5000] flex items-center justify-center p-6">
      <div className="bg-[#f4f1ea] w-full max-w-sm p-10 rounded-sm text-zinc-800 font-mono shadow-2xl animate-in zoom-in-95 duration-300">
        <h2 className="text-3xl font-black italic uppercase text-center border-b-2 border-zinc-200 pb-4 mb-6">Receipt</h2>
        <div className="space-y-4 mb-10 min-h-[120px]">
          {places.map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-xs uppercase items-center">
              <span className="truncate pr-4">{p.name}</span>
              <span className="font-bold">{p.cost || '0'}</span>
            </div>
          ))}
        </div>
        <div className="border-t-2 border-zinc-800 pt-6 flex justify-between items-end mb-10">
          <span className="text-xl font-black italic font-sans">TOTAL (KRW)</span>
          <span className="text-3xl font-black tabular-nums">{totalKRW.toLocaleString()}</span>
        </div>
        <button onClick={onClose} className="w-full py-5 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.3em] active:scale-95 shadow-lg">Close Record</button>
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

  const tripId = new URLSearchParams(window.location.search).get('tripId') || 'lucky-fukuoka';

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

  // --- 3. 런치 페이지 디자인 (image_e1ada4.png 복구) ---
  if (!isLaunched) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-clover-pixel relative overflow-hidden" style={{backgroundColor: '#f7fee7'}}>
        <div className="absolute top-10 left-10 text-[8px] font-sans uppercase tracking-[0.5em] text-green-300 opacity-50 font-bold">STUDIO: ARKIV</div>
        <div className="absolute top-10 right-10 text-[8px] font-sans uppercase tracking-[0.5em] text-green-300 opacity-50 font-bold">ARCHIVE: v10.0</div>
        
        <div className="w-full max-w-5xl flex flex-col items-center gap-12 text-center z-10">
          <div className="relative mb-8">
            <div className="script-overlay" style={{position: 'absolute', top: '-2.2rem', left: '50%', transform: 'translateX(-50%) rotate(-10deg)', fontSize: '4rem', color: '#f97316', zIndex: 20, textShadow: '3px 3px 0px #ffffff', fontFamily: 'cursive'}}>Lucky</div>
            <h1 className="text-[10rem] arkiv-logo-3d leading-none" style={{fontFamily: 'serif', fontWeight: '900'}}>ARKIV</h1>
            <p className="text-orange-500 text-xs tracking-[1em] uppercase font-bold -mt-4">MEMORIES ARCHIVE</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-4xl bg-white/40 p-12 rounded-[4rem] border-[8px] border-white shadow-2xl backdrop-blur-md">
             <div className="w-44 h-44 rounded-[3rem] flex items-center justify-center text-white animate-float flex-shrink-0" style={{background: 'linear-gradient(135deg, #84cc16 0%, #fbbf24 100%)', border: '2px solid white', boxShadow: '0 8px 20px rgba(132, 204, 22, 0.2)'}}>
                <Plane size={80} />
             </div>
             <form onSubmit={e => { e.preventDefault(); const m = { destination: tempDest, duration: 3 }; setMeta(m); setIsLaunched(true); syncData(places, m);