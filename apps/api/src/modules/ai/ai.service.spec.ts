import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';

describe('legacy voice demonstration boundaries', () => {
  const service = () => new AiService(new ConfigService({ AI_API_KEY: '', GEMINI_API_KEY: '' }));
  it('labels fixture transcripts as simulated and does not invent a transcription confidence', async () => {
    const result = await service().transcribeVoiceSos({ simulatedVoiceNoteId: 'sample-feni-parshuram-01' });
    expect(result.simulation).toBe(true); expect(result.confidence).toBeNull(); expect(result.transcriptBn).toContain('৫ জন');
  });
  it('rejects unsupported audio rather than silently replacing it with a sample', async () => {
    await expect(service().transcribeVoiceSos({ audioBase64: 'c3ludGhldGljLWF1ZGlv' })).rejects.toThrow('Audio transcription is not connected');
  });
});
