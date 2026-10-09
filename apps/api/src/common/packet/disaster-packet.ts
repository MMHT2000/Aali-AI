import { crc16CcittFalse, encodeCrcBase36 } from './crc16';

export interface DisasterPacketData {
  version: 'A1';
  type: 'S'; // 'S' for SOS report
  geohash7: string; // 7-char alphanumeric geohash, or "0000000" if unknown
  peopleCount: number; // 1 - 99
  flags: {
    elderly: boolean;
    child: boolean;
    medical: boolean;
    trapped: boolean;
  };
  timestamp: string; // "YYMMDD-HHMM" in Asia/Dhaka local time
  shortId: string; // 4-char uppercase alphanumeric short report ID
}

export type PacketParseOutcome =
  | { status: 'VALID'; data: DisasterPacketData; checksum: string; rawPacket: string }
  | { status: 'UNSUPPORTED_VERSION'; error: string; rawPacket: string }
  | { status: 'MALFORMED_FIELD'; error: string; rawPacket: string }
  | { status: 'CHECKSUM_MISMATCH'; expectedChecksum: string; actualChecksum: string; rawPacket: string };

/**
 * Encodes a DisasterPacketData object into a canonical ASCII Disaster Packet.
 * Format: A1|S|<geohash7>|<peopleCount(2 digits)>|E<0|1>C<0|1>M<0|1>T<0|1>|<YYMMDD-HHMM>|<shortId>|<checksum>
 * Length is ~48 characters, safely under 160 ASCII SMS limit.
 */
export function encodeDisasterPacket(data: Omit<DisasterPacketData, 'version' | 'type'>): string {
  const version = 'A1';
  const type = 'S';
  const geohash = (data.geohash7 || '0000000').toLowerCase().padEnd(7, '0').slice(0, 7);
  const people = Math.min(Math.max(1, Math.floor(data.peopleCount)), 99)
    .toString()
    .padStart(2, '0');

  const flagStr = `E${data.flags.elderly ? 1 : 0}C${data.flags.child ? 1 : 0}M${data.flags.medical ? 1 : 0}T${data.flags.trapped ? 1 : 0}`;
  const time = data.timestamp;
  const shortId = data.shortId.toUpperCase().padEnd(4, 'X').slice(0, 4);

  const payloadToSign = `${version}|${type}|${geohash}|${people}|${flagStr}|${time}|${shortId}`;
  const crc = crc16CcittFalse(payloadToSign);
  const checksum = encodeCrcBase36(crc);

  return `${payloadToSign}|${checksum}`;
}

/**
 * Parses and validates an ASCII Disaster Packet string.
 */
export function parseDisasterPacket(raw: string): PacketParseOutcome {
  const trimmed = raw.trim();
  const parts = trimmed.split('|');

  if (parts.length !== 8) {
    return {
      status: 'MALFORMED_FIELD',
      error: `Expected 8 pipe-delimited fields, received ${parts.length}`,
      rawPacket: trimmed,
    };
  }

  const [version, type, geohash, peopleStr, flagStr, timeStr, shortId, checksum] = parts;

  if (version !== 'A1') {
    return {
      status: 'UNSUPPORTED_VERSION',
      error: `Unsupported packet version: ${version}. Only A1 is supported.`,
      rawPacket: trimmed,
    };
  }

  if (type !== 'S') {
    return {
      status: 'MALFORMED_FIELD',
      error: `Unsupported message type: ${type}. Expected 'S' (SOS).`,
      rawPacket: trimmed,
    };
  }

  if (geohash.length !== 7 || !/^[0-9a-z]{7}$/i.test(geohash)) {
    return {
      status: 'MALFORMED_FIELD',
      error: `Invalid geohash7: '${geohash}'. Expected 7 alphanumeric characters.`,
      rawPacket: trimmed,
    };
  }

  const peopleCount = parseInt(peopleStr, 10);
  if (isNaN(peopleCount) || peopleCount < 1 || peopleCount > 99) {
    return {
      status: 'MALFORMED_FIELD',
      error: `Invalid people count: '${peopleStr}'. Expected integer between 01 and 99.`,
      rawPacket: trimmed,
    };
  }

  const flagRegex = /^E([01])C([01])M([01])T([01])$/;
  const flagMatch = flagStr.match(flagRegex);
  if (!flagMatch) {
    return {
      status: 'MALFORMED_FIELD',
      error: `Invalid flags format: '${flagStr}'. Expected 'E<0|1>C<0|1>M<0|1>T<0|1>'`,
      rawPacket: trimmed,
    };
  }

  if (!/^\d{6}-\d{4}$/.test(timeStr)) {
    return {
      status: 'MALFORMED_FIELD',
      error: `Invalid timestamp format: '${timeStr}'. Expected 'YYMMDD-HHMM'`,
      rawPacket: trimmed,
    };
  }

  if (shortId.length !== 4 || !/^[0-9A-Z]{4}$/i.test(shortId)) {
    return {
      status: 'MALFORMED_FIELD',
      error: `Invalid short report ID: '${shortId}'. Expected 4 alphanumeric characters.`,
      rawPacket: trimmed,
    };
  }

  const payloadToVerify = `${version}|${type}|${geohash}|${peopleStr}|${flagStr}|${timeStr}|${shortId}`;
  const calculatedCrc = crc16CcittFalse(payloadToVerify);
  const expectedChecksum = encodeCrcBase36(calculatedCrc);

  if (checksum.toUpperCase() !== expectedChecksum) {
    return {
      status: 'CHECKSUM_MISMATCH',
      expectedChecksum,
      actualChecksum: checksum.toUpperCase(),
      rawPacket: trimmed,
    };
  }

  return {
    status: 'VALID',
    data: {
      version: 'A1',
      type: 'S',
      geohash7: geohash.toLowerCase(),
      peopleCount,
      flags: {
        elderly: flagMatch[1] === '1',
        child: flagMatch[2] === '1',
        medical: flagMatch[3] === '1',
        trapped: flagMatch[4] === '1',
      },
      timestamp: timeStr,
      shortId: shortId.toUpperCase(),
    },
    checksum: expectedChecksum,
    rawPacket: trimmed,
  };
}

