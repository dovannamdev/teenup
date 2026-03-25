import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsModule } from '../src/parents/parents.module';
import { StudentsModule } from '../src/students/students.module';
import { ClassesModule } from '../src/classes/classes.module';
import { RegistrationsModule } from '../src/registrations/registrations.module';
import { SubscriptionsModule } from '../src/subscriptions/subscriptions.module';
import { Parent } from '../src/entities/parent.entity';
import { Student } from '../src/entities/student.entity';
import { ClassEntity } from '../src/entities/class.entity';
import { ClassRegistration } from '../src/entities/class-registration.entity';
import { Subscription } from '../src/entities/subscription.entity';

/**
 * Full integration test for Registration flow:
 * 1. Setup: parent → student → class → subscription
 * 2. Register student (success)
 * 3. Register to overlapping class (schedule conflict)
 * 4. Cancel registration
 * 5. Register without subscription (fail)
 */
describe('Registrations API — Full Flow (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10),
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'teenup_test',
          entities: [Parent, Student, ClassEntity, ClassRegistration, Subscription],
          synchronize: true,
          dropSchema: true,
        }),
        ParentsModule,
        StudentsModule,
        ClassesModule,
        RegistrationsModule,
        SubscriptionsModule,
      ],
    }).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Setup data
  it('Step 1: Create parent', async () => {
    await request(app.getHttpServer())
      .post('/api/parents')
      .send({ name: 'Parent A', phone: '0909000000', email: 'a@test.com' })
      .expect(201);
  });

  it('Step 2: Create student', async () => {
    await request(app.getHttpServer())
      .post('/api/students')
      .send({ name: 'Student C', dob: '2015-01-01', gender: 'male', current_grade: '5', parentId: 1 })
      .expect(201);
  });

  it('Step 3: Create class (Monday 08:00-09:30, max 2)', async () => {
    await request(app.getHttpServer())
      .post('/api/classes')
      .send({
        name: 'Toan', subject: 'Math', day_of_week: 'Monday',
        time_slot: '08:00-09:30', teacher_name: 'Thay M', max_students: 2,
      })
      .expect(201);
  });

  it('Step 4: Create overlapping class (Monday 09:00-10:30)', async () => {
    await request(app.getHttpServer())
      .post('/api/classes')
      .send({
        name: 'Ly', subject: 'Physics', day_of_week: 'Monday',
        time_slot: '09:00-10:30', teacher_name: 'Thay H', max_students: 5,
      })
      .expect(201);
  });

  it('Step 5: Create subscription', async () => {
    const d = new Date();
    const future = new Date(d);
    future.setMonth(d.getMonth() + 3);

    await request(app.getHttpServer())
      .post('/api/subscriptions')
      .send({
        studentId: 1,
        package_name: 'Goi 3 Thang',
        start_date: d.toISOString().split('T')[0],
        end_date: future.toISOString().split('T')[0],
        total_sessions: 10,
      })
      .expect(201);
  });

  // Test registrations
  it('Step 6: Register student to class — SUCCESS', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/classes/1/register')
      .send({ studentId: 1 })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.class_id).toBe(1);
  });

  it('Step 7: Verify subscription used_sessions incremented', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/subscriptions/1')
      .expect(200);

    expect(res.body.used_sessions).toBe(1);
  });

  it('Step 8: Register to overlapping class — SCHEDULE CONFLICT (409)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/classes/2/register')
      .send({ studentId: 1 })
      .expect(409);

    expect(res.body.message).toContain('Schedule conflict');
  });

  it('Step 9: Cancel registration', async () => {
    const res = await request(app.getHttpServer())
      .delete('/api/registrations/1')
      .expect(200);

    expect(res.body).toHaveProperty('refunded');
    expect(res.body).toHaveProperty('message');
  });

  // Test no subscription case
  it('Step 10: Create student without subscription', async () => {
    await request(app.getHttpServer())
      .post('/api/students')
      .send({ name: 'No Sub', dob: '2016-01-01', gender: 'female', current_grade: '4', parentId: 1 })
      .expect(201);
  });

  it('Step 11: Register student without subscription — FAIL (400)', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/classes/1/register')
      .send({ studentId: 2 })
      .expect(400);

    expect(res.body.message).toContain('No subscription');
  });
});
