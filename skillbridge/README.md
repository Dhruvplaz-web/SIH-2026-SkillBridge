# SkillBridge

**Connecting Academic Potential with Industry Opportunity**

A full-stack Academia–Industry Collaboration Portal that bridges the gap between student skills and industry requirements.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite via @libsql/client |
| Auth | JWT + bcryptjs |
| Charts | Recharts |

---

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm 8+

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Seed the Database

```bash
cd backend
node node_modules/ts-node/dist/bin.js --transpile-only src/database/seed.ts
```

### 3. Start the Backend

```bash
cd backend
node node_modules/ts-node/dist/bin.js --transpile-only src/index.ts
```

Backend runs at: http://localhost:5000

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 5. Start the Frontend

```bash
cd frontend
node node_modules/vite/bin/vite.js
```

Frontend runs at: http://localhost:5173

---

## Demo Accounts

All accounts use password: **Demo@1234**

| Role | Email |
|---|---|
| Student | student@example.com |
| Academician | academic@example.com |
| Recruiter | recruiter@example.com |
| Admin | admin@example.com |

---

## Features

### Students
- Skill assessment with scored quizzes
- Skill gap analysis against industry demand
- AI-powered opportunity matching with match score (%)
- Browse & apply to internships/jobs
- Track application status in real-time
- Enroll in training programs & track progress
- Digital portfolio with projects & certifications
- Mentorship requests to academicians/industry

### Recruiters
- Post internships, jobs, and training opportunities
- View AI-matched candidates ranked by match score
- Update application status (shortlist, select, reject)
- Application pipeline analytics

### Academicians
- Monitor student skill gaps
- Create and manage training programs
- Accept/decline mentorship requests
- Create industry-academia collaborations

### Admins
- Full user management
- Platform-wide analytics
- Skill gap trends
- Opportunity and application management

---

## API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id

GET    /api/skills
POST   /api/skills/user
PUT    /api/skills/user/:skillId
DELETE /api/skills/user/:skillId

GET    /api/assessments
GET    /api/assessments/:id
POST   /api/assessments/:id/submit
GET    /api/assessments/history

GET    /api/opportunities
POST   /api/opportunities
PUT    /api/opportunities/:id
DELETE /api/opportunities/:id

POST   /api/applications
GET    /api/applications/my
GET    /api/applications/opportunity/:id
PUT    /api/applications/:id/status

GET    /api/recommendations
GET    /api/recommendations/skill-gaps
POST   /api/recommendations/match-skills

GET    /api/training-programs
POST   /api/training-programs
POST   /api/training-programs/:id/enroll
GET    /api/training-programs/enrollments

GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all

GET    /api/mentorship/mentors
POST   /api/mentorship/request
GET    /api/mentorship/requests
PUT    /api/mentorship/requests/:id/status

GET    /api/analytics/admin
GET    /api/analytics/student
GET    /api/analytics/recruiter
GET    /api/analytics/academician
```

---

## Recommendation Engine

The engine uses a weighted deterministic algorithm:

| Factor | Weight |
|---|---|
| Required Skills Match | 70% |
| Preferred Skills Match | 15% |
| Skill Proficiency Level | 10% |
| Assessment Score | 5% |

Proficiency weights: Beginner=0.4, Intermediate=0.7, Advanced=1.0

Results in a 0–100% match score per opportunity per student.

---

## Project Structure

```
skillbridge/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # Express routers
│   │   ├── middleware/      # Auth middleware
│   │   ├── services/       # Recommendation engine
│   │   ├── database/       # DB init & seed
│   │   └── index.ts        # Entry point
│   ├── prisma/             # SQLite database file
│   └── .env
└── frontend/
    └── src/
        ├── components/     # Reusable UI + layout
        ├── context/        # Auth context
        ├── pages/          # Role-specific pages
        │   ├── auth/
        │   ├── student/
        │   ├── recruiter/
        │   ├── academician/
        │   ├── admin/
        │   └── shared/
        ├── services/       # API client
        └── types/          # TypeScript types
```
