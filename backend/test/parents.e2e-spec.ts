import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParentsModule } from '../src/parents/parents.module';
import { Parent } from '../src/entities/parent.entity';
import { Student } from '../src/entities/student.entity';
import { ClassEntity } from '../src/entities/class.entity';
import { ClassRegistration } from '../src/entities/class-registration.entity';
import { Subscription } from '../src/entities/subscription.entity';

describe('Parents API (e2e)', () => {
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

  it('POST /api/parents — create parent', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/parents')
      .send({ name: 'Test Parent', phone: '0909000000', email: 'test@test.com' })
      .expect(201);

    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Parent');
  });

  it('POST /api/parents — validation error (missing name)', async () => {
    await request(app.getHttpServer())
      .post('/api/parents')
      .send({ phone: '123', email: 'x@x.com' })
      .expect(400);
  });

  it('GET /api/parents/:id — get parent with students', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/parents/1')
      .expect(200);

    expect(res.body).toHaveProperty('students');
    expect(res.body.name).toBe('Test Parent');
  });

  it('GET /api/parents/:id — 404 for missing parent', async () => {
    await request(app.getHttpServer())
      .get('/api/parents/999')
      .expect(404);
  });
});
