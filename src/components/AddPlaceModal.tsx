import React, { useState } from 'react';
import { X, Link as LinkIcon, Loader2 } from 'lucide-react';

export const AddPlaceModal = ({ isOpen, onClose, onAdd }: any) => {
  const [input, setInput] = useState('');
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-green-900/20 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[3rem] border-[6px] border-[#fbcfe8] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-retro text-green-600 uppercase">NEW_RECORD</h3>
          <button onClick={onClose} className="text-pink-300"><X size={24} /></button>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            onAdd({ name: input });
            setInput('');
          }
        }} className="space-y-6">
          <input 
            autoFocus 
            className="w-full bg-green-50/50 border-[3px] border-[#fbcfe8] py-4 px-6 rounded-2xl font-bubbly text-xl text-green-900 outline-none" 
            placeholder="Search or Link..." 
            value={input} 
            onChange={(e) => setInput(e.target.value)} // 타이핑 가능하게 수정
          />
          <button type="submit" className="w-full bg-green-500 text-white font-black py-4 rounded-full flex items-center justify-center gap-2 border-4 border-white shadow-lg">
            <LinkIcon size={20} /> CAPTURE DATA
          </button>
        </form>
      </div>
    </div>
  );
};