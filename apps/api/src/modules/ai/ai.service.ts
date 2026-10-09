import { Injectable, Logger } from '@nestjs/common';
import { DeterministicAiProvider } from '../../domain/ai/deterministic-ai-provider';
import {
  BenchmarkReport,
  CommunicationDraftResult,
  DuplicateExplanationResult,
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

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider = new DeterministicAiProvider();
  private isSimulatedOutage = false;

  getProviderStatus() {
    return {
      status: this.isSimulatedOutage ? 'outage_fallback_only' : 'operational',
      provider: 'mock_local_deterministic',
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
}

