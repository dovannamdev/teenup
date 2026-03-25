import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentRepo: Record<string, jest.Mock>;
  let parentRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    studentRepo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    parentRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: getRepositoryToken(Parent), useValue: parentRepo },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
  });

  describe('create', () => {
    it('should create student with valid parent', async () => {
      parentRepo.findOne.mockResolvedValue({ id: 1, name: 'Parent A' });
      const dto = { name: 'Student C', dob: '2015-01-01', gender: 'male', current_grade: '5', parentId: 1 };
      const result = await service.create(dto);
      expect(result).toHaveProperty('name', 'Student C');
      expect(result).toHaveProperty('parent_id', 1);
    });

    it('should reject student with invalid parentId', async () => {
      parentRepo.findOne.mockResolvedValue(null);
      const dto = { name: 'Student X', dob: '2015-01-01', gender: 'male', current_grade: '5', parentId: 999 };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return student with parent', async () => {
      const student = { id: 1, name: 'C', parent: { id: 1, name: 'A' } };
      studentRepo.findOne.mockResolvedValue(student);
      const result = await service.findOne(1);
      expect(result).toEqual(student);
    });

    it('should throw NotFoundException', async () => {
      studentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});
