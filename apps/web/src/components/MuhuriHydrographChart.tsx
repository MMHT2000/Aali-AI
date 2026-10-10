import { useState } from 'react';
import { Info, Waves } from 'lucide-react';

interface HydroPoint {
  time: string;
  level: number;
  source: string;
  isBlanked?: boolean;
}

const FENI_HYDROGRAPH_DATA: HydroPoint[] = [
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

const SYLHET_HYDROGRAPH_DATA: HydroPoint[] = [
  { time: '00:00', level: 9.30, source: 'BWDB Telemetered Gauge (Surma)' },
  { time: '03:00', level: 9.85, source: 'BWDB Telemetered Gauge (Surma)' },
  { time: '06:00', level: 10.40, source: 'BWDB Telemetered Gauge (Surma)' },
  { time: '09:00', level: 10.80, source: 'BWDB Telemetered Gauge (Warning 10.80m crossed)' },
  { time: '12:00', level: 11.10, source: 'BWDB Telemetered Gauge (Surma)' },
  { time: '15:00', level: 11.30, source: 'BWDB Telemetered Gauge (Danger 11.25m crossed)' },
  { time: '18:00', level: 11.60, source: 'Sensor Severed (Flash surge blackout)', isBlanked: true },
  { time: '21:00', level: 11.85, source: 'Volunteer Field Reading (CPP Companiganj)', isBlanked: false },
  { time: 'NOW', level: 11.95, source: 'Estimated / Volunteer Verified', isBlanked: false },
];

export function MuhuriHydrographChart({ districtCode = 'FENI_DIST' }: { districtCode?: string }) {
  const [hoveredPoint, setHoveredPoint] = useState<HydroPoint | null>(null);

  const isSylhet = districtCode === 'SYLHET_DIST';
  const data = isSylhet ? SYLHET_HYDROGRAPH_DATA : FENI_HYDROGRAPH_DATA;
  const riverName = isSylhet
    ? 'SURMA RIVER HYDROGRAPH · SYLHET POINT (সুরমা নদী হাইড্রোগ্রাফ · সিলেট পয়েন্ট গেজ)'
    : 'MUHURI RIVER HYDROGRAPH · PARSHURAM GAUGE (মুহুরী নদী হাইড্রোগ্রাফ · পরশুরাম গেজ)';

  const warningMark = isSylhet ? 10.80 : 12.05;
  const dangerMark = isSylhet ? 11.25 : 13.10;
  const minLevel = isSylhet ? 8.5 : 9.5;
  const maxLevel = isSylhet ? 12.8 : 15.0;
  const gridLevels = isSylhet ? [9.0, 10.0, 11.0, 12.0] : [10.0, 11.0, 12.0, 13.0, 14.0];
  const blankRuleText = isSylhet
    ? 'When Surma Point telemetry stopped at 18:00, 115mm Meghalaya-Cherrapunji rainfall triggered escalation to ACT.'
    : 'When Muhuri telemetry stopped at 18:00, 95mm upstream rainfall triggered escalation to ACT.';
  const riseRate = isSylhet ? '+32 cm/hr' : '+28 cm/hr';

  const width = 640;
  const height = 175;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 22;
  const paddingBottom = 28;

  const scaleX = (index: number) =>
    paddingLeft + (index / (data.length - 1)) * (width - paddingLeft - paddingRight);

  const scaleY = (level: number) =>
    paddingTop + ((maxLevel - level) / (maxLevel - minLevel)) * (height - paddingTop - paddingBottom);

  const dangerY = scaleY(dangerMark);
  const warningY = scaleY(warningMark);

  const points = data.map((p, i) => `${scaleX(i)},${scaleY(p.level)}`).join(' ');

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
          <Waves size={15} color={isSylhet ? '#38bdf8' : '#38bdf8'} />
          <strong style={{ fontSize: '0.78rem', letterSpacing: '0.04em', color: '#f1f5f9' }}>
            {riverName}
          </strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.68rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171', fontWeight: 'bold' }}>
            <span style={{ width: '8px', height: '2px', background: '#ef4444', display: 'inline-block' }}></span> Danger: {dangerMark.toFixed(2)}m
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 'bold' }}>
            <span style={{ width: '8px', height: '2px', background: '#f59e0b', display: 'inline-block' }}></span> Warning: {warningMark.toFixed(2)}m
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', background: '#070f1a', borderRadius: '4px', border: '1px solid #162438', overflow: 'hidden' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Grid lines */}
          {gridLevels.map((lvl) => {
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
            WARNING {warningMark.toFixed(2)}m
          </text>

          {/* Danger Level Line */}
          <line x1={paddingLeft} y1={dangerY} x2={width - paddingRight} y2={dangerY} stroke="#ef4444" strokeWidth="1.8" strokeDasharray="4,3" />
          <text x={width - paddingRight - 4} y={dangerY - 4} textAnchor="end" fontSize="8" fill="#ef4444" fontWeight="bold">
            DANGER {dangerMark.toFixed(2)}m (বিপৎসীমা)
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
          {data.map((p, i) => {
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
            <strong>Blank-Gauge Rule:</strong> {blankRuleText}
          </span>
        </span>
        <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontWeight: 'bold' }}>Rate: {riseRate}</span>
      </div>
    </div>
  );
}
