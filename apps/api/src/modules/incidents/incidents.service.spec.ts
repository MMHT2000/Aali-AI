import { SosService } from '../sos/sos.service';
import { IncidentsService } from './incidents.service';

describe('IncidentsService event scope', () => {
  it('only returns synthetic incident and silent-village fixtures for the active exercise event', async () => {
    const service = new IncidentsService({} as SosService);

    expect((await service.getIncidents('11111111-1111-1111-1111-111111111103')).length).toBeGreaterThan(0);
    expect(await service.getIncidents('11111111-1111-1111-1111-111111111101')).toEqual([]);
    expect(service.getSilentVillages('11111111-1111-1111-1111-111111111103').length).toBeGreaterThan(0);
    expect(service.getSilentVillages('11111111-1111-1111-1111-111111111101')).toEqual([]);
  });
});
