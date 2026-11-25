<div align="center">

# ⚡ WorkSync — Workspace & Project Management Platform

**Enterprise-grade Multi-Tenant Collaborative Workspace, Agile Delivery & Task Orchestration Engine**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20Mongoose%209-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Live Demo](https://img.shields.io/badge/Live_Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://project-work-syncc.vercel.app)
[![API Server](https://img.shields.io/badge/Live_Backend_API-Vercel-0070F3?style=for-the-badge&logo=vercel&logoColor=white)](https://project-work-sync-backend.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<br />

[🌐 Live Demo (Frontend)](https://project-work-syncc.vercel.app) • [📡 Live API (Backend)](https://project-work-sync-backend.vercel.app) • [Explore Features](#-core-features) • [Role Matrix](#-role-based-access-control-rbac) • [System Architecture](#-system-architecture) • [API Reference](#-api-endpoints-reference) • [Getting Started](#-getting-started) • [Demo Credentials](#-pre-seeded-demo-credentials)

</div>

---

## 🌐 Live Deployments

| Component | Platform | Live URL | Status |
| :--- | :--- | :--- | :---: |
| **Frontend Web App** | Vercel | [https://project-work-syncc.vercel.app](https://project-work-syncc.vercel.app) | ![Active](https://img.shields.io/badge/Online-Ready-success?style=flat-square) |
| **Backend REST API** | Vercel | [https://project-work-sync-backend.vercel.app](https://project-work-sync-backend.vercel.app) | ![Active](https://img.shields.io/badge/Online-Ready-success?style=flat-square) |
| **API Health Check** | Vercel | [https://project-work-sync-backend.vercel.app/api/health](https://project-work-sync-backend.vercel.app/api/health) | ![Active](https://img.shields.io/badge/200_OK-Active-brightgreen?style=flat-square) |

---

## 📌 Overview

**WorkSync** is a full-featured, enterprise-ready workspace and project orchestration platform designed to streamline collaborative development workflows. Built on a modular monorepo architecture, WorkSync delivers four distinct, purpose-built dashboards for **Super Admins**, **Workspace Admins**, **Engineering Managers**, and **Employees**, ensuring granular data security, dynamic hierarchical task delegation, interactive drag-and-drop Kanban execution, and real-time delivery telemetry.

---

## 🚀 Core Features

| Feature Domain | Highlights & Capabilities |
| :--- | :--- |
| **👑 Hierarchical Role Governance** | Strict 4-tier Role-Based Access Control (Super Admin, Admin, Manager, Employee) with dedicated route protection, scoped workspace headers, and customized UI themes. |
| **📋 End-to-End Task Delegation** | Tasks assigned by Super Admin to Managers can be seamlessly reviewed and delegated to team Employees with real-time assignment notifications. |
| **📊 Interactive Kanban Boards** | Visual Kanban lanes (`To Do`, `In Progress`, `In Review`, `Completed`) powered by smooth transitions, sprint timelines, and completion metrics. |
| **🔒 Complete-Lock Security** | Once marked `Completed` / `Done`, tasks are automatically locked with audit trail verification to protect delivery integrity. |
| **🏢 Multi-Tenant Workspaces** | Workspaces isolate projects, boards, activities, and team members with header-based tenant resolution (`x-workspace-id`). |
| **📈 Live Delivery Analytics** | Real-time sprint velocity burndown trajectories, throughput benchmarks, turnaround cycle metrics, and zero hardcoded demo data. |
| **🔔 Instant Notification Center** | Real-time task assignments, status changes, and administrative announcements delivered across workspace members. |
| **🛡️ Enterprise Security Suite** | Express 5 architecture secured with JWT authentication, Bcrypt password hashing, Helmet CSP, strict CORS policies, and Rate Limiting. |

---

## 👥 Role-Based Access Control (RBAC)

WorkSync enforces strict isolation across all business layers:

| Role | Scope | Primary Capabilities & Responsibilities |
| :--- | :--- | :--- |
| **Super Admin** | Platform-Wide | Global workspace provisioning, platform settings, audit log inspection, user role management, system health telemetry, global task visibility. |
| **Workspace Admin** | Workspace-Level | Team member invitations, role management within workspace, department boards, project governance, workspace analytics. |
| **Manager** | Department / Team | Deliverables planning, assigning tasks to team employees, workload capacity tracking, sprint delivery timelines, review approvals. |
| **Employee** | Contributor | Focused personal task board, advancing status across delivery lanes, real-time assignment alerts, collaborative activity feed. |

---

## 🔄 Dynamic Task Lifecycle & Delegation Flow

```
   ┌─────────────────────────────────────────────────────────┐
   │                  👑 SUPER ADMIN                         │
   │  Creates global initiatives & assigns task to Manager   │
   └──────────────────────────┬──────────────────────────────┘
                              │
                              ▼ [Notified & Synced via API]
   ┌─────────────────────────────────────────────────────────┐
   │                    👔 MANAGER                           │
   │  Reviews scope, allocates sprint, re-assigns to Member  │
   └──────────────────────────┬──────────────────────────────┘
                              │
                              ▼ [Instant In-App Notification]
   ┌─────────────────────────────────────────────────────────┐
   │                   💻 EMPLOYEE                           │
   │  Picks up task: To Do ➔ In Progress ➔ In Review         │
   └──────────────────────────┬──────────────────────────────┘
                              │
                              ▼ [Confirmation Modal]
   ┌─────────────────────────────────────────────────────────┐
   │                   🔒 COMPLETED                          │
   │  Marked "Done" ➔ Task is permanently locked from edit   │
   └─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend Architecture
* **Framework**: React 18.3 (Single Page Application with Modular Feature Architecture)
* **Build Tooling**: Vite 5.4 with Fast Hot Module Replacement (HMR)
* **Styling & UI**: Tailwind CSS v4, Custom SaaS themes (Light for Manager/Employee, Dark for Super Admin)
* **State Management**: Redux Toolkit & Context API (`AuthContext`, `ConfirmContext`)
* **Routing**: React Router v7 with Nested Protected Routes
* **Icons & Visuals**: Lucide React
* **Kanban & Drag-Drop**: `@hello-pangea/dnd`

### Backend Architecture
* **Runtime**: Node.js v20+ (Native ECMAScript Modules - ESM)
* **Web Framework**: Express 5.x
* **Database & ODM**: MongoDB Atlas with Mongoose 9.x
* **Authentication**: JSON Web Tokens (JWT) & BcryptJS password encryption
* **Security & Middleware**: Helmet, CORS with custom headers (`x-workspace-id`), Express Rate Limit
* **Data Validation**: Zod schema validation

---

## 📂 Project Directory Structure

```plaintext
Project-WorkSync/
├── backend/                         # Express 5 REST API & WebSocket Server
│   ├── src/
│   │   ├── config/                  # DB, CORS, Cloudinary, and Environment configurations
│   │   ├── constants/               # Roles, Permissions, and Priority constants
│   │   ├── middleware/              # Auth, RBAC, Workspace Access, and Error Handlers
│   │   ├── models/                  # Mongoose Schemas (User, Task, Workspace, Board, etc.)
│   │   ├── modules/                 # Modular Feature Controllers, Services & Routes
│   │   │   ├── admin/               # Workspace Admin modules (Analytics, Boards, Members)
│   │   │   ├── auth/                # Authentication, Token refresh, and Password reset
│   │   │   ├── employee/            # Employee personal dashboard and task execution
│   │   │   ├── manager/             # Manager sprint analytics, tasks, and workload
│   │   │   └── super-admin/         # Platform administration, audits, and workspace provisioning
│   │   ├── utils/                   # Async handlers, API responses, and notification dispatchers
│   │   ├── app.js                   # Express application setup
│   │   └── server.js                # HTTP server bootstrap & DB connection
│   └── package.json
│
├── frontend/                        # React 18 + Vite Single Page Application
│   ├── src/
│   │   ├── app/                     # Redux store & global providers
│   │   ├── components/              # Shared layouts, UI buttons, modals & protected routes
│   │   ├── context/                 # AuthContext and ConfirmContext
│   │   ├── features/                # Domain-driven feature directories
│   │   │   ├── admin/               # Admin pages (Dashboard, Members, Roles, Analytics)
│   │   │   ├── auth/                # Login, Register, Forgot Password pages
│   │   │   ├── boards/              # Reusable Kanban and Timeline components
│   │   │   ├── employee/            # Employee pages (Dashboard, MyTasks, Boards, Activity)
│   │   │   ├── manager/             # Manager pages (Dashboard, Tasks, Projects, Reports)
│   │   │   └── super-admin/         # Super Admin pages (Dashboard, Workspaces, Users, Audits)
│   │   ├── routes/                  # AppRoutes with role-based Route Guards
│   │   ├── utils/                   # Safe User Storage & Auth helpers
│   │   └── main.jsx                 # Client entry point
│   └── package.json
│
├── package.json                     # Monorepo root scripts & workspace configuration
└── README.md                        # Documentation
```

---

## 📡 API Endpoints Reference

All API routes are prefixed with `/api/v1` and require `Authorization: Bearer <token>` and `x-workspace-id: <workspaceId>` headers where applicable.

| Module | Method | Endpoint | Description | Access Level |
| :--- | :---: | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new platform user | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT token | Public |
| **Auth** | `GET` | `/api/v1/auth/me` | Retrieve authenticated user profile | Authenticated |
| **Super Admin** | `GET` | `/api/v1/super-admin/dashboard` | Platform metrics, growth charts, and audit summary | Super Admin |
| **Super Admin** | `GET` | `/api/v1/super-admin/workspaces` | List and provision all global workspaces | Super Admin |
| **Super Admin** | `POST` | `/api/v1/super-admin/tasks` | Create global tasks and assign across tenants | Super Admin |
| **Admin** | `GET` | `/api/v1/admin/dashboard` | Workspace health, recent boards, members | Workspace Admin |
| **Admin** | `GET` | `/api/v1/admin/members` | Manage workspace members and role permissions | Workspace Admin |
| **Manager** | `GET` | `/api/v1/manager/dashboard` | Sprint completion metrics, team workload, activity | Manager |
| **Manager** | `GET` | `/api/v1/manager/tasks` | List deliverables with assignee and status filters | Manager |
| **Manager** | `PUT` | `/api/v1/manager/tasks/:id` | Re-assign deliverable to employee / update status | Manager |
| **Employee** | `GET` | `/api/v1/employee/dashboard` | Personal task progress, sprint deadlines | Employee |
| **Employee** | `GET` | `/api/v1/employee/tasks` | Fetch assigned tasks for active workspace | Employee |
| **Employee** | `PUT` | `/api/v1/employee/tasks/:id/status` | Advance task status (`todo` ➔ `done`) | Employee |
| **System** | `GET` | `/api/health` | Service health check and uptime monitor | Public |

---

## ⚡ Getting Started

### Prerequisites
* **Node.js**: `v20.0.0` or higher
* **npm**: `v10.0.0` or higher
* **MongoDB**: A local instance or cloud cluster (MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Dev-Mjarir08/Project-WorkSync.git
cd Project-WorkSync
```

### 2. Environment Configuration
Create a `.env` file inside the `backend/` directory:
```bash
cp backend/.env.example backend/.env
```

Configure your environment variables:
```env
PORT=8081
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/worksync?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_worksync
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
Install all workspace dependencies from the root directory:
```bash
npm install
```

### 4. Run the Development Environment

You can start both frontend and backend concurrently from the root:

```bash
# Terminal 1: Start Backend API (Port 8081)
npm run dev:backend

# Terminal 2: Start Frontend Application (Port 5173)
npm run dev:frontend
```

Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🔑 Pre-Seeded Demo Credentials

The database comes pre-configured with test users across all four tiers:

| Role | Name | Email Address | Password | Default Workspace |
| :--- | :--- | :--- | :---: | :--- |
| **Super Admin** | Jarir Multani | `jarir@gmail.com` | `123456` | Development Department |
| **Manager** | Aaditya Patel | `aadi@gmail.com` | `123456` | Development Department |
| **Admin** | Safi Saikh | `safi@gmail.com` | `123456` | Development Department |
| **Employee** | Ayaan | `ayan@gmail.com` | `123456` | Development Department |

---

## 🧪 Testing & Verification

* **Frontend Production Build**:
  ```bash
  npm run build --prefix frontend
  ```
* **Local API Health Check**:
  ```bash
  curl http://localhost:8081/api/health
  ```
* **Live Production Health Check**:
  ```bash
  curl https://project-work-sync-backend.vercel.app/api/health
  ```

---

## 🛡️ License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Made with ❤️ by **Jarir Multani** & The WorkSync Engineering Team

</div>
