import { Injectable } from '@nestjs/common';
import { BrainArea, EnvironmentalData, Evidence, ForecastDay } from './brain.types';

function object(value: unknown): Record<string, unknown> { return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {}; }
function numeric(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null; }
function series(value: unknown): unknown[] { return Array.isArray(value) ? value : []; }
function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}

/** Fixed provider hosts only; callers cannot supply URLs. Model data and imagery remain separate. */
@Injectable()
export class EnvironmentalDataService {
  private readonly cache = new Map<string, { at: number; value: EnvironmentalData }>();
  private readonly pending = new Map<string, Promise<EnvironmentalData>>();

  async get(area: BrainArea): Promise<EnvironmentalData> {
    const cached = this.cache.get(area.id);
    if (cached && Date.now() - cached.at < 15 * 60000) return structuredClone(cached.value);
    const running = this.pending.get(area.id);
    if (running) return structuredClone(await running);
    const task = this.load(area);
    this.pending.set(area.id, task);
    try { const value = await task; this.cache.set(area.id, { at: Date.now(), value }); return structuredClone(value); }
    finally { this.pending.delete(area.id); }
  }

  private async read(url: string, body?: object): Promise<unknown> {
    const response = await fetch(url, { method: body ? 'POST' : 'GET', headers: body ? { 'Content-Type': 'application/json' } : {}, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(8000), redirect: 'error' });
    if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
    const raw = await response.text();
    if (raw.length > 2_000_000) throw new Error('Provider response exceeds limit');
    return JSON.parse(raw) as unknown;
  }

