export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  try {
    const rawSession = window.localStorage.getItem('aali_session');
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
  return fetch(input, { ...init, headers });
}
