import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
  ) {}

  async create(dto: CreateStudentDto): Promise<Student> {
    const parent = await this.parentRepo.findOne({ where: { id: dto.parentId } });
    if (!parent) {
      throw new BadRequestException(`Parent #${dto.parentId} not found`);
    }
    const student = this.studentRepo.create({
      name: dto.name,
      dob: dto.dob,
      gender: dto.gender,
      current_grade: dto.current_grade,
      parent_id: dto.parentId,
    });
    return this.studentRepo.save(student);
  }

  async findOne(id: number): Promise<Student> {
    const student = await this.studentRepo.findOne({
      where: { id },
      relations: ['parent'],
    });
    if (!student) {
      throw new NotFoundException(`Student #${id} not found`);
    }
    return student;
  }

  async findAll(): Promise<Student[]> {
    return this.studentRepo.find({ relations: ['parent'] });
  }
}
