import { useEffect, useState } from 'react';
import { Radio, ShieldAlert, Waves } from 'lucide-react';

export function MasterCrisisClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const bstTime = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(now);

  const bstDate = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now);

  const utcTime = now.toISOString().slice(11, 19);

  return (
    <div className="bg-slate-950 border-b border-slate-800 text-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
      {/* Ticking Master Clocks */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="font-mono font-bold tracking-wider text-amber-400 text-sm">
            {bstTime} <span className="text-[10px] text-slate-400">BST (ঢাকা)</span>
          </span>
          <span className="text-slate-500 font-mono">| {bstDate}</span>
          <span className="font-mono text-slate-400 ml-1">[{utcTime} UTC]</span>
        </div>
        <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-3">
          <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 font-bold uppercase tracking-wide text-[10px] animate-pulse">
            CRISIS LEVEL: RED (ACT)
          </span>
          <span className="text-slate-400">মুহুরী অববাহিকা প্লাবিত</span>
        </div>
      </div>

      {/* Ticker / Live Stats */}
      <div className="flex items-center gap-4 overflow-x-auto text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span className="text-slate-400">Cellular:</span>
          <strong className="text-red-400">48 / 653</strong>
          <span className="text-slate-500 text-[10px]">(92.6% severed)</span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-300 border-l border-slate-800 pl-3">
          <Waves className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-400">Muhuri River:</span>
          <strong className="text-amber-400">13.85m</strong>
          <span className="text-red-400 font-bold text-[10px]">(+0.75m DANGER)</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-slate-300 border-l border-slate-800 pl-3">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-400">Blank-Gauge Guard:</span>
          <strong className="text-emerald-400">ACTIVE</strong>
        </div>
      </div>
    </div>
  );
}
