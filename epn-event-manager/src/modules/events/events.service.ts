import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(CreateEventEntity)
    private readonly createRepo: Repository<CreateEventEntity>,
    @InjectRepository(UpdateEventEntity)
    private readonly updateRepo: Repository<UpdateEventEntity>,
    @InjectRepository(DeleteEventEntity)
    private readonly deleteRepo: Repository<DeleteEventEntity>,
    @InjectRepository(QueryEventEntity)
    private readonly queryRepo: Repository<QueryEventEntity>,
    private readonly loggerService: LoggerService,
  ) {}

  async registerEvent(dto: CreateEventDto): Promise<{ ok: boolean }> {
    try {
      this.logger.log(
        `Registering event: ${dto.action} for entity ${dto.entity}`,
      );
      this.loggerService.log(
        `Registering event: ${dto.action} for entity ${dto.entity}`,
        'EventsService',
      );

      const action = (dto.action ?? '').toUpperCase();
      const payloadStr = JSON.stringify(dto.payload ?? {});
      // Corrección: Usar formato ISO 8601 en lugar de formato local
      const isoDate = new Date().toISOString();

      if (action === 'CREATE') {
        const ev = this.createRepo.create({
          source: dto.source,
          entity: dto.entity,
          action: dto.action,
          title: dto.title,
          description: dto.description,
          payload: payloadStr,
          recorded_at: isoDate,
        });
        await this.createRepo.save(ev);
        this.logger.log(`CREATE event saved successfully with ID: ${ev.id}`);
        this.loggerService.log(
          `CREATE event saved successfully with ID: ${ev.id}`,
          'EventsService',
        );
        return { ok: true };
      }

      if (action === 'UPDATE') {
        const ev = this.updateRepo.create({
          source: dto.source,
          entity: dto.entity,
          action: dto.action,
          title: dto.title,
          description: dto.description,
          payload: payloadStr,
          timestamp: isoDate,
        });
        await this.updateRepo.save(ev);
        this.logger.log(`UPDATE event saved successfully with ID: ${ev.id}`);
        this.loggerService.log(
          `UPDATE event saved successfully with ID: ${ev.id}`,
          'EventsService',
        );
        return { ok: true };
      }

      if (action === 'DELETE') {
        // Corrección de bug: Agregar await para persistir el evento
        const ev = this.deleteRepo.create({
          source: dto.source,
          entity: dto.entity,
          action: dto.action,
          title: dto.title,
          payload: payloadStr,
          createdAt: isoDate,
        });
        await this.deleteRepo.save(ev);
        this.logger.log(`DELETE event saved successfully with ID: ${ev.id}`);
        this.loggerService.log(
          `DELETE event saved successfully with ID: ${ev.id}`,
          'EventsService',
        );
        return { ok: true };
      }

      if (action === 'QUERY') {
        const ev = this.queryRepo.create({
          source: dto.source,
          entity: dto.entity,
          action: dto.action,
          title: dto.title,
          description: dto.description,
          payload: payloadStr,
          event_date: isoDate,
        });
        await this.queryRepo.save(ev);
        this.logger.log(`QUERY event saved successfully with ID: ${ev.id}`);
        this.loggerService.log(
          `QUERY event saved successfully with ID: ${ev.id}`,
          'EventsService',
        );
        return { ok: true };
      }

      this.logger.warn(`Unknown action: ${action}`);
      this.loggerService.warn(`Unknown action: ${action}`, 'EventsService');
      return { ok: false };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error registering event: ${err.message}`, err.stack);
      this.loggerService.error(
        `Error registering event: ${err.message}`,
        err.stack,
        'EventsService',
      );
      throw error;
    }
  }

  async findAll(): Promise<object[]> {
    try {
      this.logger.log('Fetching all events');
      this.loggerService.log('Fetching all events', 'EventsService');

      const creates = await this.createRepo.find();
      const updates = await this.updateRepo.find();
      const deletes = await this.deleteRepo.find();
      const queries = await this.queryRepo.find();

      // Corrección: Ordenar por timestamp ISO 8601 en lugar de strings locales
      const merged = [
        ...creates.map((e) => ({ ...e, _table: 'create_events' })),
        ...updates.map((e) => ({ ...e, _table: 'update_events' })),
        ...deletes.map((e) => ({ ...e, _table: 'delete_events' })),
        ...queries.map((e) => ({ ...e, _table: 'query_events' })),
      ];

      merged.sort((a, b) => {
        const ra = a as unknown as Record<string, string>;
        const rb = b as unknown as Record<string, string>;
        const ta =
          ra.recorded_at ?? ra.timestamp ?? ra.createdAt ?? ra.event_date ?? '';
        const tb =
          rb.recorded_at ?? rb.timestamp ?? rb.createdAt ?? rb.event_date ?? '';
        return ta.localeCompare(tb);
      });

      this.logger.log(`Found ${merged.length} events total`);
      this.loggerService.log(
        `Found ${merged.length} events total`,
        'EventsService',
      );
      return merged;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error fetching all events: ${err.message}`, err.stack);
      this.loggerService.error(
        `Error fetching all events: ${err.message}`,
        err.stack,
        'EventsService',
      );
      throw error;
    }
  }

  async findBySource(source: string): Promise<object[]> {
    try {
      this.logger.log(`Finding events by source: ${source}`);
      this.loggerService.log(
        `Finding events by source: ${source}`,
        'EventsService',
      );

      // Sanitización: Validar que source no sea vacío
      if (!source || source.trim() === '') {
        throw new Error('Source parameter cannot be empty');
      }

      const creates = await this.createRepo.findBy({ source });
      const updates = await this.updateRepo.findBy({ source });
      const deletes = await this.deleteRepo.findBy({ source });
      const queries = await this.queryRepo.findBy({ source });

      const result = [...creates, ...updates, ...deletes, ...queries];
      this.logger.log(`Found ${result.length} events for source: ${source}`);
      this.loggerService.log(
        `Found ${result.length} events for source: ${source}`,
        'EventsService',
      );
      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding events by source: ${err.message}`,
        err.stack,
      );
      this.loggerService.error(
        `Error finding events by source: ${err.message}`,
        err.stack,
        'EventsService',
      );
      throw error;
    }
  }

  async findByEntity(entity: string): Promise<object[]> {
    try {
      this.logger.log(`Finding events by entity: ${entity}`);
      this.loggerService.log(
        `Finding events by entity: ${entity}`,
        'EventsService',
      );

      // Sanitización: Validar que entity no sea vacío
      if (!entity || entity.trim() === '') {
        throw new Error('Entity parameter cannot be empty');
      }

      const creates = await this.createRepo.findBy({ entity });
      const updates = await this.updateRepo.findBy({ entity });
      const deletes = await this.deleteRepo.findBy({ entity });
      const queries = await this.queryRepo.findBy({ entity });

      const result = [...creates, ...updates, ...deletes, ...queries];
      this.logger.log(`Found ${result.length} events for entity: ${entity}`);
      this.loggerService.log(
        `Found ${result.length} events for entity: ${entity}`,
        'EventsService',
      );
      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding events by entity: ${err.message}`,
        err.stack,
      );
      this.loggerService.error(
        `Error finding events by entity: ${err.message}`,
        err.stack,
        'EventsService',
      );
      throw error;
    }
  }

  async getStats(): Promise<object> {
    try {
      this.logger.log('Fetching event statistics');
      this.loggerService.log('Fetching event statistics', 'EventsService');

      const createCount = await this.createRepo.count();
      const updateCount = await this.updateRepo.count();
      const deleteCount = await this.deleteRepo.count();
      const queryCount = await this.queryRepo.count();

      // Corrección: Incluir query_events en el total
      const result = {
        create: createCount,
        update: updateCount,
        delete: deleteCount,
        query: queryCount,
        total: createCount + updateCount + deleteCount + queryCount,
      };

      this.logger.log(`Statistics: ${JSON.stringify(result)}`);
      this.loggerService.log(
        `Statistics: ${JSON.stringify(result)}`,
        'EventsService',
      );
      return result;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error fetching statistics: ${err.message}`, err.stack);
      this.loggerService.error(
        `Error fetching statistics: ${err.message}`,
        err.stack,
        'EventsService',
      );
      throw error;
    }
  }
}
