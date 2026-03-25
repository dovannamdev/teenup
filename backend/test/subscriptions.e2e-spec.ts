import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsModule } from '../src/subscriptions/subscriptions.module';
import { StudentsModule } from '../src/students/students.module';
import { ParentsModule } from '../src/parents/parents.module';
import { Parent } from '../src/entities/parent.entity';
import { Student } from '../src/entities/student.entity';
import { ClassEntity } from '../src/entities/class.entity';
import { ClassRegistration } from '../src/entities/class-registration.entity';
import { Subscription } from '../src/entities/subscription.entity';

describe('Subscriptions API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: process.env.DB_HOST || 'localhost',
          port: parseInt(process.env.DB_PORT || '5432', 10) || 5432,
          username: process.env.DB_USERNAME || 'postgres',
          password: process.env.DB_PASSWORD || 'postgres',
          database: process.env.DB_NAME || 'teenup_test',
          entities: [Parent, Student, ClassEntity, ClassRegistration, Subscription],
          synchronize: true,
          dropSchema: true,
        }),
        ParentsModule,
        StudentsModule,
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

  it('setup: create parent + student', async () => {
    await request(app.getHttpServer())
      .post('/api/parents')
      .send({ name: 'P', phone: '000', email: 'p@t.com' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/students')
      .send({ name: 'S', dob: '2015-01-01', gender: 'male', current_grade: '5', parentId: 1 })
      .expect(201);
  });

  it('POST /api/subscriptions — create subscription', async () => {
    const d = new Date();
    const future = new Date(d);
    future.setMonth(d.getMonth() + 3);

    const res = await request(app.getHttpServer())
      .post('/api/subscriptions')
      .send({
        studentId: 1,
        package_name: 'Goi Test',
        start_date: d.toISOString().split('T')[0],
        end_date: future.toISOString().split('T')[0],
        total_sessions: 5,
      })
      .expect(201);

    expect(res.body.package_name).toBe('Goi Test');
    expect(res.body.used_sessions).toBe(0);
  });

  it('GET /api/subscriptions/:id — get with remaining', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/subscriptions/1')
      .expect(200);

    expect(res.body.remaining_sessions).toBe(5);
  });

  it('PATCH /api/subscriptions/:id/use — use 1 session', async () => {
    const res = await request(app.getHttpServer())
      .patch('/api/subscriptions/1/use')
      .expect(200);

    expect(res.body.used_sessions).toBe(1);
  });

  it('POST /api/subscriptions — reject invalid student', async () => {
    await request(app.getHttpServer())
      .post('/api/subscriptions')
      .send({
        studentId: 999,
        package_name: 'Bad',
        start_date: '2025-01-01',
        end_date: '2025-04-01',
        total_sessions: 5,
      })
      .expect(400);
  });
});
