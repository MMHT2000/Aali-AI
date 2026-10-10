import { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Radio,
  RotateCcw,
  Sparkles,
  Volume2,
  Waves,
} from 'lucide-react';
import { apiFetch } from '../lib/authenticated-fetch';

interface StageDemoDirectorProps {
  onMomentTriggered?: (moment: number, title: string) => void;
  onRefresh?: () => void;
}

export function StageDemoDirector({ onMomentTriggered, onRefresh }: StageDemoDirectorProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeMoment, setActiveMoment] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const playChime = (freq = 880, duration = 0.25) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  };

  const triggerMoment = async (momentNum: number) => {
    setIsRunning(true);
    setActiveMoment(momentNum);

    try {
      if (momentNum === 1) {
        playChime(440, 0.4);
        setStatusMessage('⚡ Moment 1 Active: Feni Cellular Blackout (616 of 653 towers severed by August 2024 floodwaters).');
        await apiFetch('/api/v1/operations/demo-moment', {
          method: 'POST',
          body: JSON.stringify({ moment: 1, title: 'Feni Cellular Blackout' }),
        }).catch(() => {});
      } else if (momentNum === 2) {
        playChime(660, 0.35);
        setStatusMessage('🌊 Moment 2 Active: Blank-Gauge Escalation Rule triggered! Upstream gauge silent for 60m + 95mm rain -> Escalated to ACT (+8h lead time).');
        await apiFetch('/api/v1/operations/demo-moment', {
          method: 'POST',
          body: JSON.stringify({ moment: 2, title: 'Blank-Gauge Rule Escalation' }),
        }).catch(() => {});
      } else if (momentNum === 3) {
        playChime(987, 0.3);
        setStatusMessage('📡 Moment 3 Active: Starlink D2C Wi-Fi 42-byte SOS packet injected! Gemini Dialect NLP parsing in progress...');
        // Actually submit a live SOS over Starlink D2C Wi-Fi simulation
        const shortId = `D2C${Math.floor(Math.random() * 90 + 10)}`;
        await fetch('/api/v1/sos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Transport-Type': 'STARLINK_D2C_WIFI',
          },
          body: JSON.stringify({
            clientReportId: `SOS-STAGE-${shortId}-${Date.now().toString(36).toUpperCase()}`,
            village: 'Parshuram Bazar',
            peopleCount: 6,
            isTrapped: true,
            hasElderly: true,
            hasChild: true,
            hasMedicalNeed: false,
            residentPhone: '01819000001',
            messageOriginal: 'পরশুরাম বাজারে ৩ তলা ভবনে ৬ জন আটকা, বিদ্যুৎ নাই, পানি দ্রুত বাড়ছে',
          }),
        }).catch(() => {});
      } else if (momentNum === 4) {
        playChime(784, 0.3);
        setStatusMessage('🚤 Moment 4 Active: Engine Boat Red Crescent Unit 1 proposed (22km fuel range, spotlight equipped). Human review required (NO auto-dispatch).');
        await apiFetch('/api/v1/operations/demo-moment', {
          method: 'POST',
          body: JSON.stringify({ moment: 4, title: 'Rescue Boat Human Authorization' }),
        }).catch(() => {});
      } else if (momentNum === 5) {
        playChime(523, 0.4);
        setStatusMessage('📋 Moment 5 Active: Recovery Board & Tube-Well Equity Ledger loaded. Idempotent relief distribution guard verified.');
        await apiFetch('/api/v1/operations/demo-moment', {
          method: 'POST',
          body: JSON.stringify({ moment: 5, title: 'Post-Flood Tube-Well Equity' }),
        }).catch(() => {});
      }

      onMomentTriggered?.(momentNum, statusMessage || '');
      onRefresh?.();
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-slate-900 border-b border-indigo-900/60 shadow-lg text-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2">
        {/* Toggle Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Stage Demo Director · 5-Minute Pitch Orchestrator
            </span>
            <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 rounded px-1.5 py-0.5">
              1-Click Live Rehearsal
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono transition"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isOpen ? 'Collapse Controls' : 'Open Demo Director'}
          </button>
        </div>

        {/* 5 Moment Buttons */}
        {isOpen && (
          <div className="mt-2.5 pt-2 border-t border-slate-800/80">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => triggerMoment(1)}
                disabled={isRunning}
                className={`flex flex-col items-start p-2 rounded border text-left transition ${
                  activeMoment === 1
                    ? 'bg-red-950/80 border-red-500 text-red-200 ring-1 ring-red-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                  <span>0:00–0:30</span>
                  <Radio className="w-3 h-3 text-red-400" />
                </div>
                <strong className="text-xs text-white mt-0.5">1. Tower Blackout</strong>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">616 / 653 towers down</span>
              </button>

              <button
                type="button"
                onClick={() => triggerMoment(2)}
                disabled={isRunning}
                className={`flex flex-col items-start p-2 rounded border text-left transition ${
                  activeMoment === 2
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 ring-1 ring-amber-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                  <span>0:30–1:30</span>
                  <Waves className="w-3 h-3 text-amber-400" />
                </div>
                <strong className="text-xs text-white mt-0.5">2. Blank Gauge</strong>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Sensor dead + 95mm rain</span>
              </button>

              <button
                type="button"
                onClick={() => triggerMoment(3)}
                disabled={isRunning}
                className={`flex flex-col items-start p-2 rounded border text-left transition ${
                  activeMoment === 3
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                  <span>1:30–2:30</span>
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </div>
                <strong className="text-xs text-white mt-0.5">3. Starlink D2C SOS</strong>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">42-byte packet + Dialect AI</span>
              </button>

              <button
                type="button"
                onClick={() => triggerMoment(4)}
                disabled={isRunning}
                className={`flex flex-col items-start p-2 rounded border text-left transition ${
                  activeMoment === 4
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                  <span>2:30–3:30</span>
                  <Activity className="w-3 h-3 text-emerald-400" />
                </div>
                <strong className="text-xs text-white mt-0.5">4. Boat Review</strong>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Fuel range & Human signoff</span>
              </button>

              <button
                type="button"
                onClick={() => triggerMoment(5)}
                disabled={isRunning}
                className={`flex flex-col items-start p-2 rounded border text-left transition ${
                  activeMoment === 5
                    ? 'bg-purple-950/80 border-purple-500 text-purple-200 ring-1 ring-purple-500'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-500">
                  <span>3:30–4:30</span>
                  <AlertTriangle className="w-3 h-3 text-purple-400" />
                </div>
                <strong className="text-xs text-white mt-0.5">5. Tube-Well Equity</strong>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">142 wells + Idempotent ledger</span>
              </button>
            </div>

            {/* Live Narration Banner */}
            {statusMessage && (
              <div className="mt-2.5 p-2 bg-slate-950 border border-indigo-900/50 rounded flex items-center justify-between text-xs animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
                  <span className="text-slate-200 font-medium">{statusMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => onRefresh?.()}
                  className="px-2 py-0.5 bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 rounded text-[11px] font-mono flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" /> Sync Screen
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
