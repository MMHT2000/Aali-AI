import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';
import { BrainControlDto, BrainPersonalizeDto, BrainQueryDto, BrainReviewDto } from './brain.dto';
import { BrainService } from './brain.service';
import { BRAIN_AREAS } from './brain.types';
import { RateLimit } from '../../common/auth/rate-limit.guard';
import { Public } from '../../common/auth/public.decorator';

@ApiTags('AI Brain · Area intelligence') @ApiBearerAuth()
@Controller('api/v1/brain')
@Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.RECOVERY_COORDINATOR)
export class BrainController {
  constructor(private readonly brain: BrainService) {}
  @Get('autonomy/status') @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.RECOVERY_COORDINATOR, UserRole.ADMIN)
  autonomyStatus() { return this.brain.autonomyStatus(); }
  @Post('autonomy/control') @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  control(@Body() body: BrainControlDto, @Request() req: { user: { id: string; role: UserRole } }) { return this.brain.setAutonomyControl(body, req.user); }
  @Get('areas') @Public() @Roles() areas() { return BRAIN_AREAS; }
  @Post('household') @Public() @Roles() @RateLimit(20, 60)
  household(@Body() body: BrainPersonalizeDto) { return this.brain.household(body); }
  @Get('latest') async latest(@Query() query: BrainQueryDto, @Request() req: { user: { role: UserRole } }) { return this.brain.project(await this.brain.latest(query), req.user.role); }
  @Post('run') @RateLimit(6, 60)
  async run(@Body() body: BrainQueryDto, @Request() req: { user: { role: UserRole } }) { return this.brain.project(await this.brain.run(body), req.user.role); }
  @Post('personalize') personalize(@Body() body: BrainPersonalizeDto) { return this.brain.personal(body); }
  @Post('runs/:id/review') async review(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: BrainReviewDto, @Request() req: { user: { id: string; role: UserRole } }) { return this.brain.project(await this.brain.review(id, body, req.user), req.user.role); }
}
