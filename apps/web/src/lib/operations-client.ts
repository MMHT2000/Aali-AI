import { apiFetch } from './authenticated-fetch';

export interface OperationMapPoint {
  id: string;
  name?: string;
  label?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  status?: string;
  provenance: OperationsProvenance;
  peopleCount?: number;
  valueM?: number;
  shortId?: string;
  hasChild?: boolean;
  hasMedicalNeed?: boolean;
  isTrapped?: boolean;
  elderlyCount?: number | null;
  geohash7?: string;
  receivedAt?: string;
}

export type OperationsMode = 'LIVE' | 'EXERCISE' | 'HISTORICAL';
export type OperationsProvenance =
  | 'SYNTHETIC_FIXTURE'
  | 'SYNTHETIC_SIMULATION'
  | 'HISTORICAL_RECONSTRUCTION'
  | 'API_SUBMITTED_REPORT'
  | 'DETERMINISTIC_RULE_OUTPUT'
  | 'AI_SUGGESTION'
  | 'HUMAN_ACTION'
  | 'EXTERNAL_OBSERVATION'
  | 'MOBILE_DIRECT_SOS'
  | 'D2C_GATEWAY_RELAY';

export interface OperationsSourceStatus {
  id: string;
  label: string;
  availability: 'AVAILABLE' | 'SYNTHETIC' | 'RECONSTRUCTED' | 'UNAVAILABLE';
  lastCheckedAt: string | null;
  latestObservedAt: string | null;
  ageSeconds: number | null;
  message: string;
  provenance: OperationsProvenance;
}

export interface OperationsExternalAlert {
  id: string;
  headline: string;
  description: string | null;
  instruction: string | null;
  severity: string | null;
  urgency: string | null;
  certainty: string | null;
  areas: string[];
  issuedAt: string | null;
  effectiveAt: string | null;
  expiresAt: string;
  sourceUrl: string;
  fetchedAt: string;
  provenance: OperationsProvenance;
}

export interface OperationsSnapshotQuery {
  mode?: OperationsMode;
  eventId?: string;
  districtCode?: string;
}

export interface OperationsSnapshotBase {
  generatedAt: string;
  role: string;
  context: {
    mode: OperationsMode;
    event: {
      id: string;
      name: string;
      startAt: string;
      endAt: string | null;
      isReconstructed: boolean;
      provenance: OperationsProvenance;
      provenanceNote: string | null;
    } | null;
    sources: OperationsSourceStatus[];
  };
  externalAlerts?: OperationsExternalAlert[];
  simulation?: {
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
  historicalReplay?: {
    scenarioId: string;
    title: string;
    period: string;
    isReconstructed: true;
    provenance: 'HISTORICAL_RECONSTRUCTION';
    sourceVerification: string;
    ticks: Array<{ tickIndex: number; simulatedTime: string; signalA: unknown; signalB: unknown; signalC: unknown }>;
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
  visibility: {
    sos: boolean;
    incidents: boolean;
    assets: boolean;
    simulationControls: boolean;
    aggregateOnly: boolean;
  };
}

export type OperationsSnapshot = OperationsSnapshotBase & { simulation: NonNullable<OperationsSnapshotBase['simulation']> };

export function getOperationsSnapshot(): Promise<OperationsSnapshot>;
export function getOperationsSnapshot(options: OperationsSnapshotQuery): Promise<OperationsSnapshotBase>;
export async function getOperationsSnapshot(options: OperationsSnapshotQuery = {}): Promise<OperationsSnapshotBase> {
  const query = new URLSearchParams();
  if (options.mode) query.set('mode', options.mode);
  if (options.eventId) query.set('eventId', options.eventId);
  if (options.districtCode) query.set('districtCode', options.districtCode);
  const queryString = query.toString();
  const suffix = queryString ? `?${queryString}` : '';
  const response = await apiFetch(`/api/v1/operations/snapshot${suffix}`);
  if (!response.ok) throw new Error(`Operations snapshot failed (${response.status})`);
  const snapshot: unknown = await response.json();
  if (
    typeof snapshot !== 'object' || snapshot === null ||
    !('context' in snapshot) || !('mapLayers' in snapshot) || !('visibility' in snapshot)
  ) {
    throw new Error('Operations API is outdated. Restart the API server and retry.');
  }
  return snapshot as OperationsSnapshotBase;
}

export async function sendSimulationControl(action: string, body?: unknown): Promise<void> {
  const method = action === 'speed' || action === 'connectivity' || action === 'gauge' || action === 'tick' ? 'PATCH' : 'POST';
  const response = await apiFetch(`/api/v1/simulation/${action}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw new Error(`Simulation action failed (${response.status})`);
}

export async function toggleGaugeBlackout(available?: boolean): Promise<void> {
  await sendSimulationControl('gauge', { available });
}

export async function setSimulationTick(tickIndex: number): Promise<void> {
  await sendSimulationControl('tick', { tickIndex });
}
