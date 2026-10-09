import { useState } from 'react';
import { CircleMarker, MapContainer, TileLayer, Tooltip } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { OperationMapPoint } from '../lib/operations-client';
import 'leaflet/dist/leaflet.css';

interface OperationsMapProps {
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
  area: '#38bdf8', gauge: '#facc15', shelter: '#22c55e', asset: '#a78bfa', incident: '#fb7185', sos: '#f97316',
};

function marker(point: OperationMapPoint, layer: string, index: number) {
  const lat = Number(point.latitude);
  const lng = Number(point.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const label = point.name ?? point.label ?? point.id;
  return (
    <CircleMarker key={`${layer}-${point.id}-${index}`} center={[lat, lng] as LatLngExpression} radius={layer === 'incident' || layer === 'sos' ? 9 : 6} pathOptions={{ color: '#07111f', weight: 2, fillColor: color[layer], fillOpacity: 0.95 }}>
      <Tooltip direction="top" offset={[0, -6]}>
        <strong>{label}</strong><br />
        {point.status && <>{point.status}<br /></>}
        {point.peopleCount !== undefined && <>{point.peopleCount} people · </>}{point.provenance}
      </Tooltip>
    </CircleMarker>
  );
}

export function OperationsMap({ layers }: OperationsMapProps) {
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ area: true, gauge: true, shelter: true, asset: true, incident: true, sos: true });
  const layerItems: Array<[string, string, OperationMapPoint[]]> = [
    ['area', 'Areas', layers.areas], ['gauge', 'Gauges', layers.gauges], ['shelter', 'Shelters', layers.shelters],
    ['asset', 'Response assets', layers.assets], ['incident', 'Incidents', layers.incidents], ['sos', 'API SOS', layers.sos],
  ];

  return (
    <section className="ops-map-panel" aria-label="Feni operations map">
      <div className="ops-map-heading">
        <div><span className="eyebrow">GEOGRAPHIC OPERATIONS</span><h2>Feni district</h2></div>
        <span className="source-chip source-chip--synthetic">Synthetic exercise layers</span>
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
          {layerItems.filter(([key]) => enabled[key]).flatMap(([key, , points]) => points.map((point, index) => marker(point, key, index)))}
        </MapContainer>
      </div>
      {tilesUnavailable && <p className="map-warning" role="status">Basemap tiles are unavailable. The operations lists remain available below.</p>}
      <div className="ops-map-legend">
        {layerItems.map(([key, label]) => <span key={key}><i style={{ backgroundColor: color[key] }} />{label}</span>)}
      </div>
      <div className="ops-map-records">
        {layerItems.filter(([key]) => enabled[key]).map(([key, label, points]) => (
          <details key={key} open={key === 'incident' || key === 'sos'}>
            <summary>{label} <span>{points.length}</span></summary>
            {points.length === 0 ? <p className="muted">No {label.toLowerCase()} available in this snapshot.</p> : (
              <ul>{points.map((point) => <li key={point.id}><span>{point.name ?? point.label ?? point.id}</span><small>{point.status ?? point.provenance}</small></li>)}</ul>
            )}
          </details>
        ))}
      </div>
      <p className="map-attribution-note">Basemap © OpenStreetMap contributors. Markers use synthetic fixtures unless labelled API submitted.</p>
    </section>
  );
}
