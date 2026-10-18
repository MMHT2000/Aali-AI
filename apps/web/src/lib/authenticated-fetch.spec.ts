import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiFetch } from './authenticated-fetch';

describe('unauthorized session recovery', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); localStorage.clear(); });
  it('signals expiry when an in-memory screen has no stored token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    const expired = vi.fn(); window.addEventListener('aali_session_expired', expired);
    try { await apiFetch('/api/v1/operations/snapshot'); expect(expired).toHaveBeenCalledTimes(1); }
    finally { window.removeEventListener('aali_session_expired', expired); }
  });
  it('clears rejected credentials and signals expiry', async () => {
    localStorage.setItem('aali_session', JSON.stringify({ accessToken: 'expired-token' }));
    const request = vi.fn().mockResolvedValue(new Response('{}', { status: 401 })); vi.stubGlobal('fetch', request);
    await apiFetch('/api/v1/operations/snapshot');
    expect(new Headers(request.mock.calls[0][1].headers).get('Authorization')).toBe('Bearer expired-token');
    expect(localStorage.getItem('aali_session')).toBeNull();
  });
  it('does not clear a newer sign-in when an old request fails late', async () => {
    localStorage.setItem('aali_session', JSON.stringify({ accessToken: 'old-token' }));
    let finish!: (response: Response) => void;
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise<Response>(resolve => { finish = resolve; })));
    const expired = vi.fn(); window.addEventListener('aali_session_expired', expired);
    try {
      const pending = apiFetch('/api/v1/operations/snapshot');
      localStorage.setItem('aali_session', JSON.stringify({ accessToken: 'new-token' }));
      finish(new Response('{}', { status: 401 })); await pending;
      expect(JSON.parse(localStorage.getItem('aali_session')!).accessToken).toBe('new-token'); expect(expired).not.toHaveBeenCalled();
    } finally { window.removeEventListener('aali_session_expired', expired); }
  });
  it('signals expiry even if browser storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Storage blocked'); });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    const expired = vi.fn(); window.addEventListener('aali_session_expired', expired);
    try { await apiFetch('/api/v1/operations/snapshot'); expect(expired).toHaveBeenCalledTimes(1); }
    finally { window.removeEventListener('aali_session_expired', expired); }
  });
});
