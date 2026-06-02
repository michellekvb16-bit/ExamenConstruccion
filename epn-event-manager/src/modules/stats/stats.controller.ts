import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { EventsService } from '../events/events.service';

@ApiTags('stats')
@ApiHeader({
  name: 'X-FIS-EPN-KEY',
  description: 'API Key para autenticación',
  required: true,
})
@Controller('stats')
export class StatsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener estadísticas de eventos' })
  @ApiResponse({ status: 200, description: 'Estadísticas de eventos' })
  @ApiResponse({ status: 401, description: 'API Key inválida o faltante' })
  getStats() {
    return this.eventsService.getStats();
  }
}
