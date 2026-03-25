import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { Student } from '../entities/student.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subRepo: Repository<Subscription>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  async create(dto: CreateSubscriptionDto): Promise<Subscription> {
    const student = await this.studentRepo.findOne({ where: { id: dto.studentId } });
    if (!student) {
      throw new BadRequestException(`Student #${dto.studentId} not found`);
    }

    const sub = this.subRepo.create({
      student_id: dto.studentId,
      package_name: dto.package_name,
      start_date: dto.start_date,
      end_date: dto.end_date,
      total_sessions: dto.total_sessions,
      used_sessions: 0,
    });
    return this.subRepo.save(sub);
  }

  async findOne(id: number): Promise<Subscription & { remaining_sessions: number }> {
    const sub = await this.subRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!sub) {
      throw new NotFoundException(`Subscription #${id} not found`);
    }
    return {
      ...sub,
      remaining_sessions: sub.total_sessions - sub.used_sessions,
    };
  }

  async useSession(id: number): Promise<Subscription> {
    const sub = await this.subRepo.findOne({ where: { id } });
    if (!sub) {
      throw new NotFoundException(`Subscription #${id} not found`);
    }
    if (sub.used_sessions >= sub.total_sessions) {
      throw new BadRequestException('All sessions have been used');
    }
    sub.used_sessions += 1;
    return this.subRepo.save(sub);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subRepo.find({ relations: ['student'] });
  }
}
