import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
import { Public } from '../../common/auth/public.decorator';

@ApiTags('Auth')
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Authenticate user with username and password' })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful, returns JWT access token',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Invalid username or password' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  @ApiResponse({ status: 200, description: 'Current authenticated user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@Request() req: { user: unknown }) {
    return req.user;
  }

  @Post('resident-register')
  @Public()
  @ApiOperation({ summary: 'Register resident with demo mock NID format & uniqueness check' })
  @ApiResponse({ status: 201, description: 'Resident registration successful' })
  @ApiResponse({ status: 400, description: 'Invalid mock NID format or length' })
  @ApiResponse({ status: 409, description: 'Mock NID already registered' })
  async registerResident(
    @Body()
    body: {
      fullName: string;
      phoneNumber: string;
      mockNid: string;
    },
  ) {
    return this.authService.registerResident(body);
  }
}
