import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SYNTHETIC_FENI_SEEDS } from '../../database/seeds/feni-synthetic.seeds';

@ApiTags('Reference Data')
@Controller('api/v1')
export class ReferenceDataController {
  @Get('events')
  @ApiOperation({ summary: 'List flood events and replay scenarios' })
  @ApiResponse({ status: 200, description: 'List of events' })
  getEvents() {
    return SYNTHETIC_FENI_SEEDS.floodEvents;
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get details for a specific flood event' })
  getEventById(@Param('id') id: string) {
    return (
      SYNTHETIC_FENI_SEEDS.floodEvents.find((e) => e.id === id) || {
        error: 'Event not found',
      }
    );
  }

  @Get('areas')
  @ApiOperation({ summary: 'List areas, upazilas and villages in Feni' })
  getAreas() {
    return SYNTHETIC_FENI_SEEDS.areas;
  }

  @Get('shelters')
  @ApiOperation({ summary: 'List active emergency flood shelters' })
  getShelters() {
    return SYNTHETIC_FENI_SEEDS.shelters;
  }

  @Get('assets')
  @ApiOperation({ summary: 'List available rescue assets and boats' })
  getAssets() {
    return SYNTHETIC_FENI_SEEDS.assets;
  }
}

