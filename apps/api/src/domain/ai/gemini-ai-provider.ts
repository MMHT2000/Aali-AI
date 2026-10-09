import { Logger } from '@nestjs/common';
import {
  CommunicationDraftResult,
  DuplicateExplanationResult,
  ShiftSummaryResult,
  SosExtractedFields,
  SosUnderstandingResult,
} from './ai-interfaces';
import { DeterministicAiProvider } from './deterministic-ai-provider';

export class GeminiAiProvider {
  private readonly logger = new Logger(GeminiAiProvider.name);
  private readonly fallbackProvider = new DeterministicAiProvider();
  private readonly apiKey: string;
  private readonly timeoutMs: number;
  private readonly modelName = 'gemini-flash-latest';

  constructor(apiKey: string, timeoutMs: number = 5000) {
    this.apiKey = apiKey.trim();
    this.timeoutMs = timeoutMs;
  }

  /**
   * Sanitizes text to remove any PII before remote transmission.
   * Complies strictly with Aali AI domain safety and privacy requirements.
   */
  public sanitizeText(text: string): string {
    return text
      // Redact Bangladesh 11-digit mobile phone numbers
      .replace(/(?:\+?880|0)1[3-9]\d{8}\b/g, '[REDACTED_PHONE]')
      // Redact 10 or 17 digit NID patterns
      .replace(/\b\d{10}\b|\b\d{17}\b/g, '[REDACTED_NID]')
      // Redact lat/long coordinates (e.g. 23.0123, 91.3982)
      .replace(/\b\d{1,2}\.\d{4,},\s*\d{1,3}\.\d{4,}\b/g, '[REDACTED_COORDS]');
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 10);
  }

  /**
   * Primary NLP extraction for Bangla, Banglish, and English disaster messages.
   * Automatically falls back to DeterministicAiProvider if offline, timeout, or invalid output.
   */
  public async understandSos(
    rawText: string,
    forceFallback = false,
  ): Promise<SosUnderstandingResult> {
    const start = Date.now();

    if (forceFallback || !this.isAvailable()) {
      return this.fallbackProvider.understandSos(rawText, true);
    }

    const sanitized = this.sanitizeText(rawText);
    const systemPrompt = `You are a disaster emergency NLP assistant analyzing flash flood SOS messages from Feni, Bangladesh.
Extract structured rescue entities from the text into strict JSON conforming to this schema:
{
  "peopleCount": number or null (e.g. 5, or null if unknown),
  "urgencyFlags": {
    "trapped": boolean (true if trapped on roof, attic, trees, surrounded by rising water),
    "elderly": boolean (true if mentions elderly, grandparents, sick elders),
    "child": boolean (true if mentions infants, babies, children),
    "medical": boolean (true if mentions medical emergency, injured, dialysis, bleeding, sick)
  },
  "locationWords": string[] (extracted place names, e.g. ["Parshuram", "Muhuri Embankment", "Chitholia"]),
  "waterTrend": "RISING_RAPID" | "RISING_STEADY" | "STABLE" | "RECEDING" | "UNKNOWN",
  "fieldConfidence": {
    "peopleCount": number between 0.0 and 1.0,
    "urgencyFlags": number between 0.0 and 1.0,
    "locationWords": number between 0.0 and 1.0,
    "waterTrend": number between 0.0 and 1.0
  }
}
Return ONLY valid JSON. No conversational commentary.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: `${systemPrompt}\n\nEmergency SOS Message:\n"${sanitized}"` },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini API HTTP ${response.status}`);
      }

      const json = await response.json();
      const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!candidateText) {
        throw new Error('Gemini API returned empty candidate response');
      }

      const parsed = JSON.parse(candidateText) as SosExtractedFields;

      // Validate required shape
      if (
        typeof parsed.urgencyFlags !== 'object' ||
        !Array.isArray(parsed.locationWords) ||
        !parsed.waterTrend
      ) {
        throw new Error('Malformed schema returned by LLM');
      }

      return {
        extracted: {
          peopleCount: typeof parsed.peopleCount === 'number' ? parsed.peopleCount : null,
          urgencyFlags: {
            trapped: Boolean(parsed.urgencyFlags?.trapped),
            elderly: Boolean(parsed.urgencyFlags?.elderly),
            child: Boolean(parsed.urgencyFlags?.child),
            medical: Boolean(parsed.urgencyFlags?.medical),
          },
          locationWords: parsed.locationWords.map((w) => String(w).trim()).filter(Boolean),
          waterTrend: parsed.waterTrend || 'UNKNOWN',
          fieldConfidence: {
            peopleCount: parsed.fieldConfidence?.peopleCount ?? 0.85,
            urgencyFlags: parsed.fieldConfidence?.urgencyFlags ?? 0.9,
            locationWords: parsed.fieldConfidence?.locationWords ?? 0.85,
            waterTrend: parsed.fieldConfidence?.waterTrend ?? 0.8,
          },
        },
        rawText,
        providerMode: 'remote',
        isFallback: false,
        latencyMs: Date.now() - start,
      };
    } catch (err) {
      this.logger.warn(
        `Gemini inference failed (${err instanceof Error ? err.message : 'timeout/network'}). Executing deterministic fallback.`,
      );
      // Graceful local deterministic fallback
      const fallbackResult = this.fallbackProvider.understandSos(rawText, true);
      return {
        ...fallbackResult,
        latencyMs: Date.now() - start,
      };
    }
  }

  public async explainDuplicate(
    leftText: string,
    rightText: string,
    spatialMatch: boolean,
  ): Promise<DuplicateExplanationResult> {
    if (!this.isAvailable()) {
      return this.fallbackProvider.explainDuplicate(leftText, rightText, spatialMatch);
    }

    try {
      const sanitizedLeft = this.sanitizeText(leftText);
      const sanitizedRight = this.sanitizeText(rightText);

      const prompt = `You are a disaster dispatch assistant. Compare these two flood SOS reports and determine whether they describe the same incident:
Report A: "${sanitizedLeft}"
Report B: "${sanitizedRight}"
Spatial Proximity Match: ${spatialMatch}

Output JSON schema:
{
  "similarityScore": number between 0.0 and 1.0,
  "matchReasons": string[],
  "explanationBn": string in clear Bangla explaining the match or difference,
  "suggestedAction": "MERGE_CANDIDATE" or "DISTINCT_REPORTS"
}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
          }),
        },
      );

      if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
      const json = await response.json();
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(content) as DuplicateExplanationResult;
      return {
        similarityScore: Math.min(1.0, Math.max(0.0, parsed.similarityScore ?? 0.5)),
        matchReasons: Array.isArray(parsed.matchReasons) ? parsed.matchReasons : ['AI semantic similarity analysis'],
        explanationBn: parsed.explanationBn || 'এআই ভাষা মডেলের ভিত্তিতে দুটি বার্তার মধ্যে ভাষাগত সাদৃশ্য পর্যবেক্ষণ করা হয়েছে।',
        suggestedAction: parsed.suggestedAction === 'MERGE_CANDIDATE' ? 'MERGE_CANDIDATE' : 'DISTINCT_REPORTS',
      };
    } catch {
      return this.fallbackProvider.explainDuplicate(leftText, rightText, spatialMatch);
    }
  }

  public async draftCommunication(
    alertLevel: string,
    areaName: string,
    shelterName: string,
    sourceRecordIds: string[],
  ): Promise<CommunicationDraftResult> {
    if (!this.isAvailable()) {
      return this.fallbackProvider.draftCommunication(alertLevel, areaName, shelterName, sourceRecordIds);
    }

    try {
      const prompt = `Draft a concise official Bangla public flood warning broadcast message for residents of ${areaName}.
Alert Level: ${alertLevel}
Designated Safe Shelter: ${shelterName}
Keep it urgent, clear, culturally appropriate, and actionable. Max 160 characters if possible.
Output JSON: { "draftTextBn": string }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(this.timeoutMs),
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
          }),
        },
      );

      if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
      const json = await response.json();
      const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
      const parsed = JSON.parse(text);
      return {
        draftTextBn: parsed.draftTextBn,
        sourceRecordIds,
        isEditable: true,
        generatedBy: 'gemini-flash-latest',
      };
    } catch {
      return this.fallbackProvider.draftCommunication(alertLevel, areaName, shelterName, sourceRecordIds);
    }
  }
}

