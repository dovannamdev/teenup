import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsModule } from './parents/parents.module';
import { StudentsModule } from './students/students.module';
import { ClassesModule } from './classes/classes.module';
import { RegistrationsModule } from './registrations/registrations.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'teenup',
      autoLoadEntities: true,
      synchronize: true, // Auto-create tables (dev only)
    }),
    ParentsModule,
    StudentsModule,
    ClassesModule,
    RegistrationsModule,
    SubscriptionsModule,
  ],
})
export class AppModule {}
