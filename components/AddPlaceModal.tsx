import React, { useState } from 'react';
import { X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { extractPlaceInfo } from '../services/geminiService';

export const AddPlaceModal = ({ day, onClose, onAdd }: any) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    try {
      const extracted = await extractPlaceInfo(input);
      onAdd(extracted);
    } catch (err) {
      onAdd({ name: input });
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-green-900/10 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[3rem] border-[6px] border-[#fbcfe8] p-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-retro text-green-600">NEW_RECORD</h3>
          <button onClick={onClose} className="text-pink-300"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-[10px] font-digital text-green-400 uppercase tracking-widest">Paste Google Maps link for auto-sync.</p>
          <input 
            autoFocus className="w-full bg-green-50/50 border-2 border-pink-50 py-4 px-6 rounded-2xl font-bubbly text-green-900 outline-none focus:border-[#fbcfe8]" 
            placeholder="Search or Link..." value={input} onChange={e => setInput(e.target.value)} 
          />
          <button type="submit" disabled={loading} className="w-full bg-green-500 text-white font-black py-5 rounded-full flex items-center justify-center gap-2 border-4 border-white shadow-lg transition-all">
            {loading ? <Loader2 className="animate-spin" /> : <LinkIcon />}
            {loading ? 'ANALYZING...' : 'CAPTURE DATA'}
          </button>
        </form>
      </div>
    </div>
  );
};