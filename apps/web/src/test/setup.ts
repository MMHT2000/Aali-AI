import '@testing-library/jest-dom';

// Polyfill localStorage in Node 22+ jsdom environment where globalThis.localStorage is undefined
if (typeof window !== 'undefined') {
  const store = new Map<string, string>();
  const storagePolyfill: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  };

  try {
    Object.defineProperty(globalThis, 'localStorage', {
      value: storagePolyfill,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'localStorage', {
      value: storagePolyfill,
      writable: true,
      configurable: true,
    });
  } catch {
    // ignore
  }
}
