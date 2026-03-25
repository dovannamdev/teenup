import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { ClassEntity } from '../entities/class.entity';

describe('ClassesService', () => {
  let service: ClassesService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassesService,
        { provide: getRepositoryToken(ClassEntity), useValue: repo },
      ],
    }).compile();

    service = module.get<ClassesService>(ClassesService);
  });

  describe('create', () => {
    it('should create a class', async () => {
      const dto = {
        name: 'Toan', subject: 'Math', day_of_week: 'Monday',
        time_slot: '08:00-09:30', teacher_name: 'Thay M', max_students: 5,
      };
      const result = await service.create(dto);
      expect(result).toHaveProperty('name', 'Toan');
    });
  });

  describe('findAll', () => {
    it('should return classes with builder', async () => {
      const classes = [{ id: 1, name: 'Toan' }];
      const qb = {
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(classes),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll();
      expect(result).toEqual(classes);
    });

    it('should filter by day', async () => {
      const qb = {
        loadRelationCountAndMap: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);

      await service.findAll('Monday');
      expect(qb.where).toHaveBeenCalledWith('class.day_of_week = :day', { day: 'Monday' });
    });
  });

  describe('findOne', () => {
    it('should return class with registrations', async () => {
      const cls = { id: 1, name: 'Toan', registrations: [] };
      repo.findOne.mockResolvedValue(cls);
      const result = await service.findOne(1);
      expect(result).toEqual(cls);
    });

    it('should throw NotFoundException', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
