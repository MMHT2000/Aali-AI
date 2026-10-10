import { useState } from 'react';
import { Info, Waves } from 'lucide-react';

interface HydroPoint {
  time: string;
  level: number;
  source: string;
  isBlanked?: boolean;
}

const HYDROGRAPH_DATA: HydroPoint[] = [
  { time: '00:00', level: 10.20, source: 'BWDB Telemetered Gauge' },
  { time: '03:00', level: 10.75, source: 'BWDB Telemetered Gauge' },
  { time: '06:00', level: 11.40, source: 'BWDB Telemetered Gauge' },
  { time: '09:00', level: 12.05, source: 'BWDB Telemetered Gauge (Warning crossed)' },
  { time: '12:00', level: 12.65, source: 'BWDB Telemetered Gauge' },
  { time: '15:00', level: 13.15, source: 'BWDB Telemetered Gauge (Danger crossed)' },
  { time: '18:00', level: 13.60, source: 'Sensor Severed (Last transmit)', isBlanked: true },
  { time: '21:00', level: 13.85, source: 'Volunteer Field Reading (CPP Rahim)', isBlanked: false },
  { time: 'NOW', level: 13.90, source: 'Estimated / Volunteer Verified', isBlanked: false },
];

export function MuhuriHydrographChart() {
  const [hoveredPoint, setHoveredPoint] = useState<HydroPoint | null>(null);

  const width = 640;
  const height = 175;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 22;
  const paddingBottom = 28;

  const minLevel = 9.5;
  const maxLevel = 15.0;

  const scaleX = (index: number) =>
    paddingLeft + (index / (HYDROGRAPH_DATA.length - 1)) * (width - paddingLeft - paddingRight);

  const scaleY = (level: number) =>
    paddingTop + ((maxLevel - level) / (maxLevel - minLevel)) * (height - paddingTop - paddingBottom);

  const dangerY = scaleY(13.10);
  const warningY = scaleY(12.05);

  const points = HYDROGRAPH_DATA.map((p, i) => `${scaleX(i)},${scaleY(p.level)}`).join(' ');

  return (
    <div
      style={{
        background: '#0c1624',
        border: '1px solid #1c2b3e',
        borderRadius: '6px',
        padding: '0.65rem 0.85rem',
        color: '#e2e8f0',
        marginTop: '0.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Waves size={15} color="#38bdf8" />
          <strong style={{ fontSize: '0.78rem', letterSpacing: '0.04em', color: '#f1f5f9' }}>
            MUHURI RIVER HYDROGRAPH · PARSHURAM GAUGE (মুহুরী নদী হাইড্রোগ্রাফ)
          </strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.68rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: 'bold' }}>
            <span style={{ width: '8px', height: '2px', background: '#ef4444', display: 'inline-block' }}></span> Danger: 13.10m
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 'bold' }}>
            <span style={{ width: '8px', height: '2px', background: '#f59e0b', display: 'inline-block' }}></span> Warning: 12.05m
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', background: '#070f1a', borderRadius: '4px', border: '1px solid #162438', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Grid lines */}
          {[10.0, 11.0, 12.0, 13.0, 14.0].map((lvl) => {
            const y = scaleY(lvl);
            return (
              <g key={lvl}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#172538" strokeDasharray="2,2" />
                <text x={paddingLeft - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#64748b" fontFamily="monospace">
                  {lvl.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Warning Level Line */}
          <line x1={paddingLeft} y1={warningY} x2={width - paddingRight} y2={warningY} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,3" />
          <text x={width - paddingRight - 4} y={warningY - 4} textAnchor="end" fontSize="8" fill="#f59e0b" fontWeight="bold">
            WARNING 12.05m
          </text>

          {/* Danger Level Line */}
          <line x1={paddingLeft} y1={dangerY} x2={width - paddingRight} y2={dangerY} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="4,3" />
          <text x={width - paddingRight - 4} y={dangerY - 4} textAnchor="end" fontSize="8" fill="#ef4444" fontWeight="bold">
            DANGER 13.10m (বিপৎসীমা)
          </text>

          {/* Sensor Gap Zone */}
          <rect
            x={scaleX(6)}
            y={paddingTop}
            width={scaleX(7) - scaleX(6)}
            height={height - paddingTop - paddingBottom}
            fill="#ef4444"
            fillOpacity="0.12"
          />
          <text
            x={(scaleX(6) + scaleX(7)) / 2}
            y={paddingTop + 14}
            textAnchor="middle"
            fontSize="8"
            fill="#f87171"
            fontWeight="bold"
          >
            ⚠ GAUGE SEVERED
          </text>

          {/* Curve */}
          <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={points} strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {HYDROGRAPH_DATA.map((p, i) => {
            const cx = scaleX(i);
            const cy = scaleY(p.level);
            return (
              <g
                key={p.time}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle cx={cx} cy={cy} r={p.isBlanked ? 5 : 4} fill={p.isBlanked ? '#ef4444' : '#38bdf8'} stroke="#070f1a" strokeWidth="1.5" />
                <text x={cx} y={height - paddingBottom + 13} textAnchor="middle" fontSize="8.5" fill="#94a3b8" fontFamily="monospace">
                  {p.time}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredPoint && (
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '50px',
              background: '#0c1626',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '0.7rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            }}
          >
            <strong style={{ color: '#fbbf24' }}>{hoveredPoint.time}</strong> · <span style={{ color: '#fff' }}>{hoveredPoint.level.toFixed(2)}m</span>
            <div style={{ color: '#94a3b8', fontSize: '0.62rem' }}>{hoveredPoint.source}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem', color: '#94a3b8' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Info size={12} color="#38bdf8" />
          <span>
            <strong>Blank-Gauge Rule:</strong> When telemetry stopped at 18:00, 95mm upstream rainfall triggered escalation to <strong>ACT</strong>.
          </span>
        </span>
        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>Rate: +28 cm/hr</span>
      </div>
    </div>
  );
}
