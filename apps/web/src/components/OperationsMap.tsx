import { useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { OperationMapPoint } from '../lib/operations-client';
import 'leaflet/dist/leaflet.css';

interface OperationsMapProps {
  selectedPointId?: string;
  onSelectPoint?: (point: OperationMapPoint) => void;
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
  area: '#4aa6c8', gauge: '#e2b45a', shelter: '#56b995', asset: '#a78bfa', incident: '#ed7c83', sos: '#e36850',
};

function marker(point: OperationMapPoint, layer: string, index: number, selectedPointId?: string, onSelectPoint?: (point: OperationMapPoint) => void) {
  const lat = Number(point.latitude);
  const lng = Number(point.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const label = point.label ?? point.name ?? point.id;
  const selected = point.id === selectedPointId;
  return (
    <CircleMarker
      key={`${layer}-${point.id}-${index}`}
      center={[lat, lng] as LatLngExpression}
      radius={selected ? 10 : layer === 'sos' || layer === 'incident' ? 8 : 6}
      pathOptions={{ color: selected ? '#f8fafc' : '#101820', weight: selected ? 3 : 2, fillColor: color[layer], fillOpacity: selected ? 1 : 0.88 }}
      eventHandlers={onSelectPoint ? { click: () => onSelectPoint(point) } : undefined}
    >
      <Tooltip direction="top" offset={[0, -8]}>
        <span>{label} - {point.status ?? point.provenance}</span>
      </Tooltip>
    </CircleMarker>
  );
}

export function OperationsMap({ layers, selectedPointId, onSelectPoint }: OperationsMapProps) {
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ area: true, gauge: true, shelter: true, asset: true, incident: true, sos: true });
  const layerItems: Array<[string, string, OperationMapPoint[]]> = [
    ['area', 'Areas', layers.areas], ['gauge', 'Gauges', layers.gauges], ['shelter', 'Shelters', layers.shelters],
    ['asset', 'Assets', layers.assets], ['incident', 'Incidents', layers.incidents], ['sos', 'SOS', layers.sos],
  ];

  return (
    <section className="ops-map-panel situation-map" aria-label="Feni operations map">
      <div className="ops-map-heading">
        <div><span className="eyebrow">SHARED OPERATING PICTURE</span><h2>Feni district</h2></div>
        <span className="source-chip source-chip--synthetic">Synthetic layers</span>
      </div>
      <div className="ops-layer-toggle" aria-label="Map layers">
        {layerItems.map(([key, title]) => (
          <label key={key}><input type="checkbox" checked={enabled[key]} onChange={(event) => setEnabled((current) => ({ ...current, [key]: event.target.checked }))} />{title}</label>
        ))}
      </div>
      <div className="ops-map-frame">
        <MapContainer center={[23.16, 91.42]} zoom={9} scrollWheelZoom className="ops-leaflet-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTilesUnavailable(true), tileload: () => setTilesUnavailable(false) }}
          />
          {layerItems.filter(([key]) => enabled[key]).flatMap(([key, , points]) => points.map((point, index) => marker(point, key, index, selectedPointId, onSelectPoint)))}
        </MapContainer>
      </div>
      {tilesUnavailable && <p className="map-warning" role="status">Basemap tiles are unavailable. The operations lists remain available below.</p>}
      <div className="ops-map-legend">
        {layerItems.map(([key, label]) => <span key={key}><i style={{ backgroundColor: color[key] }} />{label}</span>)}
      </div>
      <div className="ops-map-records">
        <p className="map-list-heading">Map records - select a record to inspect</p>
        {layerItems.filter(([key]) => enabled[key]).map(([key, label, points]) => (
          <details key={key} open={key === 'incident' || key === 'sos'}>
            <summary>{label} <span>{points.length}</span></summary>
            {points.length === 0 ? <p className="muted">No {label.toLowerCase()} available in this snapshot.</p> : (
              <ul>{points.map((point) => (
                <li key={point.id}>
                  <button type="button" className="map-record-button" aria-pressed={point.id === selectedPointId} onClick={() => onSelectPoint?.(point)}>
                    <span>{point.name ?? point.label ?? point.id}</span><small>{point.status ?? point.provenance}{point.latitude == null || point.longitude == null ? ' - unmapped' : ''}</small>
                  </button>
                </li>
              ))}</ul>
            )}
          </details>
        ))}
      </div>
      <p className="map-attribution-note">Basemap © OpenStreetMap contributors. Markers use synthetic fixtures unless labelled API submitted.</p>
    </section>
  );
}
