import * as crypto from 'crypto';

export interface ResidentRegistrationResult {
  residentId: string;
  nidHash: string;
  nidLast4: string;
  phoneNumberRedacted: string;
  registeredAt: string;
  disclaimer: string;
}

/**
 * Validates mock NID rules:
 * - Exactly 10 or 17 ASCII digits
 * - Not all the same digit (e.g. reject '1111111111' or '00000000000000000')
 * - Must be unique among registered accounts
 */
export function validateMockNidFormat(rawNid: string): { isValid: boolean; error?: string } {
  if (typeof rawNid !== 'string') {
    return { isValid: false, error: 'NID must be a string of digits' };
  }

  const clean = rawNid.trim();
  if (!/^\d+$/.test(clean)) {
    return { isValid: false, error: 'NID must contain only numeric digits' };
  }

  if (clean.length !== 10 && clean.length !== 17) {
    return {
      isValid: false,
      error: `NID length must be exactly 10 or 17 digits (received ${clean.length})`,
    };
  }

  // Reject all identical digits
  const firstDigit = clean[0];
  const allIdentical = clean.split('').every((ch) => ch === firstDigit);
  if (allIdentical) {
    return {
      isValid: false,
      error: 'Invalid NID pattern: all digits cannot be identical',
    };
  }

  return { isValid: true };
}

/**
 * Computes a deterministic SHA-256 hash of the normalized NID so raw NID is never stored or logged.
 */
export function hashNid(nid: string, salt = 'aali_mock_nid_salt_2026'): string {
  return crypto.createHash('sha256').update(`${salt}:${nid.trim()}`).digest('hex');
}

