export function crc16CcittFalse(str: string): number {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    crc ^= (code & 0xff) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc & 0xffff;
}

export function encodeCrcBase36(crc: number): string {
  return crc.toString(36).toUpperCase().padStart(4, '0');
}

export interface ClientPacketPayload {
  geohash7?: string;
  peopleCount: number;
  flags: {
    elderly: boolean;
    child: boolean;
    medical: boolean;
    trapped: boolean;
  };
  shortId: string;
}

export function buildClientDisasterPacket(payload: ClientPacketPayload): {
  rawPacket: string;
  checksum: string;
} {
  const version = 'A1';
  const type = 'S';
  const geohash = (payload.geohash7 || '0000000').toLowerCase().padEnd(7, '0').slice(0, 7);
  const people = Math.min(Math.max(1, Math.floor(payload.peopleCount)), 99)
    .toString()
    .padStart(2, '0');

  const flagStr = `E${payload.flags.elderly ? 1 : 0}C${payload.flags.child ? 1 : 0}M${payload.flags.medical ? 1 : 0}T${payload.flags.trapped ? 1 : 0}`;

  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const hh = String(now.getUTCHours()).padStart(2, '0');
  const min = String(now.getUTCMinutes()).padStart(2, '0');
  const timestampStr = `${yy}${mm}${dd}-${hh}${min}`;

  const shortId = payload.shortId.toUpperCase().padEnd(4, 'X').slice(0, 4);

  const payloadToSign = `${version}|${type}|${geohash}|${people}|${flagStr}|${timestampStr}|${shortId}`;
  const crc = crc16CcittFalse(payloadToSign);
  const checksum = encodeCrcBase36(crc);

  return {
    rawPacket: `${payloadToSign}|${checksum}`,
    checksum,
  };
}

