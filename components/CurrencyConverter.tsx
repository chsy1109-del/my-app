import React, { useState } from 'react';
import { X, Coins, ArrowRightLeft } from 'lucide-react';

export const CurrencyConverter = ({ isOpen, onClose }: any) => {
  const [amount, setAmount] = useState(1);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-pink-50/20 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl border-[6px] border-[#fbcfe8] p-8">
        <div className="flex justify-between mb-6">
          <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center text-white"><Coins size={24} /></div>
          <button onClick={onClose} className="text-pink-300"><X size={24} /></button>
        </div>
        <h2 className="text-2xl font-retro text-orange-500 mb-6 uppercase">Currency_Sync</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border-2 border-white font-bold">JPY <ArrowRightLeft size={18} /> KRW</div>
          <div className="bg-white p-6 rounded-[2rem] border-4 border-pink-50 shadow-inner">
            <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-transparent text-4xl font-retro text-orange-500 outline-none" />
          </div>
          <button className="w-full bg-orange-400 text-white font-black py-4 rounded-full">REFRESH RATE</button>
        </div>
      </div>
    </div>
  );
};