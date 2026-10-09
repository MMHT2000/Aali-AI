import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GeminiAiProvider } from './gemini-ai-provider';

describe('GeminiAiProvider', () => {
  let provider: GeminiAiProvider;

  beforeEach(() => {
    provider = new GeminiAiProvider('mock-gemini-api-key-test', 2000);
  });

  describe('PII Redaction & Privacy Guard', () => {
    it('redacts Bangladesh phone numbers before remote send', () => {
      const input = 'Call 01712345678 or +8801812345678 immediately!';
      const sanitized = provider.sanitizeText(input);

      expect(sanitized).not.toContain('01712345678');
      expect(sanitized).not.toContain('01812345678');
      expect(sanitized).toContain('[REDACTED_PHONE]');
    });

    it('redacts 10-digit and 17-digit NID patterns', () => {
      const input = 'Resident NID 1984261829 and old NID 19842618291234567 needs aid';
      const sanitized = provider.sanitizeText(input);

      expect(sanitized).not.toContain('1984261829');
      expect(sanitized).not.toContain('19842618291234567');
      expect(sanitized).toContain('[REDACTED_NID]');
    });

    it('redacts exact lat/long GPS coordinates', () => {
      const input = 'Boat location is 23.012345, 91.398211 near school';
      const sanitized = provider.sanitizeText(input);

      expect(sanitized).not.toContain('23.012345');
      expect(sanitized).not.toContain('91.398211');
      expect(sanitized).toContain('[REDACTED_COORDS]');
    });
  });

  describe('Fallback Behavior', () => {
    it('falls back to deterministic parser when forceFallback is true', async () => {
      const text = 'আমরা উত্তর চিথলিয়া প্রাইমারি স্কুলের ছাদে ৫ জন আটকে আছি। সাথে শিশু আছে।';
      const result = await provider.understandSos(text, true);

      expect(result.isFallback).toBe(true);
      expect(result.providerMode).toBe('deterministic_keyword_fallback');
      expect(result.extracted.peopleCount).toBe(5);
      expect(result.extracted.urgencyFlags.trapped).toBe(true);
      expect(result.extracted.urgencyFlags.child).toBe(true);
    });

    it('falls back to deterministic parser when API key is empty', async () => {
      const unconfiguredProvider = new GeminiAiProvider('', 2000);
      const text = 'Amra 4 jon chade atka, pregnant patient ache';
      const result = await unconfiguredProvider.understandSos(text, false);

      expect(result.isFallback).toBe(true);
      expect(result.providerMode).toBe('deterministic_keyword_fallback');
      expect(result.extracted.peopleCount).toBe(4);
      expect(result.extracted.urgencyFlags.medical).toBe(true);
    });
  });
});

