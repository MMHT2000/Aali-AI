import { apiFetch } from './authenticated-fetch';
export type { BrainArea, BrainPlan, BrainAction } from '../../../api/src/modules/brain/brain.types';
import type { BrainArea, BrainPlan } from '../../../api/src/modules/brain/brain.types';

export interface PersonalGuidance {
  preparation: string[]; shelterCandidates: { id: string; name: string; remainingCapacity: number; distanceKm: number; routeVerified: false; bookingStatus: string }[];
  locationStatus: string; shelterStatus: string; aidStatus: string;
}
async function request<T>(path: string, body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await apiFetch(`/api/v1/brain/${path}`, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, signal });
  if (!response.ok) { const error = await response.json().catch(() => ({})) as { message?: string | string[] }; throw new Error(Array.isArray(error.message) ? error.message.join(', ') : error.message || `Request failed (${response.status})`); }
  return response.json() as Promise<T>;
}
export const brainAreas = (signal?: AbortSignal) => request<BrainArea[]>('areas', undefined, signal);
export const latestBrain = (areaId: string, mode: string, signal?: AbortSignal) => request<BrainPlan | null>(`latest?${new URLSearchParams({ areaId, mode })}`, undefined, signal);
export const runBrain = (areaId: string, mode: string, signal?: AbortSignal) => request<BrainPlan>('run', { areaId, mode }, signal);
export const reviewBrain = (runId: string, actionId: string, decision: string, reason: string) => request<BrainPlan>(`runs/${runId}/review`, { actionId, decision, reason });
export const personalBrain = (body: { areaId: string; mode: string; people: number; latitude?: number; longitude?: number }) => request<PersonalGuidance>('personalize', body);
