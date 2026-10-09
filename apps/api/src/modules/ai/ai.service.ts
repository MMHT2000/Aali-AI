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
import { GeminiAiProvider } from '../../domain/ai/gemini-ai-provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly fallbackProvider = new DeterministicAiProvider();
  private readonly geminiProvider: GeminiAiProvider;
  private isSimulatedOutage = false;
  private primaryProviderName: string;
  private backupProviderName: string;
  private timeoutMs: number;
  private isRemoteEnabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.primaryProviderName = this.configService.get<string>('AI_PRIMARY_PROVIDER', 'gemini_flash');
    this.backupProviderName = this.configService.get<string>('AI_BACKUP_PROVIDER', 'deterministic_fallback');
    this.timeoutMs = this.configService.get<number>('AI_TIMEOUT_MS', 25000);
    const apiKey = (
      this.configService.get<string>('AI_API_KEY') ||
      this.configService.get<string>('GEMINI_API_KEY') ||
      ''
    ).trim();

    this.geminiProvider = new GeminiAiProvider(apiKey, this.timeoutMs);
    this.isRemoteEnabled = this.geminiProvider.isAvailable();
    this.logger.log(
      `AI Service initialized. Primary: ${this.primaryProviderName} (Gemini Available: ${this.isRemoteEnabled}), Backup: ${this.backupProviderName}`,
    );
  }

  getProviderStatus() {
    const isGeminiActive = this.isRemoteEnabled && !this.isSimulatedOutage;
    return {
      status: this.isSimulatedOutage ? 'outage_fallback_only' : 'operational',
      activeProvider: isGeminiActive ? 'gemini-flash-latest' : this.backupProviderName,
      primaryProvider: {
        name: this.primaryProviderName,
        status: this.isSimulatedOutage
          ? 'OUTAGE_SIMULATED'
          : this.isRemoteEnabled
          ? 'READY'
          : 'NO_API_KEY_LOCAL_FALLBACK',
        type: this.isRemoteEnabled ? 'google_gemini_remote' : 'local_deterministic',
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
      disclaimer:
        'AI produces language extraction and communication suggestions only. Flood alert levels, boat priorities, and warning approvals remain strictly deterministic and human-approved.',
    };
  }

  setOutageState(simulatedOutage: boolean) {
    this.isSimulatedOutage = simulatedOutage;
    return this.getProviderStatus();
  }

  async understandSos(dto: UnderstandSosDto): Promise<SosUnderstandingResult> {
    this.logger.log(
      `Processing SOS text understanding (${dto.text.length} chars). Simulated Outage: ${this.isSimulatedOutage}, Force Fallback: ${!!dto.forceFallback}`,
    );

    const useFallback = Boolean(dto.forceFallback || this.isSimulatedOutage || !this.isRemoteEnabled);
    if (!useFallback) {
      return this.geminiProvider.understandSos(dto.text, false);
    }
    return this.fallbackProvider.understandSos(dto.text, true);
  }

  async explainDuplicateSimilarity(dto: DuplicateSimilarityDto): Promise<DuplicateExplanationResult> {
    if (!this.isSimulatedOutage && this.isRemoteEnabled) {
      return this.geminiProvider.explainDuplicate(
        dto.leftReportText,
        dto.rightReportText,
        dto.spatialMatch ?? true,
      );
    }
    return this.fallbackProvider.explainDuplicate(
      dto.leftReportText,
      dto.rightReportText,
      dto.spatialMatch ?? true,
    );
  }

  async draftCommunication(dto: DraftCommunicationDto): Promise<CommunicationDraftResult> {
    if (!this.isSimulatedOutage && this.isRemoteEnabled) {
      return this.geminiProvider.draftCommunication(
        dto.alertLevel,
        dto.areaName,
        dto.shelterName,
        dto.sourceRecordIds || [],
      );
    }
    return this.fallbackProvider.draftCommunication(
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
    return this.fallbackProvider.evaluateBenchmark();
  }

  generateShiftSummary(params: {
    totalSos?: number;
    criticalEvacuations?: number;
    silentVillages?: number;
    deliveriesLogged?: number;
    recordIds?: string[];
  }): ShiftSummaryResult {
    return this.fallbackProvider.generateShiftSummary({
      totalSos: params.totalSos ?? 14,
      criticalEvacuations: params.criticalEvacuations ?? 3,
      silentVillages: params.silentVillages ?? 1,
      deliveriesLogged: params.deliveriesLogged ?? 2,
      recordIds: params.recordIds ?? ['sos-demo-1', 'sos-demo-2', 'warn-001', 'rec-rep-01'],
    });
  }
}

