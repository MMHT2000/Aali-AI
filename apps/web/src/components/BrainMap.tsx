import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, Popup, Rectangle, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import type { BrainArea, BrainPlan } from '../lib/brain-client';
import 'leaflet/dist/leaflet.css';

const riskColors: Record<string, string> = { HIGH: '#fb7185', ELEVATED: '#fbbf24', MONITOR: '#38bdf8', UNKNOWN: '#a8a6c8' };
const nationalBounds: LatLngBoundsExpression = [[21.7, 88.5], [26.4, 92.5]];
function Viewport({ area, overview }: { area?: BrainArea; overview: boolean }) {
  const map = useMap();
  useEffect(() => {
    const bounds: LatLngBoundsExpression = overview || !area ? nationalBounds : [[area.bounds[1], area.bounds[0]], [area.bounds[3], area.bounds[2]]];
    const animate = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    map.fitBounds(bounds, { padding: [25, 25], animate, duration: 0.7 });
  }, [area, overview, map]);
  return null;
}

export default function BrainMap({ areas, areaId, plan, mode, running, statuses, onSelect }: {
  areas: BrainArea[]; areaId: string; plan: BrainPlan | null; mode: string; running: boolean;
  statuses: Record<string, { status: string; riskLevel?: string }>;
  onSelect: (id: string) => void;
}) {
  const [overview, setOverview] = useState(true);
  const [tilesFailed, setTilesFailed] = useState(false);
  const [shelters, setShelters] = useState(true);
  const area = areas.find(item => item.id === areaId);
  const current = plan?.areaId === areaId && plan.mode === mode ? plan : null;
  return <section className="brain-card brain-geography" aria-label="Area intelligence map">
    <div className="brain-section-title"><div><span className="brain-eyebrow">AREA INTELLIGENCE · {mode}</span><h2>See where the system is watching</h2></div><span className={`brain-worker-badge ${running ? 'is-running' : ''}`}>{running ? 'Checking evidence' : 'Saved monitoring results'}</span></div>
    <p>Markers locate monitoring profiles. Colours show experimental screening rules, not measured flood extent. Unchecked areas remain unknown.</p>
    <div className="brain-map-toolbar"><button onClick={() => setOverview(true)} aria-pressed={overview}>All six areas</button><button onClick={() => setOverview(false)} aria-pressed={!overview}>Focus selected area</button><label className="brain-auto"><input type="checkbox" checked={shelters} onChange={event => setShelters(event.target.checked)} /> Shelter layer</label></div>
    <div className="brain-map-frame">
      <MapContainer center={[24.1, 90.7]} zoom={7} minZoom={5} maxZoom={16} scrollWheelZoom={false} className="brain-leaflet-map">
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" eventHandlers={{ tileerror: () => setTilesFailed(true) }} />
        <Viewport area={area} overview={overview} />
        {areas.map(item => {
          const level = current?.areaId === item.id ? current.risk.level : statuses[`${item.id}:${mode}`]?.riskLevel ?? 'UNKNOWN';
          const selected = item.id === areaId;
          return <CircleMarker key={item.id} center={[item.latitude, item.longitude]} radius={selected ? 13 : 9} pathOptions={{ color: selected ? '#ffffff' : riskColors[level], weight: selected ? 3 : 2, fillColor: riskColors[level], fillOpacity: 0.85, className: running && selected ? 'brain-monitor-pulse' : '' }} eventHandlers={{ click: () => { onSelect(item.id); setOverview(false); } }}>
            <Tooltip direction="top" permanent={overview}>{item.name.split(' · ')[0]} · {level}</Tooltip>
            <Popup><strong>{item.name}</strong><p>{item.basin}</p><p>{level} · prototype rule output</p><button onClick={() => { onSelect(item.id); setOverview(false); }}>Inspect this area</button></Popup>
          </CircleMarker>;
        })}
        {area && !overview && <Rectangle bounds={[[area.bounds[1], area.bounds[0]], [area.bounds[3], area.bounds[2]]]} pathOptions={{ color: '#38bdf8', weight: 1, dashArray: '6 6', fillOpacity: 0.04 }}><Tooltip>Analysis bounds · not a flood boundary</Tooltip></Rectangle>}
        {current?.environment.grid && <CircleMarker center={[current.environment.grid.latitude, current.environment.grid.longitude]} radius={6} pathOptions={{ color: '#c084fc', fillOpacity: 1 }}><Tooltip>GloFAS selected model cell · river match unverified</Tooltip></CircleMarker>}
        {shelters && current?.operations.shelters.filter(shelter => Number.isFinite(shelter.latitude) && Number.isFinite(shelter.longitude)).map(shelter => <CircleMarker key={shelter.id} center={[shelter.latitude, shelter.longitude]} radius={6} pathOptions={{ color: '#5eead4', fillColor: '#0f766e', fillOpacity: 1 }}><Tooltip>{shelter.name} · synthetic shelter</Tooltip><Popup><strong>{shelter.name}</strong><p>Synthetic exercise · capacity {shelter.capacity}. Occupancy and access unverified. No reservation.</p></Popup></CircleMarker>)}
      </MapContainer>
    </div>
    {tilesFailed && <p role="status">Basemap tiles could not load. Area markers and the area list remain available; use the list below.</p>}
    <div className="brain-map-legend"><span><i style={{ background: '#fb7185' }} />High</span><span><i style={{ background: '#fbbf24' }} />Elevated</span><span><i style={{ background: '#38bdf8' }} />Monitor</span><span><i style={{ background: '#a8a6c8' }} />Unknown</span><span><i style={{ background: '#5eead4' }} />Synthetic shelter</span><span><i style={{ background: '#c084fc' }} />Model cell</span></div>
    <div className="brain-area-list" aria-label="Monitoring areas">{areas.map(item => <button key={item.id} aria-pressed={areaId === item.id} onClick={() => { onSelect(item.id); setOverview(false); }}><strong>{item.name}</strong><small>{item.basin} · {statuses[`${item.id}:${mode}`]?.status.replaceAll('_', ' ') ?? 'Not checked this session'}</small></button>)}</div>
    {current?.mode === 'LIVE' && <small>Verified live shelters and rescue coordinates are unavailable. No locations are guessed.</small>}
  </section>;
}
