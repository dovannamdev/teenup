import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { CreateParentDto } from './dto/create-parent.dto';

@Injectable()
export class ParentsService {
  constructor(
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
  ) {}

  async create(dto: CreateParentDto): Promise<Parent> {
    const parent = this.parentRepo.create(dto);
    return this.parentRepo.save(parent);
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepo.findOne({
      where: { id },
      relations: ['students'],
    });
    if (!parent) {
      throw new NotFoundException(`Parent #${id} not found`);
    }
    return parent;
  }

  async findAll(): Promise<Parent[]> {
    return this.parentRepo.find();
  }
}
