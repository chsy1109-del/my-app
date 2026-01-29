import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const ReceiptModal = ({ places, onClose }: any) => {
  const [totalKRW, setTotalKRW] = useState(0);

  // 환율 데이터 (실제로는 API에서 가져오거나 geminiService 활용)
  const rates: any = { yen: 9.2, usd: 1350, eur: 1450, sgd: 1010, krw: 1 };

  useEffect(() => {
    let sum = 0;
    places.forEach((p: any) => {
      const costStr = (p.cost || "").toLowerCase();
      const amount = parseFloat(costStr.replace(/[^0-9.]/g, "")) || 0;
      
      // 화폐 단위 추출 (yen, usd, $, eur 등)
      let currency = "krw"; 
      if (costStr.includes("yen") || costStr.includes("jpy") || costStr.includes("엔")) currency = "yen";
      else if (costStr.includes("usd") || costStr.includes("$") || costStr.includes("달러")) currency = "usd";
      else if (costStr.includes("eur") || costStr.includes("유로")) currency = "eur";
      else if (costStr.includes("sgd") || costStr.includes("싱가포르")) currency = "sgd";

      sum += amount * (rates[currency] || 1);
    });
    setTotalKRW(Math.round(sum));
  }, [places]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[5000] flex items-center justify-center p-6">
      <div className="bg-[#f4f1ea] w-full max-w-sm p-10 rounded-sm text-zinc-800 font-mono shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
        <div className="text-center border-b-2 border-zinc-200 pb-8 mb-8">
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">Receipt</h2>
          <p className="text-[9px] tracking-[0.4em] opacity-40 font-bold mt-1">ARKIV_OFFICIAL_RECORD</p>
        </div>
        
        <div className="space-y-4 mb-10 min-h-[150px]">
          {places.map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-xs items-center">
              <span className="truncate pr-4 uppercase">{p.name}</span>
              <span className="font-bold flex-shrink-0">{p.cost || '0'}</span>
            </div>
          ))}
        </div>
        
        <div className="border-t-2 border-zinc-800 pt-6 flex justify-between items-end mb-10">
          <div className="flex flex-col">
            <span className="text-[10px] opacity-50 uppercase font-black">Grand Total</span>
            <span className="text-xl font-black italic">TOTAL (KRW)</span>
          </div>
          <span className="text-3xl font-black tabular-nums">{totalKRW.toLocaleString()}</span>
        </div>
        
        <button onClick={onClose} className="w-full py-5 bg-zinc-900 text-white text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-800 transition-colors shadow-lg active:scale-95">
          Close Record
        </button>
      </div>
    </div>
  );
};