export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  let hadAuth = false;

  try {
    const rawSession = typeof window !== 'undefined' ? window.localStorage?.getItem('aali_session') : null;
    if (rawSession) {
      const session: unknown = JSON.parse(rawSession);
      if (typeof session === 'object' && session !== null && 'accessToken' in session) {
        const token = (session as { accessToken?: unknown }).accessToken;
        if (typeof token === 'string' && token.length > 0) {
          headers.set('Authorization', `Bearer ${token}`);
          hadAuth = true;
        }
      }
    }
  } catch {
    // Keep public requests and test environments usable when browser storage is unavailable.
  }

  const response = await fetch(input, { ...init, headers });

  if (response.status === 401 && hadAuth) {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.removeItem('aali_session');
        window.dispatchEvent(new CustomEvent('aali_session_expired', { detail: { status: 401, url: String(input) } }));
      }
    } catch {
      // ignore storage access errors in restricted environments
    }
  }

  return response;
}
