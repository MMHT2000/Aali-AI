import {
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator';
import { RolesGuard } from '../../common/auth/roles.guard';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { UserRole } from './entities/user-role.enum';

@ApiTags('Users & Protected Demo Routes')
@Controller('api/v1/users')
export class UsersController {
  @Get('demo-accounts')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'List available synthetic demo accounts and roles' })
  @ApiResponse({ status: 200, description: 'Synthetic demo accounts metadata' })
  getDemoAccounts() {
    return SYNTHETIC_FENI_SEEDS.users.map((u) => ({
      username: u.username,
      displayName: u.display_name,
      role: u.role,
      defaultPasswordHint: 'Admin123!',
      isSynthetic: true,
    }));
  }

  @Post('authority-action')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Protected action restricted to AUTHORITY or ADMIN' })
  @ApiResponse({ status: 200, description: 'Action authorized' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-authority roles' })
  authorityAction() {
    return {
      status: 'success',
      message: 'Authority-level authorization verified.',
    };
  }

  @Post('responder-action')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.RESPONDER, UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Protected action restricted to RESPONDER or ADMIN' })
  @ApiResponse({ status: 200, description: 'Action authorized' })
  @ApiResponse({ status: 403, description: 'Forbidden for non-responder roles' })
  responderAction() {
    return {
      status: 'success',
      message: 'Responder-level authorization verified.',
    };
  }
}

