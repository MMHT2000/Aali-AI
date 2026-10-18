export interface BrainArea {
  id: string; name: string; basin: string; latitude: number; longitude: number;
  bounds: [number, number, number, number]; rainWatchMm: number; rainHighMm: number;
  districtCode?: string; exerciseEventId?: string;
}
export const BRAIN_AREAS: readonly BrainArea[] = [
  { id: 'feni', name: 'Feni · Parshuram', basin: 'Muhuri', latitude: 23.22, longitude: 91.44, bounds: [91.20, 22.90, 91.65, 23.40], rainWatchMm: 60, rainHighMm: 120, districtCode: 'FENI_DIST', exerciseEventId: '11111111-1111-1111-1111-111111111103' },
  { id: 'sylhet', name: 'Sylhet · Companiganj', basin: 'Surma / Meghalaya foothills', latitude: 25.08, longitude: 91.75, bounds: [91.45, 24.80, 92.10, 25.20], rainWatchMm: 70, rainHighMm: 140, districtCode: 'SYLHET_DIST', exerciseEventId: '11111111-1111-1111-1111-111111111106' },
  { id: 'sunamganj', name: 'Sunamganj', basin: 'Surma / haor', latitude: 25.07, longitude: 91.40, bounds: [91.10, 24.80, 91.65, 25.20], rainWatchMm: 70, rainHighMm: 140 },
  { id: 'kurigram', name: 'Kurigram', basin: 'Brahmaputra / Dharla', latitude: 25.81, longitude: 89.65, bounds: [89.35, 25.50, 89.90, 26.10], rainWatchMm: 60, rainHighMm: 120 },
  { id: 'sirajganj', name: 'Sirajganj', basin: 'Jamuna', latitude: 24.45, longitude: 89.72, bounds: [89.40, 24.15, 89.95, 24.75], rainWatchMm: 60, rainHighMm: 120 },
  { id: 'chattogram', name: 'Chattogram', basin: 'Karnaphuli / coastal drainage', latitude: 22.36, longitude: 91.83, bounds: [91.60, 22.10, 92.10, 22.65], rainWatchMm: 60, rainHighMm: 120 },
];
export interface Evidence {
  id: string; provider: string; kind: 'MODEL_FORECAST' | 'SATELLITE_IMAGE' | 'OPERATIONS' | 'SYNTHETIC';
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'STALE'; fetchedAt: string; validAt: string | null;
  url: string; note: string;
}
export interface ForecastDay { date: string; discharge: number | null; p25: number | null; p75: number | null; rainMm: number | null }
export interface EnvironmentalData {
  evidence: Evidence[]; days: ForecastDay[];
  grid: { latitude: number; longitude: number } | null;
  imagery: { id: string; acquiredAt: string; cloudPercent: number | null; thumbnail: string | null; url: string }[];
}
export interface OperationalFacts {
  provenance: 'SYNTHETIC_EXERCISE' | 'NO_VERIFIED_OPERATIONAL_DATA';
  reports: { id: string; people: number; trapped: boolean; medical: boolean; child: boolean; receivedAt: string | null }[];
  shelters: { id: string; name: string; latitude: number; longitude: number; capacity: number; occupied: number; available: boolean }[];
  relief: { id: string; areaName: string; waterNeed: number; waterDelivered: number; foodNeed: number; foodDelivered: number }[];
}
export type ActionKind = 'PREPARE' | 'VERIFY_DATA' | 'REVIEW_RESCUE' | 'VERIFY_SHELTER' | 'REVIEW_RELIEF';
export interface BrainAction {
  id: string; kind: ActionKind; title: string; detail: string; priority: number; sourceIds: string[];
  requiredRole: 'AUTHORITY' | 'RESPONDER' | 'RECOVERY_COORDINATOR';
  state: 'READY' | 'PENDING_REVIEW' | 'ACKNOWLEDGED' | 'DISMISSED';
}
export interface BrainPlan {
  id: string; areaId: string; mode: 'LIVE' | 'EXERCISE'; createdAt: string;
  risk: { level: 'UNKNOWN' | 'MONITOR' | 'ELEVATED' | 'HIGH'; reasons: string[]; rain24hMm: number | null; dischargeRisePercent: number | null; label: string };
  environment: EnvironmentalData; operations: OperationalFacts; actions: BrainAction[];
  agent: { provider: 'LOCAL_PLANNER' | 'OPENAI'; status: string; summary: string; focusActionIds: string[]; trace: { tool: string; status: string }[] };
  limitations: string[];
}
