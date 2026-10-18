import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimitGuard } from './rate-limit.guard';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RateLimitGuard(reflector);
  });

  function mockContext(ip: string): ExecutionContext {
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          ip,
          socket: { remoteAddress: ip },
        }),
      }),
    } as unknown as ExecutionContext;
  }

  it('allows requests within rate limit', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ limit: 5, ttlSeconds: 60 });
    const ctx = mockContext('192.168.1.100');

    for (let i = 0; i < 5; i++) {
      expect(guard.canActivate(ctx)).toBe(true);
    }
  });

  it('throws 429 TooManyRequestsException when limit is exceeded', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ limit: 3, ttlSeconds: 60 });
    const ctx = mockContext('192.168.1.101');

    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);
    expect(guard.canActivate(ctx)).toBe(true);

    try {
      guard.canActivate(ctx);
      fail('Expected 429 HttpException');
    } catch (err: unknown) {
      expect(err).toBeInstanceOf(HttpException);
      expect((err as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
    }
  });
  it('does not let an AI request consume the SOS route allowance', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ limit: 1, ttlSeconds: 60 });
    const first = mockContext('192.168.1.102');
    const second = mockContext('192.168.1.102');
    first.getHandler = () => function analyze() {};
    second.getHandler = () => function submitSos() {};
    expect(guard.canActivate(first)).toBe(true);
    expect(guard.canActivate(second)).toBe(true);
    expect(() => guard.canActivate(first)).toThrow(HttpException);
  });
});

