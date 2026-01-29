import React, { useState, useEffect } from 'react';

export const ReceiptModal = ({ places, onClose }: any) => {
  const [totalKRW, setTotalKRW] = useState(0);

  // 실시간 환율 (필요 시 업데이트 가능)
  const rates: any = { yen: 9.2, usd: 1350, eur: 1450, sgd: 1010, krw: 1 };

  useEffect(() => {
    let sum = 0;
    places.forEach((p: any) => {
      const costStr = (p.cost || "").toLowerCase();
      // 숫자만 추출
      const amount = parseFloat(costStr.replace(/[^0-9.]/g, "")) || 0;
      
      // 화폐 단위 인식
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
        <div className="text-center border-b-2 border-zinc-200 pb-8 mb-8">
          <h2 className="text-3xl font-black italic uppercase">Receipt</h2>
          <p className="text-[9px] font-bold mt-1 uppercase tracking-widest opacity-40">Arkiv Official Record</p>
        </div>
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