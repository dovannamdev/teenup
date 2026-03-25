import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassRegistration } from '../entities/class-registration.entity';
import { ClassEntity } from '../entities/class.entity';
import { Student } from '../entities/student.entity';
import { Subscription } from '../entities/subscription.entity';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassRegistration, ClassEntity, Student, Subscription]),
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
