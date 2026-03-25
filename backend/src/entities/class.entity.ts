import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ClassRegistration } from './class-registration.entity';

@Entity('classes')
export class ClassEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  subject: string;

  @Column()
  day_of_week: string;

  @Column()
  time_slot: string;

  @Column()
  teacher_name: string;

  @Column({ default: 30 })
  max_students: number;

  @OneToMany(() => ClassRegistration, (reg) => reg.classEntity)
  registrations: ClassRegistration[];
}
