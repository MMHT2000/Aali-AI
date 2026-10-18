import { EnvironmentalDataService } from './environmental-data.service';
import { BRAIN_AREAS } from './brain.types';

describe('free environmental providers', () => {
  const original = global.fetch;
  afterEach(() => { global.fetch = original; jest.useRealTimers(); });
  function mockFetch(weather: unknown = { daily_units: { precipitation_sum: 'mm' }, daily: { time: ['2026-10-18'], precipitation_sum: [130] } }) {
    jest.useFakeTimers().setSystemTime(new Date('2026-10-18T10:00:00Z'));
    global.fetch = jest.fn(async (input: string | URL | Request) => {
      const url = String(input);
      return new Response(JSON.stringify(url.includes('flood-api') ? { latitude: 23.2, longitude: 91.4, daily_units: { river_discharge: 'm³/s' }, daily: { time: ['2026-10-18', '2026-10-19'], river_discharge: [100, 150], river_discharge_p25: [80, null], river_discharge_p75: [120, 190] } } : url.includes('earth-search') ? { features: [{ id: 'scene', properties: { datetime: '2026-10-17T10:00:00Z', 'eo:cloud_cover': 90 }, assets: { thumbnail: { href: 'https://example.com/scene.jpg' } }, links: [{ rel: 'self', href: 'https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/scene' }] }] } : weather));
    }) as typeof fetch;
  }
  it('parses units, dates, null ensembles, and acquisition dates without calling rainfall satellite observations', async () => {
    mockFetch(); const result = await new EnvironmentalDataService().get(BRAIN_AREAS[0]);
    expect(result.days[0].rainMm).toBe(130); expect(result.days[1].p25).toBeNull(); expect(result.imagery[0].cloudPercent).toBe(90);
    expect(result.evidence.find(e => e.provider === 'OPEN_METEO_WEATHER')?.note).toContain('not satellite-observed');
  });
  it('coalesces concurrent requests and returns isolated cache copies', async () => {
    mockFetch(); const service = new EnvironmentalDataService(); const [a, b] = await Promise.all([service.get(BRAIN_AREAS[0]), service.get(BRAIN_AREAS[0])]);
    a.days[0].rainMm = 999; expect(b.days[0].rainMm).toBe(130); expect((await service.get(BRAIN_AREAS[0])).days[0].rainMm).toBe(130); expect(fetch).toHaveBeenCalledTimes(3);
  });
  it('handles total outage without fabricated observations', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
    const result = await new EnvironmentalDataService().get(BRAIN_AREAS[0]); expect(result.evidence.every(e => e.status === 'UNAVAILABLE')).toBe(true); expect(result.days.every(d => d.rainMm === null && d.discharge === null)).toBe(true);
  });
  it.each([null, '130', -3, NaN])('rejects invalid rainfall %s', async rain => {
    mockFetch({ daily_units: { precipitation_sum: 'mm' }, daily: { time: ['2026-10-18'], precipitation_sum: [rain] } });
    expect((await new EnvironmentalDataService().get(BRAIN_AREAS[0])).days[0].rainMm).toBeNull();
  });
  it('rejects unexpected rainfall units', async () => {
    mockFetch({ daily_units: { precipitation_sum: 'inches' }, daily: { time: ['2026-10-18'], precipitation_sum: [10] } });
    const result = await new EnvironmentalDataService().get(BRAIN_AREAS[0]); expect(result.evidence.find(e => e.provider === 'OPEN_METEO_WEATHER')?.status).toBe('UNAVAILABLE');
  });
  it('does not reuse one area cache for a different area', async () => {
    mockFetch(); const service = new EnvironmentalDataService(); await service.get(BRAIN_AREAS[0]); await service.get(BRAIN_AREAS[1]); expect(fetch).toHaveBeenCalledTimes(6);
  });
});
