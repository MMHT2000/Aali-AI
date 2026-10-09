import { ConflictException, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { UserRole } from '../users/entities/user-role.enum';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { validateMockNidFormat, hashNid, ResidentRegistrationResult } from './nid-validation';

interface RegisteredResidentRecord {
  id: string;
  fullName: string;
  phoneNumberRedacted: string;
  nidHash: string;
  nidLast4: string;
  registeredAt: string;
}

@Injectable()
export class AuthService {
  // In-memory registry of residents registered during demo session
  private readonly registeredResidents = new Map<string, RegisteredResidentRecord>();

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
    const nidHash = hashNid(cleanNid);

    // Enforce uniqueness against already-registered residents in demo session
    if (this.registeredResidents.has(nidHash)) {
      throw new ConflictException('This demo NID has already been registered in the system.');
    }

    const residentId = `res-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const rawPhone = (dto.phoneNumber || '').trim();
    const redactedPhone = rawPhone.length >= 7
      ? `${rawPhone.slice(0, 3)}****${rawPhone.slice(-3)}`
      : '***-***';

    const record: RegisteredResidentRecord = {
      id: residentId,
      fullName: dto.fullName || 'Anonymous Resident',
      phoneNumberRedacted: redactedPhone,
      nidHash,
      nidLast4: cleanNid.slice(-4),
      registeredAt: new Date().toISOString(),
    };

    this.registeredResidents.set(nidHash, record);

    return {
      residentId: record.id,
      nidHash: record.nidHash,
      nidLast4: record.nidLast4,
      phoneNumberRedacted: record.phoneNumberRedacted,
      registeredAt: record.registeredAt,
      disclaimer: 'Demo NID format check — not identity verification.',
    };
  }
}


