import React, { useState, useEffect } from 'react';
import { db } from './services/firebase'; 
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Plane, ArrowRight, Share2, Plus, X } from 'lucide-react';
import DayColumn from './components/DayColumn'; 

export default function App() {
  // ✅ 모든 변수와 상태는 이 { } 안에 있어야 에러가 안 납니다!
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

  // 1. 런치 페이지 디자인
  if (!isLaunched) {
    return (
      <div className="bg-clover-pattern" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ position: 'relative', marginBottom: '40px' }}>
            <div className="lucky-script">Lucky</div>
            <h1 className="arkiv-logo-metal">ARKIV</h1>
          </div>
          
          <div className="launch-container">
             <div style={{ width: '150px', height: '150px', borderRadius: '3rem', background: 'linear-gradient(135deg, #84cc16 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                <Plane size={80} />
             </div>
             <form style={{ flex: 1, textAlign: 'left' }} onSubmit={e => { e.preventDefault(); const m = { destination: tempDest }; setMeta(m); setIsLaunched(true); syncData(places, m); }}>
                <input required placeholder="TARGET DESTINATION..." style={{ width: '100%', background: 'white', border: 'none', borderBottom: '4px solid #bbf7d0', padding: '16px 24px', borderRadius: '50px', fontSize: '2rem', outline: 'none', marginBottom: '20px' }} value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button style={{ background: '#4ade80', color: 'white', fontWeight: '900', padding: '16px 40px', borderRadius: '50px', fontSize: '1.2rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>LAUNCH <ArrowRight /></button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. 메인 대시보드
  return (
    <div className="bg-clover-pattern" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'between', borderBottom: '3px solid #fbcfe8' }}>
        <h2 className="arkiv-logo-metal" style={{ fontSize: '2.5rem', cursor: 'pointer' }} onClick={() => setIsLaunched(false)}>ARKIV</h2>
        <div style={{ marginLeft: 'auto', color: '#f97316', fontWeight: 'bold', fontSize: '1.2rem' }}>{meta?.destination}</div>
      </header>
      <main style={{ flex: 1, padding: '40px', display: 'flex', gap: '40px', overflowX: 'auto' }}>
        <DayColumn dayNum={1} places={places} />
      </main>
    </div>
  );
}