import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { CreateEventEntity } from '../../database/entities/create-event.entity';
import { UpdateEventEntity } from '../../database/entities/update-event.entity';
import { DeleteEventEntity } from '../../database/entities/delete-event.entity';
import { QueryEventEntity } from '../../database/entities/query-event.entity';
import { LoggerService } from '../../common/logger/logger.service';
import { CreateEventDto } from './dto/create-event.dto';

describe('EventsService', () => {
  let service: EventsService;

  const mockCreateRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    count: jest.fn(),
  };

  const mockUpdateRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    count: jest.fn(),
  };

  const mockDeleteRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    count: jest.fn(),
  };

  const mockQueryRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findBy: jest.fn(),
    count: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(CreateEventEntity),
          useValue: mockCreateRepo,
        },
        {
          provide: getRepositoryToken(UpdateEventEntity),
          useValue: mockUpdateRepo,
        },
        {
          provide: getRepositoryToken(DeleteEventEntity),
          useValue: mockDeleteRepo,
        },
        {
          provide: getRepositoryToken(QueryEventEntity),
          useValue: mockQueryRepo,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('registerEvent', () => {
    it('should register a CREATE event successfully', async () => {
      const dto: CreateEventDto = {
        source: 'test-source',
        entity: 'test-entity',
        action: 'CREATE',
        title: 'Test Event',
        description: 'Test Description',
        payload: { key: 'value' },
      };

      const mockEvent = { id: 1, ...dto };
      mockCreateRepo.create.mockReturnValue(mockEvent);
      mockCreateRepo.save.mockResolvedValue(mockEvent);

      const result = await service.registerEvent(dto);

      expect(result).toEqual({ ok: true });
      expect(mockCreateRepo.create).toHaveBeenCalled();
      expect(mockCreateRepo.save).toHaveBeenCalled();
    });

    it('should register an UPDATE event successfully', async () => {
      const dto: CreateEventDto = {
        source: 'test-source',
        entity: 'test-entity',
        action: 'UPDATE',
        title: 'Test Event',
        description: 'Test Description',
        payload: { key: 'value' },
      };

      const mockEvent = { id: 1, ...dto };
      mockUpdateRepo.create.mockReturnValue(mockEvent);
      mockUpdateRepo.save.mockResolvedValue(mockEvent);

      const result = await service.registerEvent(dto);

      expect(result).toEqual({ ok: true });
      expect(mockUpdateRepo.create).toHaveBeenCalled();
      expect(mockUpdateRepo.save).toHaveBeenCalled();
    });

    it('should register a DELETE event successfully', async () => {
      const dto: CreateEventDto = {
        source: 'test-source',
        entity: 'test-entity',
        action: 'DELETE',
        title: 'Test Event',
        description: 'Test Description',
        payload: { key: 'value' },
      };

      const mockEvent = { id: 1, ...dto };
      mockDeleteRepo.create.mockReturnValue(mockEvent);
      mockDeleteRepo.save.mockResolvedValue(mockEvent);

      const result = await service.registerEvent(dto);

      expect(result).toEqual({ ok: true });
      expect(mockDeleteRepo.create).toHaveBeenCalled();
      expect(mockDeleteRepo.save).toHaveBeenCalled();
    });

    it('should register a QUERY event successfully', async () => {
      const dto: CreateEventDto = {
        source: 'test-source',
        entity: 'test-entity',
        action: 'QUERY',
        title: 'Test Event',
        description: 'Test Description',
        payload: { key: 'value' },
      };

      const mockEvent = { id: 1, ...dto };
      mockQueryRepo.create.mockReturnValue(mockEvent);
      mockQueryRepo.save.mockResolvedValue(mockEvent);

      const result = await service.registerEvent(dto);

      expect(result).toEqual({ ok: true });
      expect(mockQueryRepo.create).toHaveBeenCalled();
      expect(mockQueryRepo.save).toHaveBeenCalled();
    });

    it('should return false for unknown action', async () => {
      const dto: CreateEventDto = {
        source: 'test-source',
        entity: 'test-entity',
        action: 'UNKNOWN',
        title: 'Test Event',
        description: 'Test Description',
        payload: { key: 'value' },
      };

      const result = await service.registerEvent(dto);
      expect(result).toEqual({ ok: false });
    });

    it('should throw an error and log it when database save fails', async () => {
      const dto: CreateEventDto = {
        source: 'test-source',
        entity: 'test-entity',
        action: 'CREATE',
        title: 'Test Event',
        description: 'Test Description',
        payload: { key: 'value' },
      };

      mockCreateRepo.create.mockReturnValue({});
      mockCreateRepo.save.mockRejectedValue(new Error('DB Error'));

      await expect(service.registerEvent(dto)).rejects.toThrow('DB Error');
      expect(mockLoggerService.error).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all events from all tables', async () => {
      mockCreateRepo.find.mockResolvedValue([{ id: 1, title: 'Event 1' }]);
      mockUpdateRepo.find.mockResolvedValue([{ id: 2, title: 'Event 2' }]);
      mockDeleteRepo.find.mockResolvedValue([{ id: 3, title: 'Event 3' }]);
      mockQueryRepo.find.mockResolvedValue([{ id: 4, title: 'Event 4' }]);

      const result = await service.findAll();

      expect(result).toHaveLength(4);
      expect(mockCreateRepo.find).toHaveBeenCalled();
      expect(mockUpdateRepo.find).toHaveBeenCalled();
      expect(mockDeleteRepo.find).toHaveBeenCalled();
      expect(mockQueryRepo.find).toHaveBeenCalled();
    });

    it('should handle errors during findAll', async () => {
      mockCreateRepo.find.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findBySource', () => {
    it('should return events filtered by source', async () => {
      const source = 'test-source';
      mockCreateRepo.findBy.mockResolvedValue([{ id: 1, source }]);
      mockUpdateRepo.findBy.mockResolvedValue([{ id: 2, source }]);
      mockDeleteRepo.findBy.mockResolvedValue([{ id: 3, source }]);
      mockQueryRepo.findBy.mockResolvedValue([{ id: 4, source }]);

      const result = await service.findBySource(source);

      expect(result).toHaveLength(4);
      expect(mockCreateRepo.findBy).toHaveBeenCalledWith({ source });
      expect(mockUpdateRepo.findBy).toHaveBeenCalledWith({ source });
      expect(mockDeleteRepo.findBy).toHaveBeenCalledWith({ source });
      expect(mockQueryRepo.findBy).toHaveBeenCalledWith({ source });
    });

    it('should throw error for empty source', async () => {
      await expect(service.findBySource('')).rejects.toThrow(
        'Source parameter cannot be empty',
      );
    });

    it('should throw error for whitespace source', async () => {
      await expect(service.findBySource('   ')).rejects.toThrow(
        'Source parameter cannot be empty',
      );
    });
  });

  describe('findByEntity', () => {
    it('should return events filtered by entity', async () => {
      const entity = 'test-entity';
      mockCreateRepo.findBy.mockResolvedValue([{ id: 1, entity }]);
      mockUpdateRepo.findBy.mockResolvedValue([{ id: 2, entity }]);
      mockDeleteRepo.findBy.mockResolvedValue([{ id: 3, entity }]);
      mockQueryRepo.findBy.mockResolvedValue([{ id: 4, entity }]);

      const result = await service.findByEntity(entity);

      expect(result).toHaveLength(4);
      expect(mockCreateRepo.findBy).toHaveBeenCalledWith({ entity });
      expect(mockUpdateRepo.findBy).toHaveBeenCalledWith({ entity });
      expect(mockDeleteRepo.findBy).toHaveBeenCalledWith({ entity });
      expect(mockQueryRepo.findBy).toHaveBeenCalledWith({ entity });
    });

    it('should throw error for empty entity', async () => {
      await expect(service.findByEntity('')).rejects.toThrow(
        'Entity parameter cannot be empty',
      );
    });

    it('should throw error for whitespace entity', async () => {
      await expect(service.findByEntity('   ')).rejects.toThrow(
        'Entity parameter cannot be empty',
      );
    });
  });

  describe('getStats', () => {
    it('should return statistics including query events', async () => {
      mockCreateRepo.count.mockResolvedValue(10);
      mockUpdateRepo.count.mockResolvedValue(5);
      mockDeleteRepo.count.mockResolvedValue(3);
      mockQueryRepo.count.mockResolvedValue(7);

      const result = await service.getStats();

      expect(result).toEqual({
        create: 10,
        update: 5,
        delete: 3,
        query: 7,
        total: 25,
      });
    });

    it('should handle errors during getStats', async () => {
      mockCreateRepo.count.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(service.getStats()).rejects.toThrow('Database error');
    });
  });
});
