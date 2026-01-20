
import React, { useState, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { 
  Plane, 
  Plus, 
  Sparkles, 
  ArrowRight,
  X,
  Loader2,
  Coins,
  RefreshCcw,
  ArrowRightLeft,
  Link as LinkIcon,
  Download
} from 'lucide-react';

import { Place, TripMetadata } from './types';
import DayColumn from './components/DayColumn';
import { generateItinerarySuggestions, getLiveExchangeRate, extractPlaceInfo } from './services/geminiService';

const STORAGE_KEY = 'arkiv_v10_storage';
const META_KEY = 'arkiv_v10_meta';

const PixelClover = ({ className, size = 48, color = "#84cc16", outline = false, opacity = 0.6 }: { className?: string; size?: number; color?: string; outline?: boolean; opacity?: number }) => (
  <svg 
    width={size} height={size} viewBox="0 0 10 10" 
    className={`${className}`} 
    style={{ opacity }}
  >
    <path 
      d="M4 1h2v1h1v1h1v2H7v1H6v1H4V7H3V6H2V4h1V3h1V1z" 
      fill={outline ? "none" : color} 
      stroke={outline ? color : "none"} 
      strokeWidth={outline ? "0.4" : "0"}
    />
  </svg>
);

const AddPlaceModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (data: Partial<Place>) => void }> = ({ isOpen, onClose, onAdd }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const extracted = await extractPlaceInfo(input);
      onAdd(extracted);
      setInput('');
      onClose();
    } catch (e) {
      onAdd({ name: input.split('http')[0].trim() || 'New Entry' });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-green-900/10 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-[2rem] border border-[#fbcfe8] p-8 shadow-2xl animate-float">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-retro text-green-600">NEW_FRAME</h3>
          <button onClick={onClose} className="text-pink-300"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[10px] font-digital text-green-400 uppercase tracking-widest leading-relaxed">
            PASTE GOOGLE MAPS LINK OR TYPE PLACE NAME FOR AUTOMATIC ARCHIVING.
          </p>
          <input 
            autoFocus
            className="w-full bg-green-50/50 border border-[#fbcfe8] py-4 px-6 rounded-2xl font-bubbly text-green-900 outline-none focus:border-green-400"
            placeholder="Search or Paste Link..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 text-white font-black py-4 rounded-full flex items-center justify-center gap-2 hover:bg-green-600 transition-all border border-white"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LinkIcon size={18} />}
            {loading ? 'ANALYZING...' : 'CAPTURE DATA'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [meta, setMeta] = useState<TripMetadata | null>(null);
  const [isGenerating, setIsGenerating] = useState<Record<number, boolean>>({});
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const [activeDayForAdd, setActiveDayForAdd] = useState<number | null>(null);
  const [tempDest, setTempDest] = useState('');
  const [tempDays, setTempDays] = useState(3);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedMeta = localStorage.getItem(META_KEY);
    if (saved) setPlaces(JSON.parse(saved));
    if (savedMeta) setMeta(JSON.parse(savedMeta));
  }, []);

  useEffect(() => {
    if (meta) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(places));
      localStorage.setItem(META_KEY, JSON.stringify(meta));
    }
  }, [places, meta]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPlaces((items) => {
        const activeItem = items.find(i => i.id === active.id);
        const overItem = items.find(i => i.id === over.id);
        if (!activeItem || !overItem) return items;
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const updated = arrayMove(items, oldIndex, newIndex);
        return updated.map(p => p.id === active.id ? { ...p, day: overItem.day } : p);
      });
    }
  };

  const toggleVisited = (id: string) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, visited: !p.visited } : p));
  const updateMemo = (id: string, field: keyof Place, value: any) => setPlaces(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  const removePlace = (id: string) => setPlaces(prev => prev.filter(p => p.id !== id));

  const handleAddPlace = (day: number, data: Partial<Place>) => {
    const newPlace: Place = {
      id: `pl-${Date.now()}`,
      name: data.name || 'Unknown',
      day,
      visited: false,
      transport: data.transport || '',
      cost: data.cost || '',
      description: data.description || '',
      category: data.category || 'POINT',
      photos: [],
      musicLink: ''
    };
    setPlaces([...places, newPlace]);
  };

  const handleExport = () => {
    window.print();
  };

  const generateAI = async (day: number) => {
    if (!meta) return;
    setIsGenerating(prev => ({ ...prev, [day]: true }));
    try {
      const suggestions = await generateItinerarySuggestions(meta.destination, day);
      setPlaces(prev => [...prev, ...suggestions]);
    } finally {
      setIsGenerating(prev => ({ ...prev, [day]: false }));
    }
  };

  if (!meta) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-clover-pixel">
        <div className="absolute top-10 left-10 text-[8px] font-digital uppercase tracking-[0.5em] text-green-300">STUDIO: ARKIV</div>
        <div className="absolute top-10 right-10 text-[8px] font-digital uppercase tracking-[0.5em] text-green-300">ARCHIVE: v10.0</div>
        
        <PixelClover className="absolute -top-40 -left-40 opacity-5" size={600} color="#84cc16" />
        <PixelClover className="absolute -bottom-40 -right-40 opacity-5" size={500} color="#fbbf24" outline />

        <div className="w-full max-w-5xl flex flex-col items-center gap-8 z-10">
          <div className="relative mb-8">
            <div className="script-overlay font-script" style={{ fontSize: '2.5rem', top: '-1.5rem' }}>Lucky</div>
            <h1 className="text-[6rem] md:text-[8rem] arkiv-logo-3d leading-none">ARKIV</h1>
            <p className="text-orange-500 text-xs tracking-[1em] uppercase font-bubbly font-black text-center -mt-2">MEMORIES ARCHIVE</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-4xl">
             <div className="w-40 h-40 rounded-[2.5rem] aircraft-icon-container flex items-center justify-center text-white animate-float flex-shrink-0">
                <Plane size={60} />
             </div>
             
             <div className="flex-1 space-y-4 text-center md:text-left">
                <p className="font-bubbly text-green-600 text-base max-w-xs">FOR BOLD LOOKS, RETRO ROOTS. START YOUR LUCKY JOURNEY ARCHIVE BELOW.</p>
                <form onSubmit={e => { e.preventDefault(); setMeta({ destination: tempDest, duration: tempDays }); }} className="space-y-3">
                  <input 
                    required
                    placeholder="TARGET DESTINATION..."
                    className="w-full bg-white/60 backdrop-blur-md border-b border-[#fbcfe8] py-4 px-6 rounded-full text-[#166534] text-xl font-retro focus:border-green-400 outline-none transition-all placeholder:text-green-200 shadow-md"
                    value={tempDest}
                    onChange={e => setTempDest(e.target.value)}
                  />
                  <button className="bg-[#4ade80] hover:bg-green-500 hover:scale-105 text-white font-black px-10 py-4 rounded-full text-lg tracking-[0.2em] uppercase transition-all shadow-md border border-white flex items-center gap-2">
                    LAUNCH <ArrowRight size={16} />
                  </button>
                </form>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-bubbly relative bg-clover-pixel">
      <header className="px-8 py-3 flex items-center justify-between sticky top-0 z-[100] glass-light print:hidden">
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer" onClick={() => setMeta(null)}>
             <span className="absolute -top-3 left-0 text-[7px] font-digital text-orange-400">@ARKIV_STUDIO</span>
             <h2 className="text-2xl arkiv-logo-3d">ARKIV</h2>
          </div>
          <div className="hidden lg:flex flex-col border-l border-[#fbcfe8] pl-6">
            <span className="text-[8px] font-digital text-green-600 tracking-widest uppercase">DATA REEL</span>
            <h1 className="text-lg font-retro text-orange-500 uppercase">{meta.destination}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setIsCurrencyOpen(true)} className="px-3 py-1.5 bg-white rounded-full border border-[#fbcfe8] text-green-600 hover:bg-pink-50 transition-all text-[10px]">
             <span className="font-black uppercase tracking-widest">EXCHANGE</span>
          </button>
          <button onClick={handleExport} className="bg-orange-400 text-white font-black px-6 py-2 rounded-full text-[10px] tracking-widest uppercase hover:scale-105 transition-all shadow-sm border border-white flex items-center gap-2">
            <Download size={12} /> EXPORT
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto custom-scrollbar px-10 py-8 relative z-10 flex h-full items-start gap-8 print:block print:overflow-visible">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          {Array.from({ length: meta.duration }, (_, i) => i + 1).map((dayNum) => (
            <DayColumn 
              key={dayNum}
              dayNum={dayNum}
              places={places.filter(p => p.day === dayNum)}
              addPlace={(day) => setActiveDayForAdd(day)}
              toggleVisited={toggleVisited}
              updateMemo={updateMemo}
              removePlace={removePlace}
              generateAI={generateAI}
              isGenerating={isGenerating[dayNum]}
            />
          ))}
          <button 
            onClick={() => setMeta(p => p ? { ...p, duration: p.duration + 1 } : null)}
            className="flex-none w-14 h-64 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-[#fbcfe8] hover:border-green-400 flex items-center justify-center text-pink-300 hover:text-green-500 transition-all shadow-sm print:hidden"
          >
            <Plus size={24} className="vertical-lr" />
          </button>
        </DndContext>
      </main>

      {/* Overlays */}
      <AddPlaceModal 
        isOpen={activeDayForAdd !== null} 
        onClose={() => setActiveDayForAdd(null)} 
        onAdd={(data) => activeDayForAdd && handleAddPlace(activeDayForAdd, data)} 
      />
      <CurrencyConverter isOpen={isCurrencyOpen} onClose={() => setIsCurrencyOpen(false)} />
      
      <footer className="px-10 py-4 border-t border-[#fbcfe8] bg-white/40 backdrop-blur-md flex items-center justify-between z-50 print:hidden">
         <div className="flex items-center gap-4">
            <span className="text-[8px] font-digital text-green-600 uppercase tracking-[0.4em]">STABILITY METER</span>
            <div className="w-48 h-2 bg-white rounded-full overflow-hidden border border-[#fbcfe8]">
               <div className="h-full bg-[#4ade80] rounded-full" style={{ width: `${places.length > 0 ? (places.filter(p => p.visited).length / places.length) * 100 : 0}%` }} />
            </div>
         </div>
         <div className="flex items-center gap-3">
            <PixelClover size={12} color="#84cc16" opacity={0.6} />
            <span className="text-[8px] font-black tracking-widest uppercase text-pink-300">ARKIV v10.0 • RETRO ROOTS</span>
         </div>
      </footer>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          .glass-light { background: transparent !important; backdrop-filter: none !important; border: none !important; }
          .bg-clover-pixel { background-image: none !important; background-color: white !important; }
          main { display: block !important; }
          .flex-none { width: 100% !important; margin-bottom: 2rem !important; break-inside: avoid; }
          .custom-scrollbar { overflow: visible !important; }
        }
      `}</style>
    </div>
  );
}

const CurrencyConverter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('KRW');
  const [amount, setAmount] = useState<number>(1);
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const syncRate = async () => {
    setLoading(true);
    try {
      const newRate = await getLiveExchangeRate(from, to);
      setRate(newRate);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen && !rate) syncRate(); }, [isOpen]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-pink-50/20 backdrop-blur-md">
      <div className="w-full max-sm bg-white rounded-[2rem] shadow-xl overflow-hidden border border-[#fbcfe8] animate-float p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center text-white shadow-md">
            <Coins size={16} />
          </div>
          <button onClick={onClose} className="text-pink-300 hover:text-pink-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <h2 className="text-2xl font-retro text-orange-500 mb-2 uppercase tracking-tighter">CURRENCY_SYNC</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-orange-50/50 p-2 rounded-xl border border-white">
            <select value={from} onChange={e => setFrom(e.target.value)} className="bg-transparent font-bubbly text-orange-900 outline-none flex-1 text-xs">
              {['USD', 'EUR', 'JPY', 'GBP', 'KRW'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ArrowRightLeft size={14} className="text-orange-200" />
            <select value={to} onChange={e => setTo(e.target.value)} className="bg-transparent font-bubbly text-orange-900 outline-none flex-1 text-xs">
              {['USD', 'EUR', 'JPY', 'GBP', 'KRW'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="bg-white p-3 rounded-xl border border-pink-50 shadow-inner">
            <input 
              type="number" 
              value={amount} 
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full bg-transparent text-2xl font-retro text-orange-500 outline-none"
            />
          </div>
          <button onClick={syncRate} className="w-full bg-orange-400 text-white font-black py-3 rounded-full flex items-center justify-center gap-2 text-sm shadow-md border border-white transition-all">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'REFRESH ARCHIVE'}
          </button>
        </div>
      </div>
    </div>
  );
};
