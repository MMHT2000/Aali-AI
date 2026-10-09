import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { UserRole } from '../users/entities/user-role.enum';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { validateMockNidFormat, hashNid, ResidentRegistrationResult } from './nid-validation';
import { ResidentAccount } from './entities/resident-account.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(ResidentAccount) private readonly residentRepository: Repository<ResidentAccount>,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { username, password } = loginDto;

    const normalizedInput = username.trim().toLowerCase();
    // In demo/prototype mode, resolve user from seeded fixtures or registered users
    const user = SYNTHETIC_FENI_SEEDS.users.find((u) => {
      const uName = u.username?.toLowerCase();
      const uRole = u.role?.toLowerCase();
      return (
        uName === normalizedInput ||
        uRole === normalizedInput ||
        (normalizedInput === 'authority' && uName === 'authority_dc') ||
        (normalizedInput === 'responder' && uName === 'responder_feni') ||
        (normalizedInput === 'volunteer' && uName === 'volunteer_parshuram') ||
        (normalizedInput === 'recovery' && uName === 'recovery_coord') ||
        (normalizedInput === 'viewer' && uName === 'viewer_guest')
      );
    });

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

  async registerResident(dto: {
    fullName: string;
    phoneNumber: string;
    mockNid: string;
  }): Promise<ResidentRegistrationResult> {
    const formatCheck = validateMockNidFormat(dto.mockNid);
    if (!formatCheck.isValid) {
      throw new BadRequestException(formatCheck.error);
    }

    const cleanNid = dto.mockNid.trim();
    const hashSecret = this.configService.get<string>('NID_HASH_SECRET')
      ?? this.configService.get<string>('JWT_SECRET', 'aali_demo_nid_hmac_secret_change_before_deploy');
    const nidHash = hashNid(cleanNid, hashSecret);

    const residentId = `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const rawPhone = (dto.phoneNumber || '').trim();
    const redactedPhone = rawPhone.length >= 7
      ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-3)}`
      : '***-***';

    const record = this.residentRepository.create({
      id: residentId,
      display_name: dto.fullName || 'Anonymous Resident',
      phone_redacted: redactedPhone,
      nid_hash: nidHash,
      nid_last4: cleanNid.slice(-4),
    });
    try {
      await this.residentRepository.save(record);
    } catch (error) {
      const code = (error as { driverError?: { code?: string } })?.driverError?.code;
      if (code === 'ER_DUP_ENTRY') {
        throw new ConflictException('This demo NID has already been registered in the system.');
      }
      throw error;
    }

    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '30m');
    const accessToken = this.jwtService.sign({
      sub: record.id,
      username: `resident:${record.id}`,
      role: UserRole.RESIDENT,
      displayName: record.display_name,
    });

    return {
      residentId: record.id,
      nidLast4: record.nid_last4,
      phoneNumberRedacted: record.phone_redacted,
      registeredAt: record.created_at?.toISOString() ?? new Date().toISOString(),
      accessToken,
      expiresIn,
      disclaimer: 'Demo NID format check — not identity verification.',
    };
  }
}


