import React, { useState, useEffect } from 'react';

const CURRENCIES = [
  { code: 'KRW', flag: '🇰🇷' }, { code: 'JPY', flag: '🇯🇵' },
  { code: 'SGD', flag: '🇸🇬' }, { code: 'AED', flag: '🇦🇪' }, { code: 'USD', flag: '🇺🇸' }
];

export const PlaceCard = ({ place, onUpdate, homeCurrency }) => {
  const [localCurrency, setLocalCurrency] = useState(place.currency || 'JPY');
  const [rate, setRate] = useState(0);

  useEffect(() => {
    fetch(`https://api.exchangerate-api.com/v4/latest/${localCurrency}`)
      .then(res => res.json())
      .then(data => setRate(data.rates[homeCurrency]))
      .catch(() => setRate(9.2));
  }, [localCurrency, homeCurrency]);

  const converted = (Number(place.cost || 0) * rate).toLocaleString();

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onUpdate({ ...place, photos: [...(place.photos || []), url] });
    }
  };

  return (
    <div className="film-card group overflow-hidden rounded-sm relative border border-white/5 mb-8 bg-zinc-900 shadow-2xl">
      <div className="h-64 relative bg-black/60">
        {place.photos?.[0] ? (
          <img src={place.photos[0]} className="w-full h-full object-cover opacity-70" alt="travel" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[9px] text-white/10 tracking-[0.5em] font-serif italic">Fragment of Time</div>
        )}
        <label className="absolute bottom-4 right-4 cursor-pointer bg-black/40 backdrop-blur-xl border border-white/10 p-2">
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          <span className="text-[9px] text-white/60 tracking-widest">CAPTURED</span>
        </label>
      </div>

      <div className="p-6 space-y-6">
        <h3 className="magazine-header text-3xl font-light uppercase text-[#d6cfc0] border-b border-white/5 pb-2">{place.name}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[8px] uppercase tracking-[0.3em] text-white/30 block">Spend</label>
            <div className="flex items-center gap-2 border-b border-white/10 pb-1">
              <select value={localCurrency} onChange={(e) => setLocalCurrency(e.target.value)} className="bg-transparent text-xs text-rose-300 outline-none">
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
              </select>
              <input type="number" value={place.cost || ''} onChange={(e) => onUpdate({ ...place, cost: e.target.value })} className="bg-transparent text-lg font-mono outline-none w-full text-white" />
            </div>
          </div>
          <div className="text-right space-y-2">
            <label className="text-[8px] uppercase tracking-[0.3em] text-rose-400/40 block">To {homeCurrency}</label>
            <p className="text-xl font-mono text-rose-400">≈ {converted}</p>
          </div>
        </div>
      </div>
    </div>
  );
};