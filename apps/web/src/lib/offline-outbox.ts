export interface OutboxSosItem {
  clientReportId: string;
  peopleCount: number;
  elderlyCount: number;
  hasChild: boolean;
  hasMedicalNeed: boolean;
  isTrapped: boolean;
  locationLat: number | null;
  locationLng: number | null;
  areaId: string | null;
  areaName: string | null;
  rawPacket: string;
  checksum: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  createdAt: string;
  lastAttemptAt: string | null;
  errorNote: string | null;
}

const DB_NAME = 'aali_ai_sos_db';
const DB_VERSION = 1;
const STORE_NAME = 'sos_outbox';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB is not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'clientReportId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveToOutbox(item: OutboxSosItem): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // In environments without IndexedDB (e.g. Node tests), fallback to localStorage
    if (typeof localStorage !== 'undefined') {
      const items = getLocalStorageOutbox();
      items.push(item);
      localStorage.setItem(STORE_NAME, JSON.stringify(items));
    }
  }
}

export async function getOutboxItems(): Promise<OutboxSosItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    if (typeof localStorage !== 'undefined') {
      return getLocalStorageOutbox();
    }
    return [];
  }
}

export async function updateOutboxStatus(
  clientReportId: string,
  status: 'PENDING' | 'SENT' | 'FAILED',
  errorNote: string | null = null,
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(clientReportId);
      req.onsuccess = () => {
        const item: OutboxSosItem = req.result;
        if (item) {
          item.status = status;
          item.lastAttemptAt = new Date().toISOString();
          item.errorNote = errorNote;
          store.put(item);
        }
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    if (typeof localStorage !== 'undefined') {
      const items = getLocalStorageOutbox();
      const target = items.find((i) => i.clientReportId === clientReportId);
      if (target) {
        target.status = status;
        target.lastAttemptAt = new Date().toISOString();
        target.errorNote = errorNote;
        localStorage.setItem(STORE_NAME, JSON.stringify(items));
      }
    }
  }
}

function getLocalStorageOutbox(): OutboxSosItem[] {
  try {
    const raw = localStorage.getItem(STORE_NAME);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
