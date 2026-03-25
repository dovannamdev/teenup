import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @Column()
  package_name: string;

  @Column({ type: 'date' })
  start_date: string;

  @Column({ type: 'date' })
  end_date: string;

  @Column()
  total_sessions: number;

  @Column({ default: 0 })
  used_sessions: number;

  @ManyToOne(() => Student, (student) => student.subscriptions)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
