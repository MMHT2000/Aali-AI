export async function safeJson<T = any>(res: any): Promise<T | null> {
  if (!res) return null;
  if (typeof res.ok === 'boolean' && !res.ok) return null;
  if (typeof res.text === 'function') {
    try {
      const text = await res.text();
      if (!text || !text.trim()) return null;
      const trimmed = text.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        return JSON.parse(trimmed) as T;
      }
      return null;
    } catch {
      return null;
    }
  }
  if (typeof res.json === 'function') {
    try {
      return (await res.json()) as T;
    } catch {
      return null;
    }
  }
  return null;
}
