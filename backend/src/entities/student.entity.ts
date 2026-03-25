import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Parent } from './parent.entity';
import { ClassRegistration } from './class-registration.entity';
import { Subscription } from './subscription.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'date' })
  dob: string;

  @Column()
  gender: string;

  @Column()
  current_grade: string;

  @Column()
  parent_id: number;

  @ManyToOne(() => Parent, (parent) => parent.students)
  @JoinColumn({ name: 'parent_id' })
  parent: Parent;

  @OneToMany(() => ClassRegistration, (reg) => reg.student)
  registrations: ClassRegistration[];

  @OneToMany(() => Subscription, (sub) => sub.student)
  subscriptions: Subscription[];
}
