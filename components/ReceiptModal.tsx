import React from 'react';

export const ReceiptModal = ({ places, onClose, homeCurrency }) => {
  const total = places.reduce((sum, p) => sum + (Number(p.cost || 0) * 9.2), 0); // 기본 환율 적용

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#f4f1ea] w-full max-w-sm p-8 shadow-2xl relative overflow-hidden text-zinc-800">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 opacity-10" />
        <button onClick={onClose} className="absolute top-4 right-4 text-xs tracking-widest uppercase opacity-40">CLOSE</button>
        
        <div className="text-center space-y-2 mb-10 border-b border-zinc-200 pb-8">
          <h2 className="text-2xl font-serif italic tracking-tighter">Travel Ledger</h2>
          <p className="text-[9px] uppercase tracking-[0.4em] opacity-40">Official Record of Moments</p>
        </div>

        <div className="space-y-4 mb-10 font-mono text-sm">
          {places.map((p, i) => (
            <div key={i} className="flex justify-between items-end border-b border-zinc-100 border-dashed pb-2">
              <span className="truncate pr-4 uppercase text-[10px]">{p.name || 'Untitled'}</span>
              <span className="whitespace-nowrap">{Number(p.cost || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t-2 border-zinc-800 space-y-1 text-right">
          <p className="text-[8px] uppercase tracking-[0.2em] opacity-50">Grand Total ({homeCurrency})</p>
          <p className="text-3xl font-serif italic">₩ {total.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};