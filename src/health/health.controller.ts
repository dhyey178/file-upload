import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check API health status' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy.',
    schema: {
      properties: {
        status: { type: 'string', example: 'Service is healthy!' },
      },
    },
  })
  getHealth(): { status: string } {
    const status = this.healthService.getHealthStatus();
    return { status };
  }
}
