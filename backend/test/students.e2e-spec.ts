import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from '../src/students/students.module';
import { ParentsModule } from '../src/parents/parents.module';
import { Parent } from '../src/entities/parent.entity';
import { Student } from '../src/entities/student.entity';
import { ClassEntity } from '../src/entities/class.entity';
import { ClassRegistration } from '../src/entities/class-registration.entity';
import { Subscription } from '../src/entities/subscription.entity';

describe('Students API (e2e)', () => {
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

  it('should create parent first', async () => {
    await request(app.getHttpServer())
      .post('/api/parents')
      .send({ name: 'Parent One', phone: '0909111111', email: 'p1@test.com' })
      .expect(201);
  });

  it('POST /api/students — create student with valid parent', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/students')
      .send({ name: 'Student A', dob: '2015-01-01', gender: 'male', current_grade: '5', parentId: 1 })
      .expect(201);

    expect(res.body.name).toBe('Student A');
    expect(res.body.parent_id).toBe(1);
  });

  it('POST /api/students — reject invalid parentId', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/students')
      .send({ name: 'Bad', dob: '2015-01-01', gender: 'male', current_grade: '5', parentId: 999 })
      .expect(400);

    expect(res.body.message).toContain('not found');
  });

  it('GET /api/students/:id — get with parent relation', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/students/1')
      .expect(200);

    expect(res.body).toHaveProperty('parent');
    expect(res.body.parent.name).toBe('Parent One');
  });

  it('GET /api/students/:id — 404', async () => {
    await request(app.getHttpServer())
      .get('/api/students/999')
      .expect(404);
  });
});
