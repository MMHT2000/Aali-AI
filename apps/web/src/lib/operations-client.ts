import { apiFetch } from './authenticated-fetch';

export interface OperationMapPoint {
  id: string;
  name?: string;
  label?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status?: string;
  provenance: string;
  peopleCount?: number;
  valueM?: number;
}

export interface OperationsSnapshot {
  generatedAt: string;
  role: string;
  simulation: {
    scenarioId: string;
    scenarioName: string;
    provenance: string;
    isReconstructed: boolean;
    mode: string;
    tickIndex: number;
    totalTicks: number;
    running: boolean;
    speed?: number;
    simulatedAt: string;
    sourceData?: {
      gauge: { valueM: number; available: boolean; source: string };
      rainfall: { valueMm: number; available: boolean; source: string };
      volunteerReading: { available: boolean; source: string };
    };
    alert: { computedLevel: string; reasonCodes?: string[]; reasonsBn?: string[] };
    incomingSos?: number;
    connectivity?: { internetAvailable: boolean; source: string };
  };
  mapLayers: {
    areas: OperationMapPoint[];
    gauges: OperationMapPoint[];
    shelters: OperationMapPoint[];
    assets: OperationMapPoint[];
    incidents: OperationMapPoint[];
    sos: OperationMapPoint[];
  };
  queue: {
    activeIncidents?: number;
    strandedPeople?: number;
    incomingSimulatedSos?: number;
    reportsPendingReview?: number;
  };
}

export async function getOperationsSnapshot(): Promise<OperationsSnapshot> {
  const response = await apiFetch('/api/v1/operations/snapshot');
  if (!response.ok) throw new Error(`Operations snapshot failed (${response.status})`);
  return response.json() as Promise<OperationsSnapshot>;
}

export async function sendSimulationControl(action: string, body?: unknown): Promise<void> {
  const method = action === 'speed' || action === 'connectivity' ? 'PATCH' : 'POST';
  const response = await apiFetch(`/api/v1/simulation/${action}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`Simulation action failed (${response.status})`);
}
