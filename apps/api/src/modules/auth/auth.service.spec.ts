import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRole } from '../users/entities/user-role.enum';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('30m'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should authenticate seeded demo user with valid credentials', async () => {
    const result = await authService.login({
      username: 'authority_dc',
      password: 'Admin123!',
    });

    expect(result).toBeDefined();
    expect(result.accessToken).toBe('mock.jwt.token');
    expect(result.user.username).toBe('authority_dc');
    expect(result.user.role).toBe(UserRole.AUTHORITY);
  });

  it('should reject invalid username with UnauthorizedException', async () => {
    await expect(
      authService.login({
        username: 'non_existent_user',
        password: 'Admin123!',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should reject wrong password with UnauthorizedException', async () => {
    await expect(
      authService.login({
        username: 'authority_dc',
        password: 'wrong_password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

