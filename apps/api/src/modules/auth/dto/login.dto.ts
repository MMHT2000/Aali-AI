import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'authority_dc', description: 'Username for demo account' })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'Admin123!', description: 'Password' })
  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Bearer JWT access token' })
  accessToken!: string;

  @ApiProperty({ example: '30m', description: 'Token expiration window' })
  expiresIn!: string;

  @ApiProperty({
    description: 'Safe user profile payload',
    example: {
      id: '00000000-0000-0000-0000-000000000002',
      username: 'authority_dc',
      displayName: 'Deputy Commissioner (Authority)',
      role: 'AUTHORITY',
    },
  })
  user!: {
    id: string;
    username: string;
    displayName: string;
    role: string;
  };
}

