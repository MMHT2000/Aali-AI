/**
 * Calculates CRC-16/CCITT-FALSE checksum for a given ASCII string.
 * Polynomial: 0x1021, Initial value: 0xFFFF, No reflection, Final XOR: 0x0000.
 */
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

/**
 * Encodes a 16-bit number into a 4-character uppercase Base36 string.
 * e.g., 0 -> "0000", 65535 -> "1ELZ"
 */
export function encodeCrcBase36(crc: number): string {
  return crc.toString(36).toUpperCase().padStart(4, '0');
}

