import React from 'react';

export const ReceiptModal = ({ places, onClose, homeCurrency }: any) => {
  const total = places.reduce((sum: number, p: any) => sum + (Number(p.cost) || 0), 0);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[5000] flex items-center justify-center p-6">
      <div className="bg-[#f4f1ea] w-full max-w-sm p-10 rounded-sm text-zinc-800 font-mono shadow-2xl">
        <div className="text-center border-b-2 border-zinc-200 pb-6 mb-6">
          <h2 className="text-2xl font-black italic uppercase">Receipt</h2>
          <p className="text-[8px] tracking-widest opacity-40">ARKIV_OFFICIAL_RECORD</p>
        </div>
        <div className="space-y-3 mb-8">
          {places.map((p: any, i: number) => (
            <div key={i} className="flex justify-between text-xs"><span>{p.name}</span><span>{p.cost || '0'}</span></div>
          ))}
        </div>
        <div className="border-t-2 border-zinc-800 pt-4 flex justify-between font-bold">
          <span>TOTAL ({homeCurrency})</span><span>{total.toLocaleString()}</span>
        </div>
        <button onClick={onClose} className="w-full mt-10 py-3 bg-zinc-800 text-white text-xs font-bold uppercase">Close</button>
      </div>
    </div>
  );
};