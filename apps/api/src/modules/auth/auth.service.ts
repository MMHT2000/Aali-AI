import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { UserRole } from '../users/entities/user-role.enum';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    // In demo/prototype mode, resolve user from seeded fixtures or registered users
    const user = SYNTHETIC_FENI_SEEDS.users.find(
      (u) => u.username?.toLowerCase() === username.toLowerCase(),
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Default password for all synthetic demo accounts is 'Admin123!'
    const isPasswordValid =
      password === 'Admin123!' ||
      (user.password_hash && (await bcrypt.compare(password, user.password_hash)));

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role as UserRole,
      displayName: user.display_name,
    };

    const accessToken = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '30m');

    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id!,
        username: user.username!,
        displayName: user.display_name!,
        role: user.role!,
      },
    };
  }
}

