import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from '../entities/subscription.entity';
import { Student } from '../entities/student.entity';

describe('SubscriptionsService', () => {
  let service: SubscriptionsService;
  let subRepo: Record<string, jest.Mock>;
  let studentRepo: Record<string, jest.Mock>;

  beforeEach(async () => {
    subRepo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
    };
    studentRepo = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionsService,
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
      ],
    }).compile();

    service = module.get<SubscriptionsService>(SubscriptionsService);
  });

  describe('create', () => {
    it('should create subscription for valid student', async () => {
      studentRepo.findOne.mockResolvedValue({ id: 1 });
      const dto = {
        studentId: 1, package_name: 'Goi 3 Thang',
        start_date: '2025-01-01', end_date: '2025-04-01', total_sessions: 10,
      };
      const result = await service.create(dto);
      expect(result).toHaveProperty('package_name', 'Goi 3 Thang');
      expect(result).toHaveProperty('used_sessions', 0);
    });

    it('should reject for invalid student', async () => {
      studentRepo.findOne.mockResolvedValue(null);
      const dto = {
        studentId: 999, package_name: 'Test',
        start_date: '2025-01-01', end_date: '2025-04-01', total_sessions: 5,
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should return subscription with remaining count', async () => {
      subRepo.findOne.mockResolvedValue({
        id: 1, total_sessions: 10, used_sessions: 3, student: { id: 1 },
      });
      const result = await service.findOne(1);
      expect(result.remaining_sessions).toBe(7);
    });

    it('should throw NotFoundException', async () => {
      subRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('useSession', () => {
    it('should increment used_sessions', async () => {
      const sub = { id: 1, total_sessions: 10, used_sessions: 3 };
      subRepo.findOne.mockResolvedValue(sub);
      subRepo.save.mockResolvedValue({ ...sub, used_sessions: 4 });

      const result = await service.useSession(1);
      expect(sub.used_sessions).toBe(4);
    });

    it('should reject if all sessions used', async () => {
      subRepo.findOne.mockResolvedValue({ id: 1, total_sessions: 10, used_sessions: 10 });
      await expect(service.useSession(1)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException', async () => {
      subRepo.findOne.mockResolvedValue(null);
      await expect(service.useSession(999)).rejects.toThrow(NotFoundException);
    });
  });
});
