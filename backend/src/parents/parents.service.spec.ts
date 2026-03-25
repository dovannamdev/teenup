import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { Parent } from '../entities/parent.entity';

describe('ParentsService', () => {
  let service: ParentsService;
  let repo: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentsService,
        { provide: getRepositoryToken(Parent), useValue: repo },
      ],
    }).compile();

    service = module.get<ParentsService>(ParentsService);
  });

  describe('create', () => {
    it('should create a parent', async () => {
      const dto = { name: 'Nguyen Van A', phone: '0909123456', email: 'a@test.com' };
      const result = await service.create(dto);
      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result).toHaveProperty('name', 'Nguyen Van A');
    });
  });

  describe('findOne', () => {
    it('should return parent with students', async () => {
      const parent = { id: 1, name: 'Nguyen Van A', students: [] };
      repo.findOne.mockResolvedValue(parent);
      const result = await service.findOne(1);
      expect(result).toEqual(parent);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 }, relations: ['students'] });
    });

    it('should throw NotFoundException for missing parent', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all parents', async () => {
      const parents = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }];
      repo.find.mockResolvedValue(parents);
      const result = await service.findAll();
      expect(result).toEqual(parents);
    });
  });
});
