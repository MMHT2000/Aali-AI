import { BmdCapService } from './bmd-cap.service';

function capAlert(identifier: string, overrides: { msgType?: string; expires?: string; references?: string } = {}) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
    <identifier>${identifier}</identifier><sender>bmd@example.invalid</sender><sent>2026-10-10T01:00:00+00:00</sent>
    <status>Actual</status><msgType>${overrides.msgType ?? 'Alert'}</msgType><scope>Public</scope>
    ${overrides.references ? `<references>${overrides.references}</references>` : ''}
    <info><language>en-US</language><category>Met</category><event>Heavy rainfall</event>
      <urgency>Immediate</urgency><severity>Severe</severity><certainty>Likely</certainty>
      <effective>2026-10-09T00:00:00+00:00</effective><expires>${overrides.expires ?? '2026-10-11T00:00:00+00:00'}</expires>
      <headline>Heavy rain warning</headline><description>Rain may cause flooding.</description>
      <instruction>Avoid flooded roads.</instruction><area><areaDesc>Feni</areaDesc></area>
    </info>
  </alert>`;
}

function feed(...items: string[]) {
  const entries = items.map((id, index) => `<item><title>${id}</title><link>https://cap.bmd.gov.bd/api/cap/${index}.xml</link></item>`).join('');
  return `<rss><channel><lastBuildDate>Sat, 10 Oct 2026 01:00:00 GMT</lastBuildDate>${entries}</channel></rss>`;
}

describe('BmdCapService', () => {
  const originalFetch = global.fetch;

  afterEach(() => { global.fetch = originalFetch; });

  it('returns only current Actual alert/update records, with public provenance and source freshness', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(new Response(feed('active', 'expired', 'test'), { status: 200 }))
      .mockResolvedValueOnce(new Response(capAlert('active'), { status: 200 }))
      .mockResolvedValueOnce(new Response(capAlert('expired', { expires: '2026-10-01T00:00:00Z' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(capAlert('test').replace('<status>Actual</status>', '<status>Test</status>'), { status: 200 }));
    const service = new BmdCapService();

    const result = await service.getSnapshot();

    expect(result.alerts.map((alert) => alert.id)).toEqual(['active']);
    expect(result.alerts[0]).toMatchObject({ headline: 'Heavy rain warning', severity: 'Severe', areas: ['Feni'], provenance: 'EXTERNAL_OBSERVATION' });
    expect(result.status.availability).toBe('AVAILABLE');
    expect(result.status.latestObservedAt).toBe('2026-10-10T01:00:00.000Z');
    expect(result.status.message).toContain('1 current unexpired Actual CAP alert');
  });

  it('suppresses an alert referenced by a current cancellation', async () => {
    global.fetch = jest.fn()
      .mockResolvedValueOnce(new Response(feed('original', 'cancel'), { status: 200 }))
      .mockResolvedValueOnce(new Response(capAlert('original'), { status: 200 }))
      .mockResolvedValueOnce(new Response(capAlert('cancel', { msgType: 'Cancel', references: 'bmd@example.invalid,original,2026-10-10T01:00:00Z' }), { status: 200 }));
    const result = await new BmdCapService().getSnapshot();

    expect(result.alerts).toEqual([]);
  });

  it('keeps feed failure visible and never turns it into a no-alert status', async () => {
    global.fetch = jest.fn().mockResolvedValue(new Response('upstream error', { status: 503 }));
    const result = await new BmdCapService().getSnapshot();

    expect(result.status.availability).toBe('UNAVAILABLE');
    expect(result.status.message).toContain('CAP feed check failed');
    expect(result.status.message).not.toContain('no current unexpired');
  });
});
