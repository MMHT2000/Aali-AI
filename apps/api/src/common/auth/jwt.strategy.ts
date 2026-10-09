import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../modules/users/entities/user-role.enum';

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
  displayName: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'replace-with-a-long-random-local-development-secret',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload || !payload.sub || !payload.role) {
      throw new UnauthorizedException('Invalid JWT token claims');
    }
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
      displayName: payload.displayName,
    };
  }
}

