import { Injectable, NotFoundException } from '@nestjs/common';
import {
  evaluateThreeSignalAlert,
  ThreeSignalAlertInput,
  ThreeSignalAlertOutput,
} from '../../domain/flood-alert/three-signal-alert';
import {
  REPLAY_SCENARIOS,
  ReplayScenario,
  ReplayTick,
} from '../../domain/flood-alert/replay-scenarios';
import { Warning, WarningState } from './entities/warning.entity';

export interface ReplayRunState {
  runId: string;
  scenario: ReplayScenario;
  currentTickIndex: number;
  isGaugeBlankedOverride: boolean;
  currentEvaluation: ThreeSignalAlertOutput;
  timelineHistory: Array<{
    tickIndex: number;
    simulatedTime: string;
    descriptionBn: string;
    evaluation: ThreeSignalAlertOutput;
  }>;
}

export interface WarningDraftDto {
  eventId: string;
  areaId: string;
  areaName: string;
  alertLevel: string;
  supportingSignals: string[];
  shelterName: string;
  bodyBn?: string;
  bodyEn?: string;
}

import { AuditService } from '../audit/audit.service';

@Injectable()
export class AlertsService {
  private activeReplays = new Map<string, ReplayRunState>();
  private warnings: Warning[] = [];

  constructor(private readonly auditService?: AuditService) {
    this.seedInitialWarning();
  }

  private seedInitialWarning() {
    const w = new Warning();
    w.id = 'warn-001';
    w.event_id = '11111111-1111-1111-1111-111111111101';
    w.area_id = '22222222-2222-2222-2222-222222222202';
    w.state = WarningState.PENDING_APPROVAL;
    w.body_bn = 'পরশুরাম উপজেলার বাসিন্দাদের জানানো যাচ্ছে: মুহুরী নদীর পানি সতর্কসীমা অতিক্রম করেছে এবং উজানে তীব্র বৃষ্টি হচ্ছে। ঝুঁকিপূর্ণ এলাকার বাসিন্দাদের দ্রুত পরশুরাম সরকারি মডেল উচ্চ বিদ্যালয় আশ্রয়কেন্দ্রে যাওয়ার অনুরোধ করা হচ্ছে।';
    w.body_en = 'Notice to Parshuram residents: Muhuri river water has exceeded warning level with heavy upstream rainfall. Move to Parshuram Model High School shelter safely.';
    w.created_by = '00000000-0000-0000-0000-000000000002'; // Authority
    w.approved_by = null;
    w.approved_at = null;
    w.approval_note = null;
    w.delivery_simulation = null;
    w.created_at = new Date('2024-08-19T16:00:00Z');
    this.warnings.push(w);
  }

  evaluateAlert(input: ThreeSignalAlertInput): ThreeSignalAlertOutput {
    return evaluateThreeSignalAlert(input);
  }

  getScenarios(): ReplayScenario[] {
    return REPLAY_SCENARIOS;
  }

  startReplay(scenarioId: string): ReplayRunState {
    const sc = REPLAY_SCENARIOS.find((s) => s.id === scenarioId) || REPLAY_SCENARIOS[0];
    const runId = `replay-run-${Date.now()}`;

    const firstTick = sc.ticks[0];
    const initialEval = this.evaluateTick(sc, firstTick, false);

    const state: ReplayRunState = {
      runId,
      scenario: sc,
      currentTickIndex: 0,
      isGaugeBlankedOverride: false,
      currentEvaluation: initialEval,
      timelineHistory: [
        {
          tickIndex: 0,
          simulatedTime: firstTick.simulatedTime,
          descriptionBn: firstTick.descriptionBn,
          evaluation: initialEval,
        },
      ],
    };

    this.activeReplays.set(runId, state);
    return state;
  }

  getReplayRun(runId: string): ReplayRunState {
    const run = this.activeReplays.get(runId);
    if (!run) {
      // return default initialized if not found
      return this.startReplay(REPLAY_SCENARIOS[0].id);
    }
    return run;
  }

  stepReplay(runId: string, direction: 'NEXT' | 'PREV' | 'SET_TICK', targetTick?: number): ReplayRunState {
    const run = this.getReplayRun(runId);
    const totalTicks = run.scenario.ticks.length;

    let nextIndex = run.currentTickIndex;
    if (direction === 'NEXT') {
      nextIndex = Math.min(run.currentTickIndex + 1, totalTicks - 1);
    } else if (direction === 'PREV') {
      nextIndex = Math.max(run.currentTickIndex - 1, 0);
    } else if (direction === 'SET_TICK' && typeof targetTick === 'number') {
      nextIndex = Math.max(0, Math.min(targetTick, totalTicks - 1));
    }

    run.currentTickIndex = nextIndex;
    const tick = run.scenario.ticks[nextIndex];
    const evaluation = this.evaluateTick(run.scenario, tick, run.isGaugeBlankedOverride);
    run.currentEvaluation = evaluation;

    if (!run.timelineHistory.find((h) => h.tickIndex === nextIndex)) {
      run.timelineHistory.push({
        tickIndex: nextIndex,
        simulatedTime: tick.simulatedTime,
        descriptionBn: tick.descriptionBn,
        evaluation,
      });
    }

    return run;
  }

