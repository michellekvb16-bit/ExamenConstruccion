import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Verificar salud del servicio' })
  @ApiResponse({
    status: 200,
    description: 'Servicio funcionando correctamente',
  })
  check() {
    // Corrección: Usar timestamp ISO 8601
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
