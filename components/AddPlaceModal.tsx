import React, { useState } from 'react';
import { X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { extractPlaceInfo } from '../services/geminiService';

export const AddPlaceModal: React.FC<any> = ({ isOpen, onClose, onAdd }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const extracted = await extractPlaceInfo(input);
      onAdd(extracted);
      setInput('');
      onClose();
    } catch (err) {
      onAdd({ name: input });
      onClose();
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-green-900/10 backdrop-blur-sm">
      {/* 메탈릭 핑크 테두리 적용 (border-[#fbcfe8]) */}
      <div className="w-full max-w-md bg-white rounded-[3rem] border-[6px] border-[#fbcfe8] p-10 shadow-2xl animate-float">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-retro text-green-600 uppercase">New_Record</h3>
          <button onClick={onClose} className="text-pink-300"><X size={28} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input 
            autoFocus 
            className="w-full bg-green-50/50 border-[3px] border-[#fbcfe8] py-5 px-6 rounded-2xl font-bubbly text-xl text-green-900 outline-none" 
            placeholder="Search or Link..." 
            value={input} 
            onChange={e => setInput(e.target.value)} // 타이핑 가능하도록 수정
          />
          <button type="submit" disabled={loading} className="w-full bg-green-500 text-white font-black py-5 rounded-full flex items-center justify-center gap-3 border-4 border-white shadow-lg">
            {loading ? <Loader2 className="animate-spin" size={24} /> : <LinkIcon size={24} />}
            {loading ? 'ANALYZING...' : 'CAPTURE DATA'}
          </button>
        </form>
      </div>
    </div>
  );
};