  setGaugeState(runId: string, blanked: boolean): ReplayRunState {
    const run = this.getReplayRun(runId);
    run.isGaugeBlankedOverride = blanked;
    const tick = run.scenario.ticks[run.currentTickIndex];
    run.currentEvaluation = this.evaluateTick(run.scenario, tick, blanked);
    return run;
  }

  private evaluateTick(scenario: ReplayScenario, tick: ReplayTick, isBlankedOverride: boolean): ThreeSignalAlertOutput {
    return evaluateThreeSignalAlert({
      areaId: '22222222-2222-2222-2222-222222222202',
      areaName: 'Parshuram',
      reportedBreach: tick.breachReported,
      signalA: {
        ...tick.signalA,
        isBlanked: isBlankedOverride || tick.signalA.isBlanked,
      },
      signalB: tick.signalB,
      signalC: tick.signalC,
    });
  }

  // Warning Draft & Human Approval Workflow
  createWarningDraft(dto: WarningDraftDto, userId: string): Warning {
    const w = new Warning();
    w.id = `warn-${Date.now()}`;
    w.event_id = dto.eventId;
    w.area_id = dto.areaId;
    w.state = WarningState.PENDING_APPROVAL;
    w.body_bn = dto.bodyBn || `জরুরি সতর্কতা [${dto.alertLevel}]: ${dto.areaName} এলাকায় বন্যা সতর্কতা সংকেত প্রযোজ্য। আশ্রয়কেন্দ্র: ${dto.shelterName}। সংকেত প্রমাণ: ${dto.supportingSignals.join(', ')}`;
    w.body_en = dto.bodyEn || `Emergency Alert [${dto.alertLevel}] for ${dto.areaName}. Safe shelter: ${dto.shelterName}.`;
    w.created_by = userId;
    w.approved_by = null;
    w.approved_at = null;
    w.approval_note = null;
    w.delivery_simulation = null;
    w.created_at = new Date();
    this.warnings.unshift(w);
    return w;
  }

  getWarnings(): Warning[] {
    return this.warnings;
  }

  approveWarning(id: string, authorityUserId: string, note: string): Warning {
    const w = this.warnings.find((item) => item.id === id);
    if (!w) throw new NotFoundException('Warning not found');

    const prevState = w.state;
    w.state = WarningState.APPROVED;
    w.approved_by = authorityUserId;
    w.approved_at = new Date();
    w.approval_note = note;

    this.auditService?.record({
      actorUserId: authorityUserId,
      action: 'APPROVE_WARNING',
      entityType: 'WARNING',
      entityId: w.id,
      reason: note,
      beforeSummary: { state: prevState },
      afterSummary: { state: w.state, approvedBy: authorityUserId },
    });

    return w;
  }

  rejectWarning(id: string, authorityUserId: string, reason: string): Warning {
    const w = this.warnings.find((item) => item.id === id);
    if (!w) throw new NotFoundException('Warning not found');

    const prevState = w.state;
    w.state = WarningState.REJECTED;
    w.approved_by = authorityUserId;
    w.approval_note = `REJECTED: ${reason}`;

    this.auditService?.record({
      actorUserId: authorityUserId,
      action: 'REJECT_WARNING',
      entityType: 'WARNING',
      entityId: w.id,
      reason,
      beforeSummary: { state: prevState },
      afterSummary: { state: w.state, approvedBy: authorityUserId },
    });

    return w;
  }

  simulateBroadcast(id: string): { success: boolean; simulation: true; deliveryMethod: string; timestamp: string } {
    const w = this.warnings.find((item) => item.id === id);
    if (!w) throw new NotFoundException('Warning not found');

    w.state = WarningState.SENT_SIMULATED;
    w.delivery_simulation = {
      method: 'SIMULATED_CELL_BROADCAST_AND_SMS',
      simulatedRecipientCount: 14200,
      deliveredAt: new Date().toISOString(),
      disclaimer: 'DEMO ONLY: External public broadcast simulated; no live networks triggered.',
    };

    return {
      success: true,
      simulation: true,
      deliveryMethod: 'CELL_BROADCAST_SIMULATION',
      timestamp: new Date().toISOString(),
    };
  }
}