  private async load(area: BrainArea): Promise<EnvironmentalData> {
    const at = new Date().toISOString();
    const today = at.slice(0, 10);
    const dates = Array.from({ length: 7 }, (_, i) => new Date(Date.parse(`${today}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10));
    const days: ForecastDay[] = dates.map(date => ({ date, discharge: null, p25: null, p75: null, rainMm: null }));
    const evidence: Evidence[] = [];
    let grid: EnvironmentalData['grid'] = null;
    let imagery: EnvironmentalData['imagery'] = [];
    const floodUrl = `https://flood-api.open-meteo.com/v1/flood?latitude=${area.latitude}&longitude=${area.longitude}&daily=river_discharge,river_discharge_p25,river_discharge_p75&forecast_days=7&timezone=GMT`;
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${area.latitude}&longitude=${area.longitude}&daily=precipitation_sum&forecast_days=7&timezone=GMT`;
    await Promise.all([
      (async () => {
        const source: Evidence = { id: `${area.id}:glofas:${today}`, provider: 'OPEN_METEO_GLOFAS', kind: 'MODEL_FORECAST', status: 'UNAVAILABLE', fetchedAt: at, validAt: null, url: floodUrl, note: 'Copernicus GloFAS via Open-Meteo; daily m³/s, ~5 km. Retrieval time is not model issuance time; river-cell match unverified.' };
        try {
          const result = object(await this.read(floodUrl)); const daily = object(result.daily); const times = series(daily.time);
          if (object(result.daily_units).river_discharge !== 'm³/s') throw new Error('Discharge units missing');
          for (const day of days) { const index = times.indexOf(day.date); if (index >= 0) { day.discharge = numeric(series(daily.river_discharge)[index]); day.p25 = numeric(series(daily.river_discharge_p25)[index]); day.p75 = numeric(series(daily.river_discharge_p75)[index]); } }
          if (days.some(d => d.discharge !== null)) { source.status = days[0].discharge === null ? 'STALE' : 'AVAILABLE'; source.validAt = `${days.find(d => d.discharge !== null)!.date}T00:00:00Z`; }
          if (typeof result.latitude === 'number' && typeof result.longitude === 'number' && Number.isFinite(result.latitude) && Number.isFinite(result.longitude)) grid = { latitude: result.latitude, longitude: result.longitude };
        } catch { source.note += ' Provider unavailable or response invalid; no zero value is substituted.'; }
        evidence.push(source);
      })(),
      (async () => {
        const source: Evidence = { id: `${area.id}:weather:${today}`, provider: 'OPEN_METEO_WEATHER', kind: 'MODEL_FORECAST', status: 'UNAVAILABLE', fetchedAt: at, validAt: null, url: weatherUrl, note: 'Numerical weather forecast, not satellite-observed rainfall. UTC daily accumulation; model issuance time unavailable.' };
        try {
          const result = object(await this.read(weatherUrl)); const daily = object(result.daily); const times = series(daily.time);
          if (object(result.daily_units).precipitation_sum !== 'mm') throw new Error('Rainfall units missing');
          for (const day of days) { const index = times.indexOf(day.date); if (index >= 0) day.rainMm = numeric(series(daily.precipitation_sum)[index]); }
          if (days.some(d => d.rainMm !== null)) { source.status = days[0].rainMm === null ? 'STALE' : 'AVAILABLE'; source.validAt = `${days.find(d => d.rainMm !== null)!.date}T00:00:00Z`; }
        } catch { source.note += ' Provider unavailable or response invalid.'; }
        evidence.push(source);
      })(),
      (async () => {
        const url = 'https://earth-search.aws.element84.com/v1/search';
        const source: Evidence = { id: `${area.id}:sentinel:${today}`, provider: 'EARTH_SEARCH_SENTINEL2', kind: 'SATELLITE_IMAGE', status: 'UNAVAILABLE', fetchedAt: at, validAt: null, url: 'https://earth-search.aws.element84.com/v1', note: 'Copernicus Sentinel-2 L2A optical scene catalogue; imagery is context only, not flood detection. Acquisition time and cloud cover shown.' };
        try {
          const start = new Date(Date.now() - 30 * 86400000).toISOString();
          const result = object(await this.read(url, { collections: ['sentinel-2-l2a'], bbox: area.bounds, datetime: `${start}/${at}`, limit: 6, sortby: [{ field: 'properties.datetime', direction: 'desc' }] }));
          imagery = series(result.features).flatMap(feature => {
            const item = object(feature); const properties = object(item.properties); const assets = object(item.assets); const acquired = properties.datetime;
            if (typeof item.id !== 'string' || typeof acquired !== 'string' || !Number.isFinite(Date.parse(acquired)) || Date.parse(acquired) > Date.parse(at) || Date.parse(acquired) < Date.parse(start)) return [];
            const self = series(item.links).map(object).find(link => link.rel === 'self');
            const href = safeUrl(self?.href);
            if (!href) return [];
            return [{ id: item.id, acquiredAt: acquired, cloudPercent: numeric(properties['eo:cloud_cover']), thumbnail: safeUrl(object(assets.thumbnail).href), url: href }];
          });
          if (imagery.length) { source.validAt = imagery[0].acquiredAt; source.status = Date.parse(at) - Date.parse(imagery[0].acquiredAt) > 7 * 86400000 ? 'STALE' : 'AVAILABLE'; }
          else source.note += ' No usable scenes found in the last 30 days.';
        } catch { source.note += ' Catalogue unavailable; no image or flood extent invented.'; }
        evidence.push(source);
      })(),
    ]);
    evidence.sort((a, b) => a.provider.localeCompare(b.provider));
    return { evidence, days, imagery, grid };
  }
}

export function exerciseEnvironment(area: BrainArea, now = new Date()): EnvironmentalData {
  const at = now.toISOString();
  return { grid: null, imagery: [], evidence: [{ id: `${area.id}:exercise-weather`, provider: 'OPEN_METEO_WEATHER', kind: 'SYNTHETIC', status: 'AVAILABLE', fetchedAt: at, validAt: at, url: '', note: 'Synthetic heavy-rain exercise; not fetched from Open-Meteo.' }, { id: `${area.id}:exercise-river`, provider: 'OPEN_METEO_GLOFAS', kind: 'SYNTHETIC', status: 'AVAILABLE', fetchedAt: at, validAt: at, url: '', note: 'Synthetic river-discharge exercise; not a model observation.' }], days: [0, 1, 2].map((i) => ({ date: new Date(now.getTime() + i * 86400000).toISOString().slice(0, 10), discharge: [100, 155, 190][i], p25: [80, 120, 145][i], p75: [125, 190, 235][i], rainMm: [150, 95, 35][i] })) };
}
