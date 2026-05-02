# 🗂️ Full-Stack Team Task Manager

<div align="center">

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](#)
[![Express.js](https://img.shields.io/badge/Express.js-404d59?style=for-the-badge&logo=express&logoColor=61DAFB)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](#)

**🚀 Live Demo:** [https://task-manager-monorepo-frontend-production.up.railway.app/](https://task-manager-monorepo-frontend-production.up.railway.app/)

**🐙 GitHub Repo:** [https://github.com/thakurmayanksingh/task-manager-monorepo](https://github.com/thakurmayanksingh/task-manager-monorepo)

</div>

---

## 📌 Assignment Context

> **Prompt:** Build a web app where users can create projects, assign tasks, and track progress with role-based access (Admin/Member).

This is a production-grade, full-stack submission for a company selection process. The application is fully deployed on Railway and covers all required features: authentication, project & team management, task tracking, RBAC, and a live dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔐 **Secure Authentication** | JWT hybrid strategy — short-lived access tokens in memory + HttpOnly refresh cookies |
| 📁 **Project Management** | Create, update, and delete projects with team-scoped access |
| 👥 **Team & Role Management** | Invite members by email, assign Admin or Member roles per project |
| ✅ **Task Tracking** | Create tasks with title, description, assignee, due date, and status |
| 📊 **Dashboard** | Aggregated stats (total, pending, in-progress, completed, overdue) via a single SQL endpoint |
| 🛡️ **RBAC** | Fine-grained role enforcement at the middleware layer — not just the UI |

---

## 🏗️ Architecture & Technology Stack

> All technology choices are deliberate trade-offs optimized for Railway's free-tier constraints (500 MB RAM, 1 vCPU).

### Backend — `apps/backend`
- **Express.js** — Handles ~30,000 req/sec on identical hardware. Minimal memory footprint, rapid prototyping, zero unnecessary abstraction overhead compared to NestJS.
- **PostgreSQL** — Relational integrity is non-negotiable for RBAC and task relationships. Sophisticated query planner enables single-pass `CASE WHEN` dashboard aggregation.
- **Prisma ORM** — Single `schema.prisma` as the source of truth. Auto-generates a fully type-safe query client, eliminating manual TypeScript interface maintenance.
- **Zod** — TypeScript-native validation. `.strict()` automatically strips undeclared fields, preventing role-injection attacks.
- **bcrypt (cost factor 12)** — Secure against hardware-accelerated dictionary attacks while staying performant on a single vCPU.

### Frontend — `apps/frontend`
- **React + Vite** — Optimized for developer velocity. Produces ~42KB bundles with instant HMR. The app lives behind an auth wall, making Next.js SSR/SEO features irrelevant overhead.

### Auth Strategy
```
Access Token  → 15 min lifetime → Stored in React memory (never localStorage)
Refresh Token → 7 day lifetime  → HttpOnly + Secure + SameSite=Strict cookie
```
This architecture neutralizes XSS attack vectors entirely, as JavaScript cannot access the refresh token.

---

## 🗃️ Database Schema

```sql
-- Core Enums
CREATE TYPE project_role AS ENUM ('Admin', 'Member');
CREATE TYPE task_status  AS ENUM ('To Do', 'In Progress', 'Done');

-- Tables: Users, Projects, ProjectMembers (junction + RBAC), Tasks
-- All PKs are UUIDs to mitigate enumeration attacks
-- ProjectMembers stores role per (project_id, user_id) — not globally on Users
```

> **RBAC Design Decision:** Roles are stored in the `ProjectMembers` junction table, not on `Users`. This allows a user to be Admin in Project A and Member in Project B simultaneously — a requirement that a global role column fundamentally cannot satisfy.

---

## 🔒 Role-Based Access Control (RBAC)

### Admin
- Modify project metadata (name, description)
- Invite users by email and assign roles
- Remove members or delete the project entirely
- Full CRUD over all tasks, regardless of assignee

### Member
- Read-only access to project details, member roster, and task board
- **Cannot** create tasks or modify task metadata
- Can **only** update the `status` field on tasks explicitly assigned to them

### Enforcement
The `requireRole(allowedRoles[])` middleware factory extracts `projectId` from route params and `user.id` from the decoded JWT, then queries `ProjectMembers` to verify the role before any controller logic executes.

---

## 📡 REST API Reference

| Method | Route | Auth | Body | Response |
|---|---|---|---|---|
| `POST` | `/api/auth/signup` | Rate Limiter | `{ email, password, name }` | 201 + access token |
| `POST` | `/api/auth/login` | Rate Limiter | `{ email, password }` | 200 + access token |
| `POST` | `/api/auth/logout` | JWT | — | 200, clears cookie |
| `GET` | `/api/projects` | JWT | — | 200 — user's projects |
| `POST` | `/api/projects` | JWT | `{ name, description }` | 201 Created |
| `GET` | `/api/projects/:id` | Member | — | 200 — project details |
| `PUT` | `/api/projects/:id` | Admin | `{ name, description }` | 200 Updated |
| `DELETE` | `/api/projects/:id` | Admin | — | 204 No Content |
| `POST` | `/api/projects/:id/members` | Admin | `{ email, role }` | 201 Created |
| `DELETE` | `/api/projects/:id/members/:userId` | Admin | — | 204 No Content |
| `POST` | `/api/projects/:id/tasks` | Admin | `{ title, description, due_date, assignee_id }` | 201 Created |
| `PUT` | `/api/projects/:id/tasks/:taskId` | Admin / Assignee | `{ title, status, due_date, assignee_id }` | 200 Updated |
| `DELETE` | `/api/projects/:id/tasks/:taskId` | Admin | — | 204 No Content |
| `GET` | `/api/dashboard` | JWT | — | 200 — aggregated stats |

> All responses follow a consistent envelope: `{ success: boolean, data: object | null, error: object | null }`

---

## 📊 Dashboard Aggregation — Why One Endpoint

Firing multiple parallel requests for dashboard stats introduces an N+1 problem at the network layer and risks exhausting Railway's limited database connection pool. The `/api/dashboard` endpoint offloads all aggregation to PostgreSQL using a single-pass `CASE WHEN` query:

```sql
SELECT
  COUNT(id)                                                          AS total_assigned_tasks,
  COUNT(CASE WHEN status = 'To Do'       THEN 1 END)                AS pending_tasks,
  COUNT(CASE WHEN status = 'In Progress' THEN 1 END)                AS active_tasks,
  COUNT(CASE WHEN status = 'Done'        THEN 1 END)                AS completed_tasks,
  COUNT(CASE WHEN status != 'Done' AND due_date < NOW() THEN 1 END) AS overdue_tasks
FROM Tasks
WHERE assignee_id = $1
  AND project_id IN (SELECT project_id FROM ProjectMembers WHERE user_id = $1);
```

This scans relevant rows exactly once, keeping RAM usage flat and preventing Node.js memory exhaustion.

---

## 📁 Monorepo Structure

```
task-manager-monorepo/
├── package.json                  # Root workspace config
├── .gitignore
├── README.md
└── apps/
    ├── backend/                  # Node.js + Express API
    │   ├── prisma/
    │   │   ├── schema.prisma     # Database schema (source of truth)
    │   │   └── migrations/       # Version-controlled SQL migrations
    │   ├── src/
    │   │   ├── controllers/      # Request processing logic
    │   │   ├── middlewares/      # JWT auth, RBAC, error handlers
    │   │   ├── routes/           # Endpoint definitions
    │   │   ├── schemas/          # Zod validation schemas
    │   │   ├── utils/            # Crypto helpers, logger
    │   │   └── server.ts         # Express initialization
    │   ├── .env.example
    │   └── package.json
    └── frontend/                 # React + Vite SPA
        ├── src/
        │   ├── components/       # Reusable atomic UI components
        │   ├── context/          # Auth global state (React Context)
        │   ├── hooks/            # useAuth, useFetch
        │   ├── pages/            # Dashboard, Project, Login views
        │   ├── services/         # Axios client + interceptors
        │   ├── App.tsx           # React Router config
        │   └── main.tsx          # React DOM mount
        ├── vite.config.ts
        └── package.json
```

---

## 🖥️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL (local instance or Railway)

### Steps

**1. Clone the monorepo**
```bash
git clone https://github.com/thakurmayanksingh/task-manager-monorepo.git
cd task-manager-monorepo
```

**2. Install all dependencies** (workspaces install backend + frontend together)
```bash
npm install
```

**3. Configure environment variables**
```bash
cp apps/backend/.env.example apps/backend/.env
# Fill in: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, FRONTEND_URL
```

**4. Run database migrations**
```bash
cd apps/backend
npx prisma migrate deploy
```

**5. Start development servers**
```bash
# From root (runs both backend and frontend concurrently)
npm run dev
```

---

## 🚀 Railway Deployment

### Services Required
- **PostgreSQL plugin** — provisioned inside the Railway project dashboard
- **Backend service** — linked to `apps/backend`
- **Frontend service** — linked to `apps/frontend`

### Environment Variables

**Backend:**
| Variable | Value |
|---|---|
| `DATABASE_URL` | Railway auto-generated PostgreSQL URL + `?connection_limit=3` |
| `JWT_SECRET` | Cryptographically random string |
| `JWT_REFRESH_SECRET` | Cryptographically random string |
| `FRONTEND_URL` | Deployed Railway frontend URL (for CORS) |

**Frontend:**
| Variable | Value |
|---|---|
| `VITE_API_URL` | Deployed Railway backend URL |

### Build Command (Backend)
```bash
npm install && npx prisma generate && npx prisma migrate deploy
```

> ⚠️ **Never use `prisma db push` in production.** It can destructively drop tables. Always use `prisma migrate deploy` for version-controlled, safe schema synchronization.

### Free Tier Constraints
- 500 MB RAM hard limit per service — all heavy aggregation is offloaded to PostgreSQL
- Services pause after inactivity (cold starts expected)
- Database connections capped via `?connection_limit=3` in `DATABASE_URL`

---

## 🔐 Security Highlights

| Measure | Implementation |
|---|---|
| Password storage | bcrypt, cost factor 12 |
| Token security | HttpOnly + Secure + SameSite=Strict cookies for refresh tokens |
| XSS prevention | Access tokens stored in memory only (never `localStorage`) |
| Input sanitization | Zod `.strict()` strips undeclared fields automatically |
| Rate limiting | 10 requests / 15 min / IP on all `/api/auth/*` routes |
| CORS | Restricted to exact Railway frontend URL |
| Enumeration prevention | UUID primary keys on all tables |

---

## 👤 Author

**Mayank Singh**
[GitHub](https://github.com/thakurmayanksingh) · [LinkedIn](https://linkedin.com/in/thakurmayanksingh)

---

<div align="center">
  <sub>Built as a company selection assignment — deployed on Railway's free tier.</sub>
</div>
