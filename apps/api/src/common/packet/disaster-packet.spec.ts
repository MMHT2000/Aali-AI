import {
  encodeDisasterPacket,
  parseDisasterPacket,
} from './disaster-packet';

describe('Disaster Packet Serializer & Parser', () => {
  const sampleData = {
    geohash7: 'wh0xs6m',
    peopleCount: 5,
    flags: {
      elderly: true,
      child: false,
      medical: true,
      trapped: false,
    },
    timestamp: '261009-1430',
    shortId: '7Q2K',
  };

  it('should encode packet into an ASCII string under 160 characters', () => {
    const packet = encodeDisasterPacket(sampleData);
    expect(packet.startsWith('A1|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|')).toBe(true);
    expect(packet.length).toBeLessThan(60);
    // Verified ASCII printable characters only
    expect(/^[\x20-\x7E]+$/.test(packet)).toBe(true);
  });

  it('should round-trip encode and decode without data loss', () => {
    const raw = encodeDisasterPacket(sampleData);
    const result = parseDisasterPacket(raw);

    expect(result.status).toBe('VALID');
    if (result.status === 'VALID') {
      expect(result.data.geohash7).toBe('wh0xs6m');
      expect(result.data.peopleCount).toBe(5);
      expect(result.data.flags.elderly).toBe(true);
      expect(result.data.flags.child).toBe(false);
      expect(result.data.flags.medical).toBe(true);
      expect(result.data.flags.trapped).toBe(false);
      expect(result.data.timestamp).toBe('261009-1430');
      expect(result.data.shortId).toBe('7Q2K');
    }
  });

  it('should reject packet with corrupt or mismatched checksum', () => {
    const raw = encodeDisasterPacket(sampleData);
    // Tamper with people count without altering checksum
    const tampered = raw.replace('|05|', '|99|');
    const result = parseDisasterPacket(tampered);

    expect(result.status).toBe('CHECKSUM_MISMATCH');
    if (result.status === 'CHECKSUM_MISMATCH') {
      expect(result.expectedChecksum).not.toBe(result.actualChecksum);
    }
  });

  it('should reject packet with unsupported version', () => {
    const invalidVersion = 'B2|S|wh0xs6m|05|E1C0M1T0|261009-1430|7Q2K|0000';
    const result = parseDisasterPacket(invalidVersion);
    expect(result.status).toBe('UNSUPPORTED_VERSION');
  });

  it('should reject malformed fields (e.g. invalid people count or flags format)', () => {
    const badFlags = 'A1|S|wh0xs6m|05|INVALID|261009-1430|7Q2K|0000';
    const result = parseDisasterPacket(badFlags);
    expect(result.status).toBe('MALFORMED_FIELD');
  });

  it('should handle zero-padded geohash when location is unknown', () => {
    const unknownLoc = {
      ...sampleData,
      geohash7: '0000000',
    };
    const raw = encodeDisasterPacket(unknownLoc);
    const result = parseDisasterPacket(raw);
    expect(result.status).toBe('VALID');
    if (result.status === 'VALID') {
      expect(result.data.geohash7).toBe('0000000');
    }
  });
});

