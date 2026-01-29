import React, { useState } from 'react';
import { X, Coins, ArrowRightLeft, RefreshCcw } from 'lucide-react';

export const CurrencyConverter = ({ isOpen, onClose }: any) => {
  const [amount, setAmount] = useState(1);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-pink-100/20 backdrop-blur-md">
      <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl overflow-hidden border-[6px] border-[#fbcfe8] animate-float p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Coins size={24} />
          </div>
          <button onClick={onClose} className="text-pink-300 hover:text-pink-500 transition-colors">
            <X size={24} />
          </button>
        </div>
        <h2 className="text-3xl font-retro text-orange-500 mb-6 uppercase tracking-tighter">Currency_Sync</h2>
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-orange-50/50 p-4 rounded-2xl border-2 border-white">
            <span className="font-bold text-orange-900">JPY</span>
            <ArrowRightLeft size={18} className="text-orange-200" />
            <span className="font-bold text-orange-900">KRW</span>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border-4 border-pink-50 shadow-inner">
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-transparent text-4xl font-retro text-orange-500 outline-none"
            />
          </div>
          <div className="text-center text-[10px] font-digital text-orange-300 uppercase tracking-widest">
            Estimated: {(amount * 9.2).toLocaleString()} KRW
          </div>
          <button className="w-full bg-orange-400 text-white font-black py-5 rounded-full flex items-center justify-center gap-2 text-sm shadow-lg border-4 border-white transition-all">
            <RefreshCcw size={18} /> REFRESH ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
};