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

  // SVG Coordinates setup
  const width = 560;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 25;
  const paddingBottom = 30;

  const minLevel = 9.5;
  const maxLevel = 15.0;

  const scaleX = (index: number) =>
    paddingLeft + (index / (HYDROGRAPH_DATA.length - 1)) * (width - paddingLeft - paddingRight);

  const scaleY = (level: number) =>
    paddingTop + ((maxLevel - level) / (maxLevel - minLevel)) * (height - paddingTop - paddingBottom);

  const dangerY = scaleY(13.10);
  const warningY = scaleY(12.05);

  // Build SVG path
  const points = HYDROGRAPH_DATA.map((p, i) => `${scaleX(i)},${scaleY(p.level)}`).join(' ');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-slate-100 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Muhuri River Hydrograph (মুহুরী নদী হাইড্রোগ্রাফ · Parshuram Gauge)
          </h4>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-red-400 font-semibold">
            <span className="w-2 h-0.5 bg-red-500 inline-block"></span> Danger: 13.10m
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-semibold">
            <span className="w-2 h-0.5 bg-amber-500 inline-block"></span> Warning: 12.05m
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden bg-slate-950 rounded border border-slate-800">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: '130px' }}
        >
          {/* Background grid lines */}
          {[10.0, 11.0, 12.0, 13.0, 14.0].map((lvl) => {
            const y = scaleY(lvl);
            return (
              <g key={lvl}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="2,2"
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9"
                  fill="#64748b"
                  fontFamily="monospace"
                >
                  {lvl.toFixed(1)}m
                </text>
              </g>
            );
          })}

          {/* Warning Level Line (12.05m) */}
          <line
            x1={paddingLeft}
            y1={warningY}
            x2={width - paddingRight}
            y2={warningY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
          <text
            x={width - paddingRight - 4}
            y={warningY - 4}
            textAnchor="end"
            fontSize="9"
            fill="#f59e0b"
            fontWeight="bold"
          >
            WARNING 12.05m
          </text>

          {/* Danger Level Line (13.10m) */}
          <line
            x1={paddingLeft}
            y1={dangerY}
            x2={width - paddingRight}
            y2={dangerY}
            stroke="#ef4444"
            strokeWidth="2"
            strokeDasharray="4,3"
          />
          <text
            x={width - paddingRight - 4}
            y={dangerY - 4}
            textAnchor="end"
            fontSize="9"
            fill="#ef4444"
            fontWeight="bold"
          >
            DANGER 13.10m (বিপৎসীমা)
          </text>

          {/* Sensor Blanking Shaded Zone between 18:00 and 21:00 */}
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

          {/* Water level polyline */}
          <polyline
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            points={points}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Fill gradient area under curve */}
          <polygon
            points={`${scaleX(0)},${height - paddingBottom} ${points} ${scaleX(HYDROGRAPH_DATA.length - 1)},${height - paddingBottom}`}
            fill="url(#waterGradient)"
            opacity="0.25"
          />

          <defs>
            <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Data Points */}
          {HYDROGRAPH_DATA.map((p, i) => {
            const cx = scaleX(i);
            const cy = scaleY(p.level);
            const isDanger = p.level >= 13.10;
            return (
              <g
                key={p.time}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={p.isBlanked ? 5 : 4}
                  fill={p.isBlanked ? '#ef4444' : isDanger ? '#f87171' : '#38bdf8'}
                  stroke="#0f172a"
                  strokeWidth="1.5"
                />
                {p.isBlanked && (
                  <circle cx={cx} cy={cy} r="8" fill="none" stroke="#ef4444" strokeWidth="1" className="animate-ping" />
                )}
                {/* X Axis labels */}
                <text
                  x={cx}
                  y={height - paddingBottom + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94a3b8"
                >
                  {p.time}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-2 left-12 bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-[11px] shadow-lg pointer-events-none">
            <span className="font-bold text-amber-300">{hoveredPoint.time}</span> ·{' '}
            <strong className="text-white">{hoveredPoint.level.toFixed(2)}m</strong>
            <div className="text-[10px] text-slate-400">{hoveredPoint.source}</div>
          </div>
        )}
      </div>

      {/* Scientific Explanation Footer */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>
            <strong>Blank-Gauge Rule:</strong> When telemetered sensor stopped at 18:00, 95mm upstream rain triggered automatic escalation to <strong>ACT</strong>.
          </span>
        </span>
        <span className="font-mono text-cyan-400 font-bold">Rise Rate: +28 cm/hr</span>
      </div>
    </div>
  );
}
