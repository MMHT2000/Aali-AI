export enum OperationsMode {
  LIVE = 'LIVE',
  EXERCISE = 'EXERCISE',
  HISTORICAL = 'HISTORICAL',
}

export enum OperationsProvenance {
  SYNTHETIC_FIXTURE = 'SYNTHETIC_FIXTURE',
  SYNTHETIC_SIMULATION = 'SYNTHETIC_SIMULATION',
  HISTORICAL_RECONSTRUCTION = 'HISTORICAL_RECONSTRUCTION',
  API_SUBMITTED_REPORT = 'API_SUBMITTED_REPORT',
  DETERMINISTIC_RULE_OUTPUT = 'DETERMINISTIC_RULE_OUTPUT',
  AI_SUGGESTION = 'AI_SUGGESTION',
  HUMAN_ACTION = 'HUMAN_ACTION',
  EXTERNAL_OBSERVATION = 'EXTERNAL_OBSERVATION',
}

export type SourceAvailability = 'AVAILABLE' | 'SYNTHETIC' | 'RECONSTRUCTED' | 'UNAVAILABLE';

export interface OperationsSourceStatus {
  id: string;
  label: string;
  availability: SourceAvailability;
  lastCheckedAt: string | null;
  latestObservedAt: string | null;
  ageSeconds: number | null;
  message: string;
  provenance: OperationsProvenance;
}
