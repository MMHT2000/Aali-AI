export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  let requestSession: string | null = null;

  try {
    const rawSession = typeof window !== 'undefined' ? window.localStorage?.getItem('aali_session') : null;
    requestSession = rawSession ?? null;
    if (rawSession) {
      const session: unknown = JSON.parse(rawSession);
      if (typeof session === 'object' && session !== null && 'accessToken' in session) {
        const token = (session as { accessToken?: unknown }).accessToken;
        if (typeof token === 'string' && token.length > 0) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      }
    }
  } catch {
    // Keep public requests and test environments usable when browser storage is unavailable.
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 && typeof window !== 'undefined') {
    // A screen may still hold its session after storage was cleared in this or another tab.
    // Missing credentials must invalidate that in-memory state too. A late failure from an
    // older request must not log out a user who has since signed in with a new session.
    try {
      const currentSession = window.localStorage?.getItem('aali_session');
      if (currentSession && currentSession !== requestSession) return response;
      window.localStorage?.removeItem('aali_session');
    } catch {
      // Storage access failure must not prevent the app from leaving an unauthorized screen.
    }
    window.dispatchEvent(new CustomEvent('aali_session_expired', { detail: { status: 401, url: String(input) } }));
  }

  return response;
}
