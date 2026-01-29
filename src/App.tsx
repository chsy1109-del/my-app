import React, { useState, useEffect } from 'react';
import { db } from './services/firebase'; 
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { Plane, ArrowRight, Plus } from 'lucide-react';
import DayColumn from './components/DayColumn'; 

export default function App() {
  // ✅ 모든 상태와 로직은 반드시 이 { 중괄호 } 안에 있어야 합니다!
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

  // 1. 런치 페이지
  if (!isLaunched) {
    return (
      <div className="bg-pattern" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', marginBottom: '50px' }}>
            <div className="lucky-script" style={{ fontSize: '5rem', position: 'absolute', top: '-3rem', left: '50%', transform: 'translateX(-50%)' }}>Lucky</div>
            <h1 className="arkiv-logo-metal" style={{ fontSize: '10rem' }}>ARKIV</h1>
          </div>
          
          <div style={{ display: 'flex', gap: '30px', background: 'white', padding: '40px', borderRadius: '4rem', border: '8px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
             <div style={{ width: '150px', height: '150px', borderRadius: '3rem', background: 'linear-gradient(135deg, #84cc16 0%, #fbbf24 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Plane size={80} />
             </div>
             <form style={{ textAlign: 'left' }} onSubmit={e => { e.preventDefault(); const m = { destination: tempDest }; setMeta(m); setIsLaunched(true); syncData(places, m); }}>
                <input required placeholder="TARGET..." style={{ width: '100%', border: 'none', borderBottom: '4px solid #bbf7d0', fontSize: '2.5rem', padding: '10px', outline: 'none', marginBottom: '20px' }} value={tempDest} onChange={e => setTempDest(e.target.value)} />
                <button style={{ background: '#4ade80', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer' }}>LAUNCH →</button>
             </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. 메인 대시보드
  return (
    <div className="bg-pattern" style={{ display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '3px solid var(--pink-border)' }}>
        <h2 className="arkiv-logo-metal" style={{ fontSize: '3rem', cursor: 'pointer' }} onClick={() => setIsLaunched(false)}>ARKIV</h2>
        <div className="lucky-script" style={{ fontSize: '1.5rem' }}>{meta?.destination}</div>
      </header>
      
      <main style={{ flex: 1, padding: '50px', display: 'flex', gap: '50px', overflowX: 'auto' }}>
        <div className="day-column">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '5rem', color: '#16a34a', fontStyle: 'italic' }}>D1</h3>
            <button style={{ width: '50px', height: '50px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '15px', cursor: 'pointer' }}><Plus /></button>
          </div>
          <DayColumn dayNum={1} places={places} />
        </div>
      </main>
    </div>
  );
}