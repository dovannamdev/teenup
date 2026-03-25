import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { ClassEntity } from './class.entity';
import { Student } from './student.entity';

@Entity('class_registrations')
export class ClassRegistration {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  class_id: number;

  @Column()
  student_id: number;

  @CreateDateColumn()
  registered_at: Date;

  @ManyToOne(() => ClassEntity, (cls) => cls.registrations)
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity;

  @ManyToOne(() => Student, (student) => student.registrations)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
