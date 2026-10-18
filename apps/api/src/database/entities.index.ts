import { User } from '../modules/users/entities/user.entity';
import { FloodEvent } from '../modules/flood-events/entities/flood-event.entity';
import { Area } from '../modules/areas/entities/area.entity';
import { Gauge, GaugeObservation } from '../modules/gauges/entities/gauge.entity';
import { RainfallObservation, VolunteerReading } from '../modules/gauges/entities/observation.entity';
import { Shelter } from '../modules/shelters/entities/shelter.entity';
import { SosReport } from '../modules/sos/entities/sos-report.entity';
import { GatewayMessage } from '../modules/sos/entities/gateway-message.entity';
import { Incident, IncidentReport, DuplicateCandidate } from '../modules/incidents/entities/incident.entity';
import { Asset, DispatchSuggestion } from '../modules/assets/entities/asset.entity';
import { AlertEvaluation, Warning } from '../modules/warnings/entities/warning.entity';
import { RecoveryReport, AidDelivery } from '../modules/recovery/entities/recovery.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { ResidentAccount } from '../modules/auth/entities/resident-account.entity';
import { SimulationRunState } from '../modules/operations/entities/simulation-run-state.entity';
import { BrainRun } from '../modules/brain/brain-run.entity';
import { BrainControl } from '../modules/brain/brain-control.entity';

export const allEntities = [
  User,
  FloodEvent,
  Area,
  Gauge,
  GaugeObservation,
  RainfallObservation,
  VolunteerReading,
  Shelter,
  SosReport,
  GatewayMessage,
  Incident,
  IncidentReport,
  DuplicateCandidate,
  Asset,
  DispatchSuggestion,
  AlertEvaluation,
  Warning,
  RecoveryReport,
  AidDelivery,
  AuditLog,
  ResidentAccount,
  SimulationRunState,
  BrainRun,
  BrainControl,
];

