import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesModule } from '../src/classes/classes.module';
import { Parent } from '../src/entities/parent.entity';
import { Student } from '../src/entities/student.entity';
import { ClassEntity } from '../src/entities/class.entity';
import { ClassRegistration } from '../src/entities/class-registration.entity';
import { Subscription } from '../src/entities/subscription.entity';

describe('Classes API (e2e)', () => {
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
        ClassesModule,
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

  it('POST /api/classes — create class', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/classes')
      .send({
        name: 'Toan', subject: 'Math', day_of_week: 'Monday',
        time_slot: '08:00-09:30', teacher_name: 'Thay M', max_students: 5,
      })
      .expect(201);

    expect(res.body.name).toBe('Toan');
  });

  it('POST /api/classes — create another class', async () => {
    await request(app.getHttpServer())
      .post('/api/classes')
      .send({
        name: 'English', subject: 'English', day_of_week: 'Tuesday',
        time_slot: '10:00-11:30', teacher_name: 'Co L', max_students: 8,
      })
      .expect(201);
  });

  it('GET /api/classes — list all', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/classes')
      .expect(200);

    expect(res.body).toHaveLength(2);
  });

  it('GET /api/classes?day=Monday — filter by day', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/classes?day=Monday')
      .expect(200);

    expect(res.body).toHaveLength(1);
    expect(res.body[0].day_of_week).toBe('Monday');
  });

  it('GET /api/classes?day=Friday — no classes', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/classes?day=Friday')
      .expect(200);

    expect(res.body).toHaveLength(0);
  });
});
