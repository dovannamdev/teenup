import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassRegistration } from '../entities/class-registration.entity';
import { ClassEntity } from '../entities/class.entity';
import { Student } from '../entities/student.entity';
import { Subscription } from '../entities/subscription.entity';
import { RegisterStudentDto } from './dto/register-student.dto';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(ClassRegistration)
    private readonly regRepo: Repository<ClassRegistration>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
  ) {}

  /**
   * Parse time_slot "HH:MM-HH:MM" into start/end minutes from midnight
   */
  parseTimeSlot(timeSlot: string): { start: number; end: number } {
    const [startStr, endStr] = timeSlot.split('-');
    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    return { start: sh * 60 + sm, end: eh * 60 + em };
  }

  /**
   * Check if two time ranges overlap: start1 < end2 && start2 < end1
   */
  isOverlapping(
    slot1: { start: number; end: number },
    slot2: { start: number; end: number },
  ): boolean {
    return slot1.start < slot2.end && slot2.start < slot1.end;
  }

  /**
   * Get next occurrence of a day_of_week + time_slot start
   */
  getNextClassDateTime(dayOfWeek: string, timeSlot: string): Date {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = days.indexOf(dayOfWeek);
    const now = new Date();
    const currentDay = now.getDay();

    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;

    const nextDate = new Date(now);
    nextDate.setDate(now.getDate() + daysUntil);

    const { start } = this.parseTimeSlot(timeSlot);
    nextDate.setHours(Math.floor(start / 60), start % 60, 0, 0);

    return nextDate;
  }

  /**
   * Register student to class with 3 validations
   */
  async register(classId: number, dto: RegisterStudentDto): Promise<ClassRegistration> {
    const { studentId } = dto;

    // Fetch class
    const cls = await this.classRepo.findOne({ where: { id: classId } });
    if (!cls) {
      throw new NotFoundException(`Class #${classId} not found`);
    }

    // Fetch student
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException(`Student #${studentId} not found`);
    }

    // --- Validation 1: Max students ---
    const currentCount = await this.regRepo.count({ where: { class_id: classId } });
    if (currentCount >= cls.max_students) {
      throw new BadRequestException('Class is full');
    }

    // --- Validation 2: Schedule overlap ---
    const studentRegs = await this.regRepo.find({
      where: { student_id: studentId },
      relations: ['classEntity'],
    });

    const newSlot = this.parseTimeSlot(cls.time_slot);
    for (const reg of studentRegs) {
      if (reg.classEntity.day_of_week === cls.day_of_week) {
        const existingSlot = this.parseTimeSlot(reg.classEntity.time_slot);
        if (this.isOverlapping(newSlot, existingSlot)) {
          throw new ConflictException(
            `Schedule conflict: overlaps with "${reg.classEntity.name}" (${reg.classEntity.time_slot})`,
          );
        }
      }
    }

    // --- Validation 3: Active subscription ---
    const today = new Date().toISOString().split('T')[0];
    const subscription = await this.subRepo.findOne({
      where: { student_id: studentId },
      order: { end_date: 'DESC' },
    });

    if (!subscription) {
      throw new BadRequestException('No subscription found for this student');
    }
    if (subscription.end_date < today) {
      throw new BadRequestException('Subscription has expired');
    }
    if (subscription.used_sessions >= subscription.total_sessions) {
      throw new BadRequestException('All sessions have been used');
    }

    // --- Create registration + use 1 session ---
    const registration = this.regRepo.create({
      class_id: classId,
      student_id: studentId,
    });
    await this.regRepo.save(registration);

    subscription.used_sessions += 1;
    await this.subRepo.save(subscription);

    return registration;
  }

  /**
   * Cancel registration with conditional refund
   * >24h before class → refund 1 session
   * <24h before class → no refund
   */
  async cancel(id: number): Promise<{ refunded: boolean; message: string }> {
    const reg = await this.regRepo.findOne({
      where: { id },
      relations: ['classEntity'],
    });
    if (!reg) {
      throw new NotFoundException(`Registration #${id} not found`);
    }

    const nextClassTime = this.getNextClassDateTime(
      reg.classEntity.day_of_week,
      reg.classEntity.time_slot,
    );
    const now = new Date();
    const hoursUntilClass = (nextClassTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refunded = false;

    if (hoursUntilClass > 24) {
      // Refund 1 session
      const subscription = await this.subRepo.findOne({
        where: { student_id: reg.student_id },
        order: { end_date: 'DESC' },
      });
      if (subscription && subscription.used_sessions > 0) {
        subscription.used_sessions -= 1;
        await this.subRepo.save(subscription);
        refunded = true;
      }
    }

    await this.regRepo.remove(reg);

    return {
      refunded,
      message: refunded
        ? 'Registration cancelled. 1 session refunded.'
        : 'Registration cancelled. No refund (less than 24h before class).',
    };
  }

  async findAll(): Promise<ClassRegistration[]> {
    return this.regRepo.find({ relations: ['classEntity', 'student'] });
  }
}
