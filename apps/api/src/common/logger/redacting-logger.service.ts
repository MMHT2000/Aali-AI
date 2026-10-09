import { LoggerService } from '@nestjs/common';

export class RedactingLogger implements LoggerService {
  private readonly phoneRegex = /(\+?880\d{10}|\b01[3-9]\d{8}\b)/g;
  private readonly jwtRegex = /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g;
  private readonly secretRegex = /("?(?:password|token|secret|jwt)"?\s*[:=]\s*"?)[^"\s,]+/gi;

  private sanitize(message: unknown): string {
    if (typeof message !== 'string') {
      try {
        message = JSON.stringify(message);
      } catch {
        message = String(message);
      }
    }

    return (message as string)
      .replace(this.phoneRegex, '[PHONE_REDACTED]')
      .replace(this.jwtRegex, '[JWT_REDACTED]')
      .replace(this.secretRegex, '$1[REDACTED]');
  }

  log(message: unknown, ...optionalParams: unknown[]) {
    console.log(`[LOG] ${new Date().toISOString()} ${this.sanitize(message)}`, ...optionalParams);
  }

  error(message: unknown, ...optionalParams: unknown[]) {
    console.error(`[ERROR] ${new Date().toISOString()} ${this.sanitize(message)}`, ...optionalParams);
  }

  warn(message: unknown, ...optionalParams: unknown[]) {
    console.warn(`[WARN] ${new Date().toISOString()} ${this.sanitize(message)}`, ...optionalParams);
  }

  debug?(message: unknown, ...optionalParams: unknown[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[DEBUG] ${new Date().toISOString()} ${this.sanitize(message)}`, ...optionalParams);
    }
  }

  verbose?(message: unknown, ...optionalParams: unknown[]) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[VERBOSE] ${new Date().toISOString()} ${this.sanitize(message)}`, ...optionalParams);
    }
  }
}

