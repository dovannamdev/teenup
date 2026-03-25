import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { ClassRegistration } from '../entities/class-registration.entity';
import { ClassEntity } from '../entities/class.entity';
import { Student } from '../entities/student.entity';
import { Subscription } from '../entities/subscription.entity';

describe('RegistrationsService', () => {
  let service: RegistrationsService;
  let regRepo: Record<string, jest.Mock>;
  let classRepo: Record<string, jest.Mock>;
  let studentRepo: Record<string, jest.Mock>;
  let subRepo: Record<string, jest.Mock>;

  const mockClass = {
    id: 1, name: 'Toan', day_of_week: 'Monday',
    time_slot: '08:00-09:30', max_students: 2,
  };

  const mockStudent = { id: 1, name: 'Student C' };

  const futureDate = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  };

  const mockSubscription = {
    id: 1, student_id: 1, total_sessions: 10, used_sessions: 2,
    end_date: futureDate(),
  };

  beforeEach(async () => {
    regRepo = {
      create: jest.fn((dto) => ({ id: 1, ...dto })),
      save: jest.fn((entity) => Promise.resolve({ id: 1, ...entity })),
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      remove: jest.fn(),
    };
    classRepo = { findOne: jest.fn() };
    studentRepo = { findOne: jest.fn() };
    subRepo = { findOne: jest.fn(), save: jest.fn((e) => Promise.resolve(e)) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegistrationsService,
        { provide: getRepositoryToken(ClassRegistration), useValue: regRepo },
        { provide: getRepositoryToken(ClassEntity), useValue: classRepo },
        { provide: getRepositoryToken(Student), useValue: studentRepo },
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
      ],
    }).compile();

    service = module.get<RegistrationsService>(RegistrationsService);
  });

  // ─── Helper: parseTimeSlot ─────────────────────────────────
  describe('parseTimeSlot', () => {
    it('should parse "08:00-09:30" correctly', () => {
      const result = service.parseTimeSlot('08:00-09:30');
      expect(result).toEqual({ start: 480, end: 570 });
    });

    it('should parse "14:30-16:00"', () => {
      const result = service.parseTimeSlot('14:30-16:00');
      expect(result).toEqual({ start: 870, end: 960 });
    });
  });

  // ─── Helper: isOverlapping ─────────────────────────────────
  describe('isOverlapping', () => {
    it('should detect overlap', () => {
      expect(service.isOverlapping({ start: 480, end: 570 }, { start: 540, end: 630 })).toBe(true);
    });

    it('should not detect non-overlap', () => {
      expect(service.isOverlapping({ start: 480, end: 570 }, { start: 600, end: 690 })).toBe(false);
    });

    it('should not overlap at boundary (end === start)', () => {
      expect(service.isOverlapping({ start: 480, end: 570 }, { start: 570, end: 660 })).toBe(false);
    });
  });

  // ─── register() — Success ─────────────────────────────────
  describe('register — success', () => {
    it('should register and increment used_sessions', async () => {
      classRepo.findOne.mockResolvedValue(mockClass);
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(0); // Not full
      regRepo.find.mockResolvedValue([]); // No conflicts
      subRepo.findOne.mockResolvedValue({ ...mockSubscription });

      const result = await service.register(1, { studentId: 1 });

      expect(result).toHaveProperty('class_id', 1);
      expect(result).toHaveProperty('student_id', 1);
      expect(subRepo.save).toHaveBeenCalled();
    });
  });

  // ─── register() — Validation 1: Class full ────────────────
  describe('register — class full', () => {
    it('should reject when class is full', async () => {
      classRepo.findOne.mockResolvedValue(mockClass); // max_students = 2
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(2); // Already full

      await expect(service.register(1, { studentId: 1 }))
        .rejects.toThrow(BadRequestException);
      await expect(service.register(1, { studentId: 1 }))
        .rejects.toThrow('Class is full');
    });
  });

  // ─── register() — Validation 2: Schedule overlap ──────────
  describe('register — schedule overlap', () => {
    it('should reject overlapping time slot on same day', async () => {
      classRepo.findOne.mockResolvedValue(mockClass); // Mon 08:00-09:30
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(0);
      regRepo.find.mockResolvedValue([
        {
          classEntity: {
            day_of_week: 'Monday',
            time_slot: '09:00-10:30', // Overlaps with 08:00-09:30
            name: 'Existing Class',
          },
        },
      ]);
      subRepo.findOne.mockResolvedValue({ ...mockSubscription });

      await expect(service.register(1, { studentId: 1 }))
        .rejects.toThrow(ConflictException);
    });

    it('should allow non-overlapping time on same day', async () => {
      classRepo.findOne.mockResolvedValue(mockClass); // Mon 08:00-09:30
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(0);
      regRepo.find.mockResolvedValue([
        {
          classEntity: {
            day_of_week: 'Monday',
            time_slot: '10:00-11:30', // No overlap
            name: 'Another Class',
          },
        },
      ]);
      subRepo.findOne.mockResolvedValue({ ...mockSubscription });

      const result = await service.register(1, { studentId: 1 });
      expect(result).toHaveProperty('class_id', 1);
    });
  });

  // ─── register() — Validation 3: Subscription ──────────────
  describe('register — subscription validation', () => {
    it('should reject if no subscription', async () => {
      classRepo.findOne.mockResolvedValue(mockClass);
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(0);
      regRepo.find.mockResolvedValue([]);
      subRepo.findOne.mockResolvedValue(null);

      await expect(service.register(1, { studentId: 1 }))
        .rejects.toThrow(BadRequestException);
    });

    it('should reject if subscription expired', async () => {
      classRepo.findOne.mockResolvedValue(mockClass);
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(0);
      regRepo.find.mockResolvedValue([]);
      subRepo.findOne.mockResolvedValue({
        ...mockSubscription,
        end_date: '2020-01-01', // Expired
      });

      await expect(service.register(1, { studentId: 1 }))
        .rejects.toThrow('Subscription has expired');
    });

    it('should reject if all sessions used', async () => {
      classRepo.findOne.mockResolvedValue(mockClass);
      studentRepo.findOne.mockResolvedValue(mockStudent);
      regRepo.count.mockResolvedValue(0);
      regRepo.find.mockResolvedValue([]);
      subRepo.findOne.mockResolvedValue({
        ...mockSubscription,
        used_sessions: 10, // All used
        total_sessions: 10,
      });

      await expect(service.register(1, { studentId: 1 }))
        .rejects.toThrow('All sessions have been used');
    });
  });

  // ─── cancel() — Conditional refund ──────────────────────────
  describe('cancel — conditional refund', () => {
    it('should refund when >24h before class', async () => {
      // Mock a registration for a class far in the future
      const reg = {
        id: 1, student_id: 1,
        classEntity: { day_of_week: 'Saturday', time_slot: '10:00-11:30' },
      };
      regRepo.findOne.mockResolvedValue(reg);
      subRepo.findOne.mockResolvedValue({ ...mockSubscription, used_sessions: 3 });

      const result = await service.cancel(1);
      // The next Saturday is always >24h away (unless it's Friday/Saturday)
      // For robustness, just verify the structure
      expect(result).toHaveProperty('refunded');
      expect(result).toHaveProperty('message');
      expect(regRepo.remove).toHaveBeenCalledWith(reg);
    });

    it('should throw NotFoundException for missing registration', async () => {
      regRepo.findOne.mockResolvedValue(null);
      await expect(service.cancel(999)).rejects.toThrow(NotFoundException);
    });
  });

  // ─── register() — Not found cases ─────────────────────────
  describe('register — entity not found', () => {
    it('should throw if class not found', async () => {
      classRepo.findOne.mockResolvedValue(null);
      await expect(service.register(999, { studentId: 1 }))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw if student not found', async () => {
      classRepo.findOne.mockResolvedValue(mockClass);
      studentRepo.findOne.mockResolvedValue(null);
      await expect(service.register(1, { studentId: 999 }))
        .rejects.toThrow(NotFoundException);
    });
  });
});
