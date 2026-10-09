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

  describe('Resident Registration (Mock NID Check)', () => {
    it('registers resident with valid 10-digit mock NID and redacts phone number', async () => {
      const res = await authService.registerResident({
        fullName: 'Md. Karim Ullah',
        phoneNumber: '01711223344',
        mockNid: '1984261829',
      });

      expect(res.residentId).toBeDefined();
      expect(res.nidHash).toHaveLength(64);
      expect(res.nidLast4).toBe('1829');
      expect(res.phoneNumberRedacted).toBe('017****344');
      expect(res.disclaimer).toContain('Demo NID format check — not identity verification');
    });

    it('rejects duplicate NID registration with ConflictException', async () => {
      // First registration
      await authService.registerResident({
        fullName: 'First Citizen',
        phoneNumber: '01711223344',
        mockNid: '1984261829',
      });

      // Second duplicate registration attempt
      await expect(
        authService.registerResident({
          fullName: 'Duplicate Tester',
          phoneNumber: '01799887766',
          mockNid: '1984261829',
        }),
      ).rejects.toThrow('This demo NID has already been registered in the system.');
    });

    it('rejects invalid length or format mock NID with BadRequestException', async () => {
      await expect(
        authService.registerResident({
          fullName: 'Bad NID',
          phoneNumber: '01811223344',
          mockNid: '12345', // Too short
        }),
      ).rejects.toThrow('NID length must be exactly 10 or 17 digits');
    });
  });
});


