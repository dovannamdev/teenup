# TeenUp LMS — Mini Learning Management System

A fullstack web application for managing Students, Parents, Classes, and Subscriptions.

**Tech Stack:** NestJS + TypeORM + PostgreSQL | React + Vite | Docker

---

## Quick Start

```bash
# Clone and run (single command)
docker-compose up -d --build

# Wait ~30s for services to start, then seed data
docker-compose exec backend npx ts-node src/seed.ts
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api

**Stop:**
```bash
docker-compose down
```

---

## Database Schema

```
Parents (id, name, phone, email)
   └── Students (id, name, dob, gender, current_grade, parent_id)
          ├── ClassRegistrations (id, class_id, student_id, registered_at)
          ├── Subscriptions (id, student_id, package_name, start_date, end_date, total_sessions, used_sessions)
          └── Classes (id, name, subject, day_of_week, time_slot, teacher_name, max_students)
```

**Key relations:**
- 1 Parent → N Students
- 1 Student → N ClassRegistrations → N Classes
- 1 Student → N Subscriptions

---

## API Endpoints

### Parents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/parents` | Create parent |
| GET | `/api/parents/:id` | Get parent with students |
| GET | `/api/parents` | List all parents |

### Students
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/students` | Create student (body: `{name, dob, gender, current_grade, parentId}`) |
| GET | `/api/students/:id` | Get student with parent info |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classes` | Create class |
| GET | `/api/classes?day=Monday` | List classes (optional day filter) |

### Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/classes/:classId/register` | Register student (`{studentId}`) — validates: max capacity, schedule overlap, subscription |
| DELETE | `/api/registrations/:id` | Cancel — refunds 1 session if >24h before class |
| GET | `/api/registrations` | List all registrations |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions` | Create subscription |
| PATCH | `/api/subscriptions/:id/use` | Use 1 session |
| GET | `/api/subscriptions/:id` | Get status (includes `remaining_sessions`) |

---

## API Examples (curl)

```bash
# Create parent
curl -X POST http://localhost:3001/api/parents \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van A","phone":"0909123456","email":"nguyenvana@gmail.com"}'

# Create student
curl -X POST http://localhost:3001/api/students \
  -H "Content-Type: application/json" \
  -d '{"name":"Nguyen Van C","dob":"2015-03-15","gender":"male","current_grade":"5","parentId":1}'

# Register student to class
curl -X POST http://localhost:3001/api/classes/1/register \
  -H "Content-Type: application/json" \
  -d '{"studentId":1}'

# Get subscription status
curl http://localhost:3001/api/subscriptions/1
```

**Full demo:** Run `chmod +x api-demo.sh && ./api-demo.sh`

---

## Seed Data

| Entity | Data |
|--------|------|
| Parents | Nguyen Van A (0909123456), Tran Thi B (0912345678) |
| Students | Nguyen Van C (Grade 5, parent 1), Nguyen Thi D (Grade 3, parent 1), Tran Van E (Grade 4, parent 2) |
| Classes | Toan Nang Cao (Mon 08:00-09:30), Tieng Anh (Mon 10:00-11:30), Vat Ly (Wed 08:00-09:30) |
| Subscriptions | Student 1: 10 sessions/3 months, Student 3: 8 sessions/2 months |

---

## Business Logic

### Registration Validations
1. **Max capacity** — Rejects if class has reached `max_students`
2. **Schedule overlap** — Rejects if student already has a class on the same `day_of_week` with overlapping `time_slot`
3. **Subscription check** — Requires active subscription (`end_date >= today` AND `used_sessions < total_sessions`)

### Cancellation Policy
- **>24h before class** — Registration deleted + 1 session refunded
- **<24h before class** — Registration deleted, no refund

---

## Project Structure

```
teenup/
├── docker-compose.yml          # Single command to run everything
├── api-demo.sh                 # Curl demo script
├── .github/workflows/ci.yml    # CI/CD pipeline
├── backend/
│   ├── Dockerfile
│   ├── src/
│   │   ├── main.ts             # NestJS bootstrap
│   │   ├── app.module.ts       # Root module
│   │   ├── entities/           # 5 TypeORM entities
│   │   ├── parents/            # Module + Controller + Service + DTO
│   │   ├── students/           # Module + Controller + Service + DTO
│   │   ├── classes/            # Module + Controller + Service + DTO
│   │   ├── registrations/      # Core business logic (3 validations)
│   │   ├── subscriptions/      # Module + Controller + Service + DTO
│   │   └── seed.ts             # Sample data seeder
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── src/
    │   ├── App.jsx             # Tab navigation
    │   ├── api.js              # API client
    │   ├── index.css           # Design system
    │   └── components/         # 5 React components
```

---

## CI/CD (GitHub Actions)

Pipeline runs on push to `main`/`develop`:
1. **Backend** — Build + unit tests + integration tests (PostgreSQL service)
2. **Frontend** — Build verification
3. **E2E** — Docker Compose + API verification
4. **Docker Build** — Image build verification
