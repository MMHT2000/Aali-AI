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
import { sendSimulationControl, toggleGaugeBlackout } from '../lib/operations-client';

interface StageDemoDirectorProps {
  districtCode?: string;
  onMomentTriggered?: (moment: number, title: string) => void;
  onRefresh?: () => void;
}

export function StageDemoDirector({ districtCode = 'FENI_DIST', onMomentTriggered, onRefresh }: StageDemoDirectorProps) {
  const isSylhet = districtCode === 'SYLHET_DIST';
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
    } catch { /* Visual demo controls remain usable when audio is unavailable. */ }
  };

  const triggerMoment = async (momentNum: number) => {
    setIsRunning(true);
    setActiveMoment(momentNum);

    try {
      if (momentNum === 1) {
        playChime(440, 0.4);
        const m1Title = isSylhet ? 'Sylhet Cellular & Power Blackout' : 'Feni Cellular Blackout';
        setStatusMessage(isSylhet 
          ? '⚡ Moment 1 Active: Sylhet Cellular & Power Blackout (84% land inundated in Companiganj & Gowainghat, Kumargaon substation flooded).'
          : '⚡ Moment 1 Active: Feni Cellular Blackout (616 of 653 towers severed by August 2024 floodwaters).');
        await sendSimulationControl('connectivity', { internetAvailable: false }).catch(() => {});
        await apiFetch('/api/v1/operations/demo-moment', {
          method: 'POST',
          body: JSON.stringify({ moment: 1, title: m1Title }),
        }).catch(() => {});
      } else if (momentNum === 2) {
        playChime(660, 0.35);
        const m2Title = isSylhet ? 'Surma Point Gauge Escalation' : 'Blank-Gauge Rule Escalation';
        setStatusMessage(isSylhet
          ? '🌊 Moment 2 Active: Surma Point Escalation Rule triggered! Upstream gauge silent for 60m + 160mm rain -> Escalated to ACT (+18h lead time).'
          : '🌊 Moment 2 Active: Blank-Gauge Escalation Rule triggered! Upstream gauge silent for 60m + 95mm rain -> Escalated to ACT (+8h lead time).');
        await toggleGaugeBlackout(false).catch(() => {});
        await apiFetch('/api/v1/operations/demo-moment', {
          method: 'POST',
          body: JSON.stringify({ moment: 2, title: m2Title }),
        }).catch(() => {});
      } else if (momentNum === 3) {
        playChime(987, 0.3);
        const m3Village = isSylhet ? 'Companiganj Bazar' : 'Parshuram Bazar';
        const m3Text = isSylhet 
          ? 'কোম্পানীগঞ্জ বাজারে ৩ তলা ভবনে ৬ জন আটকা, বিদ্যুৎ নাই, পানি দ্রুত বাড়ছে'
          : 'পরশুরাম বাজারে ৩ তলা ভবনে ৬ জন আটকা, বিদ্যুৎ নাই, পানি দ্রুত বাড়ছে';
        setStatusMessage('📡 Moment 3 Active: Starlink D2C Wi-Fi 42-byte SOS packet injected! Gemini Dialect NLP parsing in progress...');
        const shortId = `D2C${Math.floor(Math.random() * 90 + 10)}`;
        await apiFetch('/api/v1/sos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Transport-Type': 'STARLINK_D2C_WIFI',
          },
          body: JSON.stringify({
            clientReportId: `SOS-STAGE-${shortId}-${Date.now().toString(36).toUpperCase()}`,
            village: m3Village,
            peopleCount: 6,
            isTrapped: true,
            hasElderly: true,
            hasChild: true,
            hasMedicalNeed: false,
            residentPhone: '01819000001',
            messageOriginal: m3Text,
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

  const buttonStyle = (moment: number) => ({
    background: activeMoment === moment ? '#1e293b' : '#0c1626',
    border: activeMoment === moment ? '1px solid #38bdf8' : '1px solid #1e293b',
    borderRadius: '6px',
    padding: '0.45rem 0.65rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
    flex: '1',
    minWidth: '130px',
  });

  return (
    <div
      style={{
        background: '#0a1424',
        border: '1px solid #1e293b',
        borderRadius: '6px',
        padding: '0.5rem 0.85rem',
        marginBottom: '0.75rem',
        color: '#e2e8f0',
      }}
    >
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={15} color="#fbbf24" />
          <strong style={{ fontSize: '0.78rem', letterSpacing: '0.05em', color: '#7dd3fc' }}>
            STAGE DEMO DIRECTOR · 5-MINUTE LIVE PITCH
          </strong>
          <span style={{ fontSize: '0.65rem', background: '#1e3a8a', color: '#93c5fd', padding: '1px 6px', borderRadius: '3px' }}>
            1-Click Rehearsal
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.72rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          <span>{isOpen ? 'Collapse' : 'Expand Director'}</span>
        </button>
      </div>

      {isOpen && (
        <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #162438' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => triggerMoment(1)} disabled={isRunning} style={buttonStyle(1)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>0:00–0:30</span>
                <Radio size={12} color="#f87171" />
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#fff' }}>1. Tower Blackout</strong>
              <small style={{ color: '#94a3b8', fontSize: '0.62rem' }}>616 towers severed</small>
            </button>

            <button type="button" onClick={() => triggerMoment(2)} disabled={isRunning} style={buttonStyle(2)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>0:30–1:30</span>
                <Waves size={12} color="#fbbf24" />
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#fff' }}>2. Blank Gauge</strong>
              <small style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Silent sensor + 95mm rain</small>
            </button>

            <button type="button" onClick={() => triggerMoment(3)} disabled={isRunning} style={buttonStyle(3)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>1:30–2:30</span>
                <Sparkles size={12} color="#38bdf8" />
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#fff' }}>3. Starlink D2C SOS</strong>
              <small style={{ color: '#94a3b8', fontSize: '0.62rem' }}>42-byte packet + Dialect AI</small>
            </button>

            <button type="button" onClick={() => triggerMoment(4)} disabled={isRunning} style={buttonStyle(4)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>2:30–3:30</span>
                <Activity size={12} color="#4ade80" />
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#fff' }}>4. Boat Review</strong>
              <small style={{ color: '#94a3b8', fontSize: '0.62rem' }}>Fuel range & Human signoff</small>
            </button>

            <button type="button" onClick={() => triggerMoment(5)} disabled={isRunning} style={buttonStyle(5)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: '#64748b' }}>
                <span>3:30–4:30</span>
                <AlertTriangle size={12} color="#c084fc" />
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#fff' }}>5. Tube-Well Equity</strong>
              <small style={{ color: '#94a3b8', fontSize: '0.62rem' }}>142 wells + Idempotent ledger</small>
            </button>
          </div>

          {statusMessage && (
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.45rem 0.75rem',
                background: '#06101e',
                border: '1px solid #1e3a5f',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.73rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Volume2 size={14} color="#fbbf24" />
                <span style={{ color: '#e2e8f0' }}>{statusMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => onRefresh?.()}
                style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  color: '#93c5fd',
                  padding: '2px 8px',
                  borderRadius: '3px',
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <RotateCcw size={11} /> Sync Screen
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
