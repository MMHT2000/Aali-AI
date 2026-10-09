import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { RedactingLogger } from './redacting-logger.service';

describe('RedactingLogger Service', () => {
  let logger: RedactingLogger;
  let logSpy: ReturnType<typeof jest.spyOn>;
  let errorSpy: ReturnType<typeof jest.spyOn>;
  let warnSpy: ReturnType<typeof jest.spyOn>;

  beforeEach(() => {
    logger = new RedactingLogger();
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('redacts Bangladeshi phone numbers in strings and objects', () => {
    logger.log('Dispatch SMS sent to +8801812345678 and 01711223344');
    expect(logSpy).toHaveBeenCalledTimes(1);
    const loggedStr = logSpy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[PHONE_REDACTED]');
    expect(loggedStr).not.toContain('+8801812345678');
    expect(loggedStr).not.toContain('01711223344');
  });

  it('redacts JWT tokens from application logs', () => {
    const fakeJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozG4m1e_fake_signature_hash_value';
    logger.error(`Session header bearer: ${fakeJwt}`);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const loggedStr = errorSpy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[JWT_REDACTED]');
    expect(loggedStr).not.toContain(fakeJwt);
  });

  it('redacts passwords and secret fields in JSON logs', () => {
    logger.warn({ user: 'admin', password: 'SuperSecretPassword123!', apiKey: 'secret=my-secret-key' });
    expect(warnSpy).toHaveBeenCalledTimes(1);
    const loggedStr = warnSpy.mock.calls[0][0] as string;
    expect(loggedStr).toContain('[REDACTED]');
    expect(loggedStr).not.toContain('SuperSecretPassword123!');
  });
});
