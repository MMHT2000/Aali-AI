import { AlertsService } from './alerts.service';

describe('replay and warning error handling', () => {
  it('does not invent a replay for an unknown scenario or run', () => {
    const service = new AlertsService();
    expect(() => service.startReplay('missing')).toThrow('not found');
    expect(() => service.getReplayRun('missing')).toThrow('not found');
  });
  it('requires approval before simulated delivery and labels actual script capabilities', async () => {
    const service = new AlertsService();
    await expect(service.simulateBroadcast('warn-001')).rejects.toThrow('Approve');
    await service.approveWarning('warn-001', 'synthetic-authority', 'Synthetic test');
    await expect(service.simulateBroadcast('warn-001')).resolves.toMatchObject({ simulation: true, success: true });
    await expect(service.getLoudspeakerAudio('warn-001')).resolves.toMatchObject({ artifactType: 'SCRIPT_ONLY', durationSeconds: null, audioFormat: null });
    await expect(service.getLoudspeakerAudio('missing')).rejects.toThrow('not found');
  });
});
