import { describe, it, expect } from '@jest/globals';
import { validateMockNidFormat, hashNid } from './nid-validation';

describe('Mock NID Format & Validation Logic', () => {
  it('accepts valid 10-digit NID', () => {
    const res = validateMockNidFormat('1984261829');
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('accepts valid 17-digit NID', () => {
    const res = validateMockNidFormat('19842618293817264');
    expect(res.isValid).toBe(true);
    expect(res.error).toBeUndefined();
  });

  it('rejects invalid lengths', () => {
    expect(validateMockNidFormat('123456789').isValid).toBe(false); // 9 digits
    expect(validateMockNidFormat('12345678901').isValid).toBe(false); // 11 digits
    expect(validateMockNidFormat('1234567890123456').isValid).toBe(false); // 16 digits
    expect(validateMockNidFormat('123456789012345678').isValid).toBe(false); // 18 digits
  });

  it('rejects non-digit characters', () => {
    expect(validateMockNidFormat('198426182A').isValid).toBe(false);
    expect(validateMockNidFormat('1984-261829').isValid).toBe(false);
    expect(validateMockNidFormat('abcdefghij').isValid).toBe(false);
  });

  it('rejects all-identical digits for both 10 and 17 digits', () => {
    expect(validateMockNidFormat('0000000000').isValid).toBe(false);
    expect(validateMockNidFormat('1111111111').isValid).toBe(false);
    expect(validateMockNidFormat('99999999999999999').isValid).toBe(false);
    expect(validateMockNidFormat('77777777777777777').isValid).toBe(false);
  });

  it('generates consistent one-way hash without leaking plaintext', () => {
    const hash1 = hashNid('1984261829');
    const hash2 = hashNid('1984261829');
    const hashDiff = hashNid('1984261830');

    expect(hash1).toBe(hash2);
    expect(hash1).not.toBe(hashDiff);
    expect(hash1).toHaveLength(64); // sha256 hex
  });
});

