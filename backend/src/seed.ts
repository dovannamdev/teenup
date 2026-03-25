import { DataSource } from 'typeorm';
import { Parent } from './entities/parent.entity';
import { Student } from './entities/student.entity';
import { ClassEntity } from './entities/class.entity';
import { ClassRegistration } from './entities/class-registration.entity';
import { Subscription } from './entities/subscription.entity';

async function seed() {
  const ds = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'teenup',
    entities: [Parent, Student, ClassEntity, ClassRegistration, Subscription],
    synchronize: true,
  });

  await ds.initialize();
  console.log('🌱 Seeding database...');

  const parentRepo = ds.getRepository(Parent);
  const studentRepo = ds.getRepository(Student);
  const classRepo = ds.getRepository(ClassEntity);
  const subRepo = ds.getRepository(Subscription);

  // --- Parents ---
  const parent1 = await parentRepo.save(
    parentRepo.create({ name: 'Nguyen Van A', phone: '0909123456', email: 'nguyenvana@gmail.com' }),
  );
  const parent2 = await parentRepo.save(
    parentRepo.create({ name: 'Tran Thi B', phone: '0912345678', email: 'tranthib@gmail.com' }),
  );
  console.log(`✅ Created ${2} parents`);

  // --- Students ---
  const student1 = await studentRepo.save(
    studentRepo.create({
      name: 'Nguyen Van C', dob: '2015-03-15', gender: 'male',
      current_grade: '5', parent_id: parent1.id,
    }),
  );
  const student2 = await studentRepo.save(
    studentRepo.create({
      name: 'Nguyen Thi D', dob: '2017-07-22', gender: 'female',
      current_grade: '3', parent_id: parent1.id,
    }),
  );
  const student3 = await studentRepo.save(
    studentRepo.create({
      name: 'Tran Van E', dob: '2016-01-10', gender: 'male',
      current_grade: '4', parent_id: parent2.id,
    }),
  );
  console.log(`✅ Created ${3} students`);

  // --- Classes ---
  await classRepo.save([
    classRepo.create({
      name: 'Toan Nang Cao', subject: 'Math', day_of_week: 'Monday',
      time_slot: '08:00-09:30', teacher_name: 'Thay Minh', max_students: 5,
    }),
    classRepo.create({
      name: 'Tieng Anh', subject: 'English', day_of_week: 'Monday',
      time_slot: '10:00-11:30', teacher_name: 'Co Lan', max_students: 8,
    }),
    classRepo.create({
      name: 'Vat Ly', subject: 'Physics', day_of_week: 'Wednesday',
      time_slot: '08:00-09:30', teacher_name: 'Thay Hung', max_students: 6,
    }),
  ]);
  console.log(`✅ Created ${3} classes`);

  // --- Subscriptions ---
  const now = new Date();
  const threeMonthsLater = new Date(now);
  threeMonthsLater.setMonth(now.getMonth() + 3);
  const twoMonthsLater = new Date(now);
  twoMonthsLater.setMonth(now.getMonth() + 2);

  await subRepo.save([
    subRepo.create({
      student_id: student1.id, package_name: 'Goi Hoc 3 Thang',
      start_date: now.toISOString().split('T')[0],
      end_date: threeMonthsLater.toISOString().split('T')[0],
      total_sessions: 10, used_sessions: 0,
    }),
    subRepo.create({
      student_id: student3.id, package_name: 'Goi Hoc 2 Thang',
      start_date: now.toISOString().split('T')[0],
      end_date: twoMonthsLater.toISOString().split('T')[0],
      total_sessions: 8, used_sessions: 0,
    }),
  ]);
  console.log(`✅ Created ${2} subscriptions`);

  console.log('🎉 Seed completed!');
  await ds.destroy();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
