import { UnderstandSosRequest, DuplicateSimilarityRequest, DraftCommunicationRequest, OutageRequest, ShiftSummaryRequest, VoiceRequest } from '../../common/validation/workflow.dto';
import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { Roles } from '../../common/auth/roles.decorator';
import { UserRole } from '../users/entities/user-role.enum';

@ApiTags('AI-Assisted Language Features & Fallback')
@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'Get current AI provider mode and fallback status' })
  @Get('status')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  getStatus() {
    return this.aiService.getProviderStatus();
  }

  @ApiOperation({ summary: 'Toggle simulated AI provider outage to demonstrate deterministic fallback' })
  @Put('status/outage')
  @Roles(UserRole.ADMIN)
  setOutageState(@Body() body: OutageRequest) {
    return this.aiService.setOutageState(body.outage);
  }

  @ApiOperation({ summary: 'Extract structured SOS fields from Bangla/Banglish text' })
  @Post('understand-sos')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER)
  understandSos(@Body() body: UnderstandSosRequest) {
    return this.aiService.understandSos(body);
  }

  @ApiOperation({ summary: 'Explain text duplicate candidate similarity' })
  @Post('duplicate-similarity')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER)
  duplicateSimilarity(@Body() body: DuplicateSimilarityRequest) {
    return this.aiService.explainDuplicateSimilarity(body);
  }

  @ApiOperation({ summary: 'Draft Bangla emergency communication citing source record IDs' })
  @Post('draft-communication')
  @Roles(UserRole.AUTHORITY)
  draftCommunication(@Body() body: DraftCommunicationRequest) {
    return this.aiService.draftCommunication(body);
  }

  @ApiOperation({ summary: 'Get 30 synthetic benchmark flood messages' })
  @Get('benchmark/samples')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  getBenchmarkSamples() {
    return this.aiService.getBenchmarkSamples();
  }

  @ApiOperation({ summary: 'Execute benchmark evaluation report across 30 messages' })
  @Get('benchmark')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  runBenchmark() {
    return this.aiService.runBenchmark();
  }

  @ApiOperation({ summary: 'Generate fact-constrained operations shift summary (Phase 10 stretch)' })
  @Post('shift-summary')
  @Roles(UserRole.AUTHORITY, UserRole.ADMIN)
  generateShiftSummary(
    @Body()
    body: ShiftSummaryRequest,
  ) {
    return this.aiService.generateShiftSummary(body || {});
  }

  @ApiOperation({ summary: 'Synthetic voice transcript fixture; real audio transcription is not connected' })
  @Post('transcribe-voice-sos')
  @Roles(UserRole.AUTHORITY, UserRole.RESPONDER, UserRole.ADMIN)
  transcribeVoiceSos(
    @Body()
    body: VoiceRequest,
  ) {
    return this.aiService.transcribeVoiceSos(body || {});
  }
}

