import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@ApiTags('events')
@ApiHeader({
  name: 'X-FIS-EPN-KEY',
  description: 'API Key para autenticación',
  required: true,
})
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo evento' })
  @ApiResponse({ status: 201, description: 'Evento registrado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'API Key inválida o faltante' })
  registerEvent(@Body() dto: CreateEventDto) {
    return this.eventsService.registerEvent(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los eventos' })
  @ApiResponse({ status: 200, description: 'Lista de eventos' })
  @ApiResponse({ status: 401, description: 'API Key inválida o faltante' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get('source/:source')
  @ApiOperation({ summary: 'Buscar eventos por source' })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos filtrados por source',
  })
  @ApiResponse({ status: 401, description: 'API Key inválida o faltante' })
  findBySource(@Param('source') source: string) {
    return this.eventsService.findBySource(source);
  }

  @Get('entity/:entity')
  @ApiOperation({ summary: 'Buscar eventos por entity' })
  @ApiResponse({
    status: 200,
    description: 'Lista de eventos filtrados por entity',
  })
  @ApiResponse({ status: 401, description: 'API Key inválida o faltante' })
  findByEntity(@Param('entity') entity: string) {
    return this.eventsService.findByEntity(entity);
  }
}
