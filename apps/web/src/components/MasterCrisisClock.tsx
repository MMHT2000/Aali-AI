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
    <div
      style={{
        background: '#070f1a',
        borderBottom: '1px solid #1a2a3d',
        color: '#e2e8f0',
        padding: '0.45rem 1rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
        fontSize: '0.75rem',
        marginBottom: '0.75rem',
        borderRadius: '6px',
        border: '1px solid #1a2a3d',
      }}
    >
      {/* Ticking Master Clocks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              boxShadow: '0 0 8px #ef4444',
            }}
          />
          <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#fbbf24', fontSize: '0.85rem' }}>
            {bstTime} <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>BST (ঢাকা)</span>
          </span>
          <span style={{ color: '#64748b', fontFamily: 'monospace' }}>| {bstDate}</span>
          <span style={{ fontFamily: 'monospace', color: '#94a3b8' }}>[{utcTime} UTC]</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderLeft: '1px solid #1e293b', paddingLeft: '0.75rem' }}>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '3px',
              background: '#450a0a',
              color: '#f87171',
              border: '1px solid #991b1b',
              fontWeight: 'bold',
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
            }}
          >
            CRISIS: ACT (RED)
          </span>
          <span style={{ color: '#cbd5e1' }}>মুহুরী অববাহিকা প্লাবিত</span>
        </div>
      </div>

      {/* Ticker / Live Stats */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1' }}>
          <Radio size={14} color="#f87171" />
          <span style={{ color: '#94a3b8' }}>Cellular:</span>
          <strong style={{ color: '#f87171' }}>48 / 653</strong>
          <span style={{ color: '#64748b', fontSize: '0.65rem' }}>(92.6% down)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1', borderLeft: '1px solid #1e293b', paddingLeft: '0.75rem' }}>
          <Waves size={14} color="#38bdf8" />
          <span style={{ color: '#94a3b8' }}>Muhuri River:</span>
          <strong style={{ color: '#fbbf24' }}>13.85m</strong>
          <span style={{ color: '#f87171', fontWeight: 'bold', fontSize: '0.65rem' }}>(+0.75m DANGER)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#cbd5e1', borderLeft: '1px solid #1e293b', paddingLeft: '0.75rem' }}>
          <ShieldAlert size={14} color="#34d399" />
          <span style={{ color: '#94a3b8' }}>Blank-Gauge Guard:</span>
          <strong style={{ color: '#34d399' }}>ACTIVE</strong>
        </div>
      </div>
    </div>
  );
}
