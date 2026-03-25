import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassEntity } from '../entities/class.entity';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
  ) {}

  async create(dto: CreateClassDto): Promise<ClassEntity> {
    const cls = this.classRepo.create(dto);
    return this.classRepo.save(cls);
  }

  async findAll(day?: string): Promise<ClassEntity[]> {
    const query = this.classRepo
      .createQueryBuilder('class')
      .loadRelationCountAndMap('class.currentStudents', 'class.registrations');

    if (day) {
      query.where('class.day_of_week = :day', { day });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<ClassEntity> {
    const cls = await this.classRepo.findOne({
      where: { id },
      relations: ['registrations'],
    });
    if (!cls) {
      throw new NotFoundException(`Class #${id} not found`);
    }
    return cls;
  }
}
