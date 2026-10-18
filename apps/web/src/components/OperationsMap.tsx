import { useEffect, useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip, Popup, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { OperationMapPoint } from '../lib/operations-client';
import 'leaflet/dist/leaflet.css';

interface OperationsMapProps {
  selectedPointId?: string;
  onSelectPoint?: (point: OperationMapPoint) => void;
  districtCode?: string;
  layers: {
    areas: OperationMapPoint[];
    gauges: OperationMapPoint[];
    shelters: OperationMapPoint[];
    assets: OperationMapPoint[];
    incidents: OperationMapPoint[];
    sos: OperationMapPoint[];
  };
}

const color: Record<string, string> = {
  area: '#0ea5e9',
  gauge: '#0284c7',
  shelter: '#10b981',
  asset: '#8b5cf6',
  incident: '#f97316',
  sos: '#ef4444',
};

// Strict Bounding Box for Feni District
const FENI_CENTER: [number, number] = [23.015, 91.397];
const FENI_BOUNDS: [[number, number], [number, number]] = [
  [22.70, 91.05], // South-West of Feni District
  [23.45, 91.75], // North-East of Feni District
];

// Strict Bounding Box for Sylhet District (Surma / Kushiyara Basin)
const SYLHET_CENTER: [number, number] = [24.8949, 91.8687];
const SYLHET_BOUNDS: [[number, number], [number, number]] = [
  [24.40, 91.40], // South-West of Sylhet Basin
  [25.35, 92.45], // North-East of Sylhet Basin
];

// Helper hook to dynamically fly to active district center
function AutoRecenter({
  center,
  bounds,
  districtCode,
}: {
  center: [number, number];
  bounds: [[number, number], [number, number]];
  districtCode?: string;
}) {
  const map = useMap();
  useEffect(() => {
    // Release previous boundary restriction so map can freely pan between Feni and Sylhet
    map.setMaxBounds([[-90, -180], [90, 180]]);
    map.setView(center, 11, { animate: false });
    // Apply new district bounds after centering
    const timer = setTimeout(() => {
      map.setMaxBounds(bounds);
      map.invalidateSize();
    }, 50);
    return () => clearTimeout(timer);
  }, [center, bounds, districtCode, map]);
  return null;
}

// Helper component to recenter map on active district
function RecenterButton({ onRecenter, isSylhet }: { onRecenter: () => void; isSylhet: boolean }) {
  const map = useMap();
  const targetCenter = isSylhet ? SYLHET_CENTER : FENI_CENTER;
  const label = isSylhet ? '🎯 Focus Sylhet (সিলেট ফোকাস)' : '🎯 Focus Feni (ফেনী ফোকাস)';
  return (
    <div className="leaflet-top leaflet-right" style={{ pointerEvents: 'auto', margin: '10px 10px 0 0' }}>
      <button
        type="button"
        onClick={() => {
          map.setView(targetCenter, 11, { animate: true });
          onRecenter();
        }}
        title={label}
        style={{
          background: '#0f172a',
          color: isSylhet ? '#60a5fa' : '#38bdf8',
          border: `1px solid ${isSylhet ? '#3b82f6' : '#38bdf8'}`,
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        {label}
      </button>
    </div>
  );
}

// Robust coordinate resolver: supports both Sylhet and Feni coordinate domains
function resolveCoordinates(point: OperationMapPoint, isSylhet = false): [number, number] | null {
  if (point.latitude == null || point.longitude == null) return null;
  const lat = Number(point.latitude), lng = Number(point.longitude);
  const inArea = isSylhet ? lat >= 24.3 && lat <= 25.4 && lng >= 91.3 && lng <= 92.5 : lat >= 22.7 && lat <= 23.5 && lng >= 91.0 && lng <= 91.8;
  return Number.isFinite(lat) && Number.isFinite(lng) && inArea ? [lat, lng] : null;
}

function marker(
  point: OperationMapPoint,
  layer: string,
  index: number,
  selectedPointId?: string,
  onSelectPoint?: (point: OperationMapPoint) => void,
  isSylhet = false,
) {
  const coordinates = resolveCoordinates(point, isSylhet);
  if (!coordinates) return null;
  const [lat, lng] = coordinates;
  const label = point.label ?? point.name ?? point.id;
  const selected = point.id === selectedPointId;
  const isUrgent = layer === 'sos' || layer === 'incident';
  const radius = selected ? 13 : isUrgent ? 9 : 7;

  return (
    <CircleMarker
      key={`${layer}-${point.id}-${index}`}
      center={[lat, lng] as LatLngExpression}
      radius={radius}
      pathOptions={{
        color: selected ? '#ffffff' : isUrgent ? '#ffffff' : '#0f172a',
        weight: selected ? 3 : isUrgent ? 2.5 : 1.5,
        fillColor: color[layer],
        fillOpacity: selected ? 1 : 0.9,
      }}
      eventHandlers={onSelectPoint ? { click: () => onSelectPoint(point) } : undefined}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <span><strong>[{layer.toUpperCase()}]</strong> {label} · {point.status ?? point.provenance}</span>
      </Tooltip>
      <Popup>
        <div style={{ minWidth: '180px', color: '#0f172a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                background: color[layer],
                color: '#fff',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {layer.toUpperCase()}
            </span>
            <strong style={{ fontSize: '13px' }}>{point.shortId ? `ID: ${point.shortId}` : point.id.slice(0, 8)}</strong>
          </div>
          <p style={{ margin: '4px 0', fontSize: '12px', fontWeight: 'bold' }}>{label}</p>
          <div style={{ fontSize: '11px', color: '#475569', margin: '4px 0' }}>
            <div>Status: <strong>{point.status ?? 'ACTIVE'}</strong></div>
            {point.peopleCount != null && <div>People: <strong>{point.peopleCount}</strong></div>}
            <div>Coordinates: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E</div>
          </div>
          {onSelectPoint && (
            <button
              type="button"
              onClick={() => onSelectPoint(point)}
              style={{
                marginTop: '6px',
                width: '100%',
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Inspect in Operations Rail
            </button>
          )}
        </div>
      </Popup>
    </CircleMarker>
  );
}

export function OperationsMap({ layers, selectedPointId, onSelectPoint, districtCode = 'FENI_DIST' }: OperationsMapProps) {
  const isSylhet = districtCode === 'SYLHET_DIST';
  const center = isSylhet ? SYLHET_CENTER : FENI_CENTER;
  const maxBounds = isSylhet ? SYLHET_BOUNDS : FENI_BOUNDS;

  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    area: true,
    gauge: true,
    shelter: true,
    asset: true,
    incident: true,
    sos: true,
  });

  const layerItems: Array<[string, string, OperationMapPoint[]]> = [
    ['area', 'Areas', layers.areas],
    ['gauge', 'Gauges', layers.gauges],
    ['shelter', 'Shelters', layers.shelters],
    ['asset', 'Assets', layers.assets],
    ['incident', 'Incidents', layers.incidents],
    ['sos', 'SOS', layers.sos],
  ];

  return (
    <section className="ops-map-panel situation-map" aria-label={`${isSylhet ? 'Sylhet' : 'Feni'} operations map`}>
      <div className="ops-map-heading">
        <div>
          <span className="eyebrow">SHARED OPERATING PICTURE</span>
          <h2>{isSylhet ? 'Sylhet District Command (সিলেট জেলা মানচিত্র)' : 'Feni District Command (ফেনী জেলা মানচিত্র)'}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              background: isSylhet ? '#1e3a8a' : '#064e3b',
              color: isSylhet ? '#93c5fd' : '#34d399',
              border: `1px solid ${isSylhet ? '#3b82f6' : '#059669'}`,
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 'bold',
            }}
          >
            {isSylhet ? 'Bounds Locked · Sylhet Basin Only' : 'Bounds Locked · Feni Only'}
          </span>
          <span className="source-chip source-chip--synthetic">
            {layers.sos.length} SOS · {layers.incidents.length} Incidents
          </span>
        </div>
      </div>

      <div className="ops-layer-toggle" aria-label="Map layers">
        {layerItems.map(([key, title, pts]) => (
          <label key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={enabled[key]}
              onChange={(event) => setEnabled((current) => ({ ...current, [key]: event.target.checked }))}
            />
            <span style={{ color: color[key], fontWeight: 'bold' }}>{title}</span>
            <small style={{ color: '#94a3b8' }}>({pts.length})</small>
          </label>
        ))}
      </div>

      <div className="ops-map-frame" style={{ position: 'relative' }}>
        <MapContainer
          key={districtCode || 'FENI_DIST'}
          center={center}
          zoom={11}
          minZoom={9}
          maxZoom={18}
          maxBounds={maxBounds}
          maxBoundsViscosity={1.0}
          scrollWheelZoom
          className="ops-leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => setTilesUnavailable(true),
              tileload: () => setTilesUnavailable(false),
            }}
          />
          <AutoRecenter center={center} bounds={maxBounds} districtCode={districtCode} />
          <RecenterButton isSylhet={isSylhet} onRecenter={() => {}} />
          {layerItems
            .filter(([key]) => enabled[key])
            .flatMap(([key, , points]) =>
              points.map((point, index) => marker(point, key, index, selectedPointId, onSelectPoint, isSylhet)),
            )}
        </MapContainer>
      </div>

      {tilesUnavailable && (
        <p className="map-warning" role="status">
          Basemap tiles could not load. Records with valid coordinates and the list below remain available.
        </p>
      )}

      <div className="ops-map-legend">
        {layerItems.map(([key, label, pts]) => (
          <span key={key}>
            <i style={{ backgroundColor: color[key] }} />
            {label} ({pts.length})
          </span>
        ))}
      </div>

      <div className="ops-map-records">
        <p className="map-list-heading">Map records — click to select and focus</p>
        {layerItems
          .filter(([key]) => enabled[key])
          .map(([key, label, points]) => (
            <details key={key} open={key === 'incident' || key === 'sos'}>
              <summary>
                {label} <span>{points.length}</span>
              </summary>
              {points.length === 0 ? (
                <p className="muted">No {label.toLowerCase()} available in this snapshot.</p>
              ) : (
                <ul>
                  {points.map((point) => (
                    <li key={point.id}>
                      <button
                        type="button"
                        className="map-record-button"
                        aria-pressed={point.id === selectedPointId}
                        onClick={() => onSelectPoint?.(point)}
                      >
                        <span>{point.name ?? point.label ?? point.id}</span>
                        <small>{point.status ?? point.provenance}{!resolveCoordinates(point, isSylhet) && ' ? Coordinates unavailable; not plotted'}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          ))}
      </div>
      <p className="map-attribution-note">
        Feni District Disaster Resilience Map · Centered on Feni Upazilas (Parshuram, Fulgazi, Chhagalnaiya, Sonagazi, Sadar) · Leaflet locked.
      </p>
    </section>
  );
}
