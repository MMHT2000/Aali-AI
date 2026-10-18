import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('Reference Data')
@Controller('api/v1')
export class ReferenceDataController {
  @Get('events')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN, UserRole.RESIDENT)
  @ApiOperation({ summary: 'List flood events and replay scenarios' })
  @ApiResponse({ status: 200, description: 'List of events' })
  getEvents() {
    return SYNTHETIC_FENI_SEEDS.floodEvents;
  }

  @Get('events/:id')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN, UserRole.RESIDENT)
  @ApiOperation({ summary: 'Get details for a specific flood event' })
  getEventById(@Param('id') id: string) {
    const event = SYNTHETIC_FENI_SEEDS.floodEvents.find(e => e.id === id);
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  @Get('areas')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN, UserRole.RESIDENT)
  @ApiOperation({ summary: 'List areas, upazilas and villages in Feni' })
  getAreas() {
    return SYNTHETIC_FENI_SEEDS.areas;
  }

  @Get('shelters')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.VOLUNTEER, UserRole.RECOVERY_COORDINATOR, UserRole.VIEWER, UserRole.ADMIN, UserRole.RESIDENT)
  @ApiOperation({ summary: 'List active emergency flood shelters' })
  getShelters() {
    return SYNTHETIC_FENI_SEEDS.shelters;
  }

  @Get('assets')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER)
  @ApiOperation({ summary: 'List available rescue assets and boats' })
  getAssets() {
    return SYNTHETIC_FENI_SEEDS.assets;
  }
}

