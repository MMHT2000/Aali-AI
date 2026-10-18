import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const RATE_LIMIT_KEY = 'rate_limit';
export interface RateLimitOptions {
  limit: number;
  ttlSeconds: number;
}

export const RateLimit = (limit = 30, ttlSeconds = 60) =>
  SetMetadata(RATE_LIMIT_KEY, { limit, ttlSeconds });

interface HitRecord {
  timestamps: number[];
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, HitRecord>();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no rate limit defined on handler or controller, pass
    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip =
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    const windowStart = now - options.ttlSeconds * 1000;

    // Independent routes must not consume each other's emergency/AI allowance.
    // request.ip respects the server's proxy configuration; arbitrary forwarded
    // headers must not let callers bypass limits.
    const key = `${context.getClass().name}:${context.getHandler().name}:${ip}`;
    let record = this.hits.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.hits.set(key, record);
    }

    // Prune expired timestamps
    record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

    if (record.timestamps.length >= options.limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit of ${options.limit} requests per ${options.ttlSeconds}s exceeded.`,
          retryAfter: Math.ceil((record.timestamps[0] + options.ttlSeconds * 1000 - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.timestamps.push(now);
    return true;
  }
}

