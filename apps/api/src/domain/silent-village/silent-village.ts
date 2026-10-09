export interface SilentVillageInput {
  areaId: string;
  areaName: string;
  exposureLevel: 'EXTREME' | 'HIGH' | 'VERY_HIGH' | 'MEDIUM' | 'LOW';
  alertLevel: 'NORMAL' | 'WATCH' | 'WARNING' | 'ACT';
  minutesSinceLastReport: number; // e.g., 20+
  neighboringAreasReportingCount: number; // > 0
  configuredThresholdMinutes?: number; // default 20 min
}

export interface SilentVillageResult {
  isSilentVillage: boolean;
  actionRequired: 'VERIFY_BY_SAFE_MEANS' | 'NORMAL_MONITORING';
  statusLabel: string;
  reason: string;
}

/**
 * Deterministic silent-village detector:
 * Flags when all configured criteria hold:
 * 1. Alert level Warning or higher
 * 2. Exposure level HIGH or VERY_HIGH
 * 3. No reports for threshold interval (~20 minutes)
 * 4. Neighboring cells ARE reporting
 *
 * NOTE: Output is always "VERIFY_BY_SAFE_MEANS" with reason.
 * The system NEVER infers that silence means an area is safe.
 */
export function evaluateSilentVillage(input: SilentVillageInput): SilentVillageResult {
  const threshold = input.configuredThresholdMinutes ?? 20;
  const isHighAlert = input.alertLevel === 'WARNING' || input.alertLevel === 'ACT';
  const isHighExposure = input.exposureLevel === 'HIGH' || input.exposureLevel === 'VERY_HIGH';
  const isSilentForThreshold = input.minutesSinceLastReport >= threshold;
  const hasNeighborActivity = input.neighboringAreasReportingCount > 0;

  if (isHighAlert && isHighExposure && isSilentForThreshold && hasNeighborActivity) {
    return {
      isSilentVillage: true,
      actionRequired: 'VERIFY_BY_SAFE_MEANS',
      statusLabel: 'HIGH_RISK_SILENT_VILLAGE',
      reason: `Area '${input.areaName}' has ${input.exposureLevel} exposure and ${input.alertLevel} alert, but zero reports for ${input.minutesSinceLastReport} minutes while ${input.neighboringAreasReportingCount} neighbor cell(s) are reporting. Do not assume safety. Verify by drone or boat reconnaissance.`,
    };
  }

  return {
    isSilentVillage: false,
    actionRequired: 'NORMAL_MONITORING',
    statusLabel: 'ACTIVE_OR_NORMAL',
    reason: `Criteria not met for silent-village escalation. (Alert: ${input.alertLevel}, Silence: ${input.minutesSinceLastReport}m / ${threshold}m threshold).`,
  };
}

