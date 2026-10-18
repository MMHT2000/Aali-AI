import { firstValueFrom } from 'rxjs';
import { OperationsStreamService } from './operations-stream.service';

describe('public operation change notifications', () => {
  it('does not expose SOS or field details through the public stream', async () => {
    const service = new OperationsStreamService();
    const next = firstValueFrom(service.getStream());
    OperationsStreamService.emitStatic('NEW_SOS', { reportId: 'private-id', village: 'private-village', peopleCount: 5, isTrapped: true });
    const event = await next;
    expect(event.data).toMatchObject({ type: 'NEW_SOS', payload: {} });
    expect(JSON.stringify(event)).not.toContain('private');
  });
});
