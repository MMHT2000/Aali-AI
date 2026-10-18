import { apiFetch, safeJson } from './authenticated-fetch';
export type { BrainArea, BrainPlan, BrainAction } from '../../../api/src/modules/brain/brain.types';
import type { BrainArea, BrainPlan } from '../../../api/src/modules/brain/brain.types';

export interface PersonalGuidance {
  preparation: string[]; shelterCandidates: { id: string; name: string; remainingCapacity: number; distanceKm: number; routeVerified: false; bookingStatus: string }[];
  locationStatus: string; shelterStatus: string; aidStatus: string;
}
async function request<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await apiFetch(`/api/v1/brain/${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  if (!response.ok) {
    let msg = `Request failed (${response.status})`;
    try {
      const err = await safeJson<{ message?: string | string[] }>(response);
      if (err?.message) {
        msg = Array.isArray(err.message) ? err.message.join(', ') : err.message;
      }
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return (await safeJson<T>(response)) as T;
}

export const brainAreas = async (signal?: AbortSignal): Promise<BrainArea[]> => {
  try {
    const areas = await request<BrainArea[]>('areas', undefined, signal);
    if (Array.isArray(areas) && areas.length > 0) return areas;
  } catch {
    // fallback
  }
  try {
    const res = await fetch('/demo-areas.json', { signal });
    const fallback = await safeJson<BrainArea[]>(res);
    if (Array.isArray(fallback) && fallback.length > 0) return fallback;
  } catch {
    // ignore
  }
  return [
    { id: 'feni', name: 'Feni · Parshuram', basin: 'Muhuri', latitude: 23.22, longitude: 91.44, bounds: [91.2, 22.9, 91.65, 23.4], rainWatchMm: 60, rainHighMm: 120, districtCode: 'FENI_DIST' },
    { id: 'sylhet', name: 'Sylhet · Companiganj', basin: 'Surma / Meghalaya foothills', latitude: 25.08, longitude: 91.75, bounds: [91.45, 24.8, 92.1, 25.2], rainWatchMm: 70, rainHighMm: 140, districtCode: 'SYLHET_DIST' },
  ];
};
export const latestBrain = (areaId: string, mode: string, signal?: AbortSignal) => request<BrainPlan | null>(`latest?${new URLSearchParams({ areaId, mode })}`, undefined, signal);
export const runBrain = (areaId: string, mode: string, signal?: AbortSignal) => request<BrainPlan>('run', { areaId, mode }, signal);
export const reviewBrain = (runId: string, actionId: string, decision: string, reason: string) => request<BrainPlan>(`runs/${runId}/review`, { actionId, decision, reason });
export const personalBrain = (body: { areaId: string; mode: string; people: number; latitude?: number; longitude?: number }) => request<PersonalGuidance>('personalize', body);
