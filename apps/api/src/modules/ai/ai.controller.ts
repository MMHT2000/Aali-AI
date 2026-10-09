import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  AiService,
  DraftCommunicationDto,
  DuplicateSimilarityDto,
  UnderstandSosDto,
} from './ai.service';

@ApiTags('AI-Assisted Language Features & Fallback')
@Controller('api/v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @ApiOperation({ summary: 'Get current AI provider mode and fallback status' })
  @Get('status')
  getStatus() {
    return this.aiService.getProviderStatus();
  }

  @ApiOperation({ summary: 'Toggle simulated AI provider outage to demonstrate deterministic fallback' })
  @Put('status/outage')
  setOutageState(@Body('outage') outage: boolean) {
    return this.aiService.setOutageState(outage);
  }

  @ApiOperation({ summary: 'Extract structured SOS fields from Bangla/Banglish text' })
  @Post('understand-sos')
  understandSos(@Body() body: UnderstandSosDto) {
    return this.aiService.understandSos(body);
  }

  @ApiOperation({ summary: 'Explain text duplicate candidate similarity' })
  @Post('duplicate-similarity')
  duplicateSimilarity(@Body() body: DuplicateSimilarityDto) {
    return this.aiService.explainDuplicateSimilarity(body);
  }

  @ApiOperation({ summary: 'Draft Bangla emergency communication citing source record IDs' })
  @Post('draft-communication')
  draftCommunication(@Body() body: DraftCommunicationDto) {
    return this.aiService.draftCommunication(body);
  }

  @ApiOperation({ summary: 'Get 30 synthetic benchmark flood messages' })
  @Get('benchmark/samples')
  getBenchmarkSamples() {
    return this.aiService.getBenchmarkSamples();
  }

  @ApiOperation({ summary: 'Execute benchmark evaluation report across 30 messages' })
  @Get('benchmark')
  runBenchmark() {
    return this.aiService.runBenchmark();
  }
}

