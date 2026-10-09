import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';
import { firstValueFrom, isObservable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isPublic) {
      const result = super.canActivate(context);
      return isObservable(result) ? firstValueFrom(result) : result;
    }
    const request = context.switchToHttp().getRequest<{ headers?: { authorization?: string } }>();
    if (request.headers?.authorization?.startsWith('Bearer ')) {
      try {
        const result = super.canActivate(context);
        return isObservable(result) ? await firstValueFrom(result) : await result;
      } catch {
        // Public intake remains available if an optional/stale client token is present.
      }
    }
    return true;
  }
}
