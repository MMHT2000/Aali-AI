import { Injectable, Logger } from '@nestjs/common';
import { DeterministicAiProvider } from '../../domain/ai/deterministic-ai-provider';
import {
  BenchmarkReport,
  CommunicationDraftResult,
  DuplicateExplanationResult,
  ShiftSummaryResult,
  SosUnderstandingResult,
} from '../../domain/ai/ai-interfaces';
import { SYNTHETIC_SOS_BENCHMARK } from '../../domain/ai/synthetic-sos-benchmark';

export interface UnderstandSosDto {
  text: string;
  forceFallback?: boolean;
}

export interface DuplicateSimilarityDto {
  leftReportText: string;
  rightReportText: string;
  spatialMatch?: boolean;
}

export interface DraftCommunicationDto {
  alertLevel: string;
  areaName: string;
  shelterName: string;
  sourceRecordIds: string[];
}

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider = new DeterministicAiProvider();
  private isSimulatedOutage = false;
  private primaryProviderName: string;
  private backupProviderName: string;
  private timeoutMs: number;

  constructor(private readonly configService: ConfigService) {
    this.primaryProviderName = this.configService.get<string>('AI_PRIMARY_PROVIDER', 'deterministic_mock');
    this.backupProviderName = this.configService.get<string>('AI_BACKUP_PROVIDER', 'deterministic_fallback');
    this.timeoutMs = this.configService.get<number>('AI_TIMEOUT_MS', 3000);
  }

  getProviderStatus() {
    return {
      status: this.isSimulatedOutage ? 'outage_fallback_only' : 'operational',
      activeProvider: this.isSimulatedOutage ? this.backupProviderName : this.primaryProviderName,
      primaryProvider: {
        name: this.primaryProviderName,
        status: this.isSimulatedOutage ? 'OUTAGE_SIMULATED' : 'READY',
        type: 'local_deterministic',
      },
      backupProvider: {
        name: this.backupProviderName,
        status: 'STANDBY_READY',
        type: 'deterministic_fallback',
      },
      failoverPolicy: {
        timeoutMs: this.timeoutMs,
        safeFallbackAvailable: true,
        piiProtection: 'ALL_EXTERNAL_REQUESTS_REDACTED_OR_LOCAL_ONLY',
      },
      isSimulatedOutage: this.isSimulatedOutage,
      supportedLanguages: ['bn', 'banglish', 'en'],
      disclaimer: 'Deterministic local NLP prototype. AI produces suggestions only; decision values remain strictly rule-based.',
    };
  }

  setOutageState(simulatedOutage: boolean) {
    this.isSimulatedOutage = simulatedOutage;
    return this.getProviderStatus();
  }

  understandSos(dto: UnderstandSosDto): SosUnderstandingResult {
    // Redact text from server log to protect potential sensitive words
    this.logger.log(`Processing SOS text understanding (${dto.text.length} chars). Outage state: ${this.isSimulatedOutage}`);

    const useFallback = dto.forceFallback || this.isSimulatedOutage;
    return this.provider.understandSos(dto.text, useFallback);
  }

  explainDuplicateSimilarity(dto: DuplicateSimilarityDto): DuplicateExplanationResult {
    return this.provider.explainDuplicate(
      dto.leftReportText,
      dto.rightReportText,
      dto.spatialMatch ?? true,
    );
  }

  draftCommunication(dto: DraftCommunicationDto): CommunicationDraftResult {
    return this.provider.draftCommunication(
      dto.alertLevel,
      dto.areaName,
      dto.shelterName,
      dto.sourceRecordIds || [],
    );
  }

  getBenchmarkSamples() {
    return SYNTHETIC_SOS_BENCHMARK;
  }

  runBenchmark(): BenchmarkReport {
    return this.provider.evaluateBenchmark();
  }

  generateShiftSummary(params: {
    totalSos?: number;
    criticalEvacuations?: number;
    silentVillages?: number;
    deliveriesLogged?: number;
    recordIds?: string[];
  }): ShiftSummaryResult {
    return this.provider.generateShiftSummary({
      totalSos: params.totalSos ?? 14,
      criticalEvacuations: params.criticalEvacuations ?? 3,
      silentVillages: params.silentVillages ?? 1,
      deliveriesLogged: params.deliveriesLogged ?? 2,
      recordIds: params.recordIds ?? ['sos-demo-1', 'sos-demo-2', 'warn-001', 'rec-rep-01'],
    });
  }
}

