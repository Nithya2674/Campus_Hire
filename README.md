# CampusHire — Campus Placement Management Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-v22.x-green.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v19.x-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v3.4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%28100%25%20Passing%29-success.svg)](https://vitest.dev/)

CampusHire is a full-stack MERN (MongoDB, Express.js, React, Node.js) web platform designed to streamline and automate university campus placements. It connects **Students**, **Corporate Recruiters**, and **Placement Cell Administrators** in a single high-performance workspace.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features by Role](#key-features-by-role)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Folder Structure](#folder-structure)
6. [Prerequisites & System Requirements](#prerequisites--system-requirements)
7. [Installation & Local Setup](#installation--local-setup)
8. [Environment Variable Configuration](#environment-variable-configuration)
9. [Database Setup & Seed Script](#database-setup--seed-script)
10. [Default Demo Accounts](#default-demo-accounts)
11. [Running the Application](#running-the-application)
12. [API Reference](#api-reference)
13. [Automated Testing & Results](#automated-testing--results)
14. [Deployment Guide (Vercel & Render)](#deployment-guide-vercel--render)
15. [Security & Business Logic Implementation](#security--business-logic-implementation)
16. [Known Limitations & Future Enhancements](#known-limitations--future-enhancements)

---

## Project Overview

Campus placements are traditionally managed through fragmented spreadsheets, email threads, and manual resume collections. This leads to duplicate submissions, ineligible student applications, delayed recruiter communication, and an absence of real-time auditability.

**CampusHire** solves these challenges by providing:
- **Server-Enforced Eligibility Engine**: Calculates CGPA minimum cutoffs, academic department/branch matching, graduation batch validation, and profile completeness before an application can be placed.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `student`, `recruiter`, and `admin` with server-side ownership enforcement.
- **Duplicate Application Prevention**: Enforced at both the database level (unique compound index on `{ jobId, studentId }`) and application service layer.
- **Recruiter Screening Workspace**: Complete control for recruiters to post jobs, review student credentials, examine verified resumes, and advance candidates through status stages (`applied`, `shortlisted`, `selected`, `rejected`).
- **Administrative Governance**: Oversight for college placement departments to monitor placement rates, verify student/recruiter accounts, and deactivate malicious or inappropriate users.

---

## Key Features by Role

### 1. Student Portal
- **Authentication**: Secure registration, login, and session preservation via HttpOnly cookies and Bearer tokens.
- **Academic Profile**: Maintain college name, degree, branch, graduation year, cumulative CGPA, verified resume URL, and skills.
- **Job Discovery & Filtering**: Search drives by title, company, or skills. Filter by job type (Full-time, Internship), location, and required competencies.
- **Eligibility Checking**: Structured real-time breakdown of eligibility with exact reasons (e.g. CGPA requirements, branch restrictions, batch matching).
- **One-Click Application**: Apply with verified credentials and optional cover note.
- **Application Tracking**: Monitor real-time status transitions (`applied`, `shortlisted`, `selected`, `rejected`, `withdrawn`) with audit timeline.
- **Application Withdrawal**: Safe withdrawal for in-progress applications before final decision.

### 2. Recruiter Portal
- **Corporate Profile**: Maintain company name, recruiter designation, corporate website, and location.
- **Job Posting Management**: Create, edit, publish, close, or delete campus placement openings.
- **Custom Cutoff Parameters**: Enforce minimum CGPA, specific branch allowances, graduation years, and application deadlines.
- **Applicant Screening Pool**: Screen candidate profiles for owned jobs with quick access to resume links, student CGPA, and branch major.
- **Status Decisions**: Advance or reject candidates with custom recruiter notes.

### 3. Administrator Portal
- **Platform Telemetry**: Database-calculated placement rates, total students, recruiters, published jobs, and application volume.
- **User Account Management**: Full directory of accounts with search, role filtering, and one-click account activation/deactivation.
- **Drive Monitoring**: Audit all company job drives across the campus.
- **Placement Audit Trail**: Platform-wide ledger of all candidate submissions and decision outcomes.

---

## Technology Stack

### Frontend
- **Framework**: React 19 with Vite 8
- **Styling**: Tailwind CSS 3.4 with custom brand palette
- **Routing**: React Router DOM 7
- **API Client**: Axios with centralized error and auth interceptors
- **Icons**: Lucide React
- **Typography**: Google Fonts (Inter)

### Backend
- **Runtime**: Node.js (v18+ / v22+ compatible)
- **Framework**: Express.js 4 (ES Modules)
- **Database ODM**: Mongoose 8
- **Authentication**: JSON Web Token (`jsonwebtoken`) with HttpOnly cookie support
- **Password Hashing**: `bcryptjs` (salt rounds: 10)
- **Validation**: Zod schema validation
- **Security**: Helmet, CORS with credential support, Express Rate Limiter
- **Testing**: Vitest with Supertest

### Database
- **Primary**: Local MongoDB or MongoDB Atlas
- **Fallback**: In-memory database support via `mongodb-memory-server` in development mode

---

## System Architecture

CampusHire adheres to a clean layered architecture separating routing, middleware, controllers, business services, and database persistence:

```
[ Client (React + Vite) ]
         │ (HTTP / Axios with Cookies & Bearer Tokens)
         ▼
[ Express Application (app.js) ]
         │
    ├── Security Layer (Helmet, CORS, RateLimiter, CookieParser)
    ├── Auth & Role Middlewares (JWT verification, RBAC)
    ├── Validation Layer (Zod schemas)
    ├── Controllers & Business Services (Eligibility Engine, Token Service)
    └── Persistence Layer (Mongoose ODM Models)
         │
         ▼
[ MongoDB Database (Atlas / Local) ]
```

---

## Folder Structure

```
campushire/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── assets/             # Images and static assets
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ApplicationStatusBadge.jsx
│   │   │   ├── ConfirmDialog.jsx
│   │   │   ├── DataTable.jsx
│   │   │   ├── EligibilityBadge.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── ErrorState.jsx
│   │   │   ├── FilterPanel.jsx
│   │   │   ├── FormInput.jsx
│   │   │   ├── JobCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Pagination.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Skeleton.jsx
│   │   ├── context/            # AuthContext & ToastContext
│   │   ├── layouts/            # MainLayout & DashboardLayout
│   │   ├── pages/
│   │   │   ├── public/         # Landing, Jobs, Details, Login, Register, 404
│   │   │   ├── student/        # Student Dashboard, Profile, Applications
│   │   │   ├── recruiter/      # Recruiter Dashboard, Jobs, Post Job, Applicants
│   │   │   └── admin/          # Admin Dashboard, Users, Jobs, Applications
│   │   ├── services/           # Axios API service
│   │   ├── utils/              # Date and text formatters
│   │   ├── App.jsx             # Router definition
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Tailwind CSS directives
│   ├── index.html              # HTML5 entry with Inter font
│   ├── tailwind.config.js      # Tailwind configuration
│   ├── vite.config.js          # Vite config with /api proxy
│   └── vercel.json             # Vercel SPA routing rewrite
│
├── server/                     # Express Backend
│   ├── src/
│   │   ├── config/             # Database connection & fallback
│   │   ├── controllers/        # Auth, User, Job, Application, Admin controllers
│   │   ├── middleware/         # Auth, Role, Validation, ErrorHandler
│   │   ├── models/             # User, Job, Application Mongoose schemas
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Eligibility engine, Token handler
│   │   ├── utils/              # Response helpers, logger
│   │   ├── validators/         # Zod schemas
│   │   ├── app.js              # Express app setup & middlewares
│   │   └── server.js           # Server listen & graceful shutdown
│   ├── scripts/
│   │   ├── seed.js             # Realistic placement demonstration data
│   │   └── seedAdmin.js        # Secure admin account provisioner
│   ├── tests/
│   │   └── api.test.js         # Vitest integration test suite (20 tests)
│   ├── vitest.config.js        # Vitest test configuration
│   ├── .env.example            # Environment template
│   └── package.json            # Server dependencies & scripts
│
├── package.json                # Root package.json for monorepo scripts
├── render.yaml                 # Render cloud deployment blueprint
├── README.md                   # Full documentation
└── .gitignore                  # Global ignore file
```

---

## Prerequisites & System Requirements

- **Node.js**: v18.0.0 or higher (Tested on Node v22.15.0)
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance running on `localhost:27017` OR a MongoDB Atlas cluster URI. *(If local MongoDB is not running, the development server will automatically fallback to an in-memory database).*

---

## Installation & Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/campushire.git
cd campushire
```

### 2. Install all dependencies
You can install dependencies for root, server, and client with a single command from the project root:
```bash
npm run install:all
```
*Or install manually in each directory:*
```bash
# Server
cd server && npm install && cd ..

# Client
cd client && npm install && cd ..
```

---

## Environment Variable Configuration

### Server Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campushire
JWT_SECRET=supersecretjwtkey_campushire_secure_token_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Admin credentials for the seed script
ADMIN_NAME=Platform Administrator
ADMIN_EMAIL=admin@campushire.com
ADMIN_PASSWORD=Admin@Campus2026!
```

### Client Configuration (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```env
VITE_API_URL=/api
```
*(In development, Vite proxies `/api` requests to `http://localhost:5000` automatically).*

---

## Database Setup & Seed Script

Populate the database with realistic sample student profiles, corporate recruiters, active job drives, and application records:

```bash
npm run seed
```
*(Alternatively, run `npm run seed --prefix server`).*

To initialize only the administrator account without wiping data:
```bash
npm run seed:admin
```

---

## Default Demo Accounts

The login page (`/login`) includes **1-Click Demo Buttons** to instantly log in as any of the following users without typing:

| Role | Name / Organization | Email | Password | Profile Highlights |
|---|---|---|---|---|
| **Administrator** | Placement Cell Lead | `admin@campushire.com` | `Admin@Campus2026!` | Full administrative governance & user deactivation |
| **Recruiter** | Google India | `recruiter.google@campushire.com` | `Password@123` | SDE Drive, candidate screening & status decisions |
| **Recruiter** | Microsoft IDC | `recruiter.msft@campushire.com` | `Password@123` | Cloud solutions drive & firmware engineering |
| **Student (Eligible)** | Arjun Sharma | `arjun.sharma@college.edu` | `Password@123` | CGPA: 8.85, CSE, 2026 Batch (Eligible for Google) |
| **Student (Selected)** | Priya Patel | `priya.patel@college.edu` | `Password@123` | CGPA: 9.42, IT, 2026 Batch (Offered at Google) |
| **Student (Ineligible)** | Vikram Nair | `vikram.nair@college.edu` | `Password@123` | CGPA: 5.9, Mechanical (Ineligible demonstration) |

---

## Running the Application

### Option A: Run Both Client & Server Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run in Separate Terminals
```bash
# Terminal 1: Backend API Server
cd server
npm run dev

# Terminal 2: Frontend Vite Server
cd client
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## API Reference

All API routes are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register as `student` or `recruiter` |
| `POST` | `/api/auth/login` | Public | Authenticate user & return token/cookie |
| `POST` | `/api/auth/logout` | Authenticated | Clear session cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |

### User Profile (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Fetch active profile |
| `PATCH` | `/api/users/me` | Authenticated | Update academic or recruiter profile |

### Jobs (`/api/jobs`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/jobs` | Public / Student | List jobs with search, filters & pagination |
| `GET` | `/api/jobs/:id` | Public / Student | Get job details and eligibility status |
| `POST` | `/api/jobs` | Recruiter, Admin | Post new placement opening |
| `PATCH` | `/api/jobs/:id` | Recruiter (Owner), Admin | Edit job opening |
| `PATCH` | `/api/jobs/:id/publish` | Recruiter (Owner), Admin | Set status to `published` |
| `PATCH` | `/api/jobs/:id/close` | Recruiter (Owner), Admin | Set status to `closed` |
| `DELETE` | `/api/jobs/:id` | Recruiter (Owner), Admin | Delete job opening |
| `GET` | `/api/jobs/:id/eligibility` | Student | Run server-side eligibility check |
| `POST` | `/api/jobs/:id/apply` | Student | Submit application with verified resume |
| `GET` | `/api/jobs/:id/applications` | Recruiter (Owner), Admin | List applicant candidates for job |

### Applications (`/api/applications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/applications/mine` | Student | List applications submitted by student |
| `PATCH` | `/api/applications/:id/withdraw` | Student (Owner) | Withdraw submitted application |
| `PATCH` | `/api/applications/:id/status` | Recruiter (Owner), Admin | Update status (`shortlisted`, `rejected`, `selected`) |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Placement rate & platform aggregates |
| `GET` | `/api/admin/users` | Admin | Search and filter all user accounts |
| `PATCH` | `/api/admin/users/:id/status` | Admin | Activate or deactivate account |
| `GET` | `/api/admin/jobs` | Admin | View all platform jobs |
| `GET` | `/api/admin/applications` | Admin | Complete platform application audit |

---

## Automated Testing & Results

The test suite covers RBAC, registration safety, eligibility enforcement, duplicate prevention, and application lifecycles.

To run the automated tests:
```bash
npm test
```
*(Or `npm test --prefix server`).*

### Test Results
```text
 ✓ tests/api.test.js (20 tests)
   ✓ 1. Health Check Endpoint > GET /api/health should return status UP
   ✓ 2. Authentication & Authorization > POST /api/auth/register should register a new student successfully
   ✓ 2. Authentication & Authorization > POST /api/auth/register should reject registration with role admin
   ✓ 2. Authentication & Authorization > POST /api/auth/register should reject duplicate email
   ✓ 2. Authentication & Authorization > POST /api/auth/login should log in existing user with correct credentials
   ✓ 2. Authentication & Authorization > POST /api/auth/login should reject invalid password
   ✓ 2. Authentication & Authorization > GET /api/auth/me should reject request without token
   ✓ 2. Authentication & Authorization > GET /api/auth/me should return authenticated user details with valid token
   ✓ 3. Recruiter Job Management & Access Control > Student should NOT be able to create a job (403 Forbidden)
   ✓ 3. Recruiter Job Management & Access Control > Recruiter should be able to create a published job with eligibility criteria
   ✓ 3. Recruiter Job Management & Access Control > Another recruiter should NOT be able to modify recruiter 1’s job (403 Forbidden)
   ✓ 3. Recruiter Job Management & Access Control > Recruiter should be able to create a closed job for testing deadline/status checks
   ✓ 4. Eligibility and Application Logic > Ineligible student should fail eligibility check with clear reasons
   ✓ 4. Eligibility and Application Logic > Ineligible student should be rejected when attempting to apply (422 Unprocessable Entity)
   ✓ 4. Eligibility and Application Logic > Student cannot apply to a closed or expired job (400 Bad Request)
   ✓ 4. Eligibility and Application Logic > Eligible student should be able to submit an application successfully
   ✓ 4. Eligibility and Application Logic > Duplicate application by same student should be rejected (409 Conflict)
   ✓ 4. Eligibility and Application Logic > Student should NOT be able to change application status directly (403 Forbidden)
   ✓ 4. Eligibility and Application Logic > Recruiter should be able to update application status for their job
   ✓ 4. Eligibility and Application Logic > Student can withdraw their own application

 Test Files  1 passed (1)
      Tests  20 passed (20)
```

---

## Deployment Guide (Vercel & Render)

### Deploying Frontend to Vercel
1. Push this repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Select your repository and configure:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set the Environment Variable:
   - `VITE_API_URL`: `https://your-backend-service.onrender.com/api`
5. Click **Deploy**. Vercel will use the included `client/vercel.json` rewrite file to support client-side routing on all paths.

### Deploying Backend to Render
1. Sign in to [Render](https://render.com/).
2. Create a new **Web Service** and connect your GitHub repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `mongodb+srv://<username>:<password>@cluster.mongodb.net/campushire?retryWrites=true&w=majority`
   - `JWT_SECRET`: Generate a secure 32+ character random secret string
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
5. Click **Create Web Service**.

### MongoDB Atlas Setup
1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Network Access**, add IP address `0.0.0.0/0` (allow access from anywhere) so cloud hosts like Render can connect.
3. Under **Database Access**, create a database user with Read and Write permissions.
4. Copy the connection string (e.g. `mongodb+srv://...`) and paste it into Render's `MONGODB_URI` environment variable.
5. In Render's Web Shell, execute `npm run seed:admin` to initialize your production administrator account.

---

## Security & Business Logic Implementation

1. **Self-Assignment Protection**: Public registration validates the role via Zod schema (`student` or `recruiter`). Requests attempting `role: "admin"` are rejected with a 400/403.
2. **Password Security**: Passwords are never stored in plaintext and are hashed with `bcryptjs` using a minimum salt factor of 10. Password hashes are marked `{ select: false }` in Mongoose to prevent accidental serialization in API responses.
3. **Double Duplicate Prevention**:
   - Application service layer queries for existing records matching `(jobId, studentId)` before creating.
   - Mongoose unique compound index `{ jobId: 1, studentId: 1 }` rejects race conditions at the database level with a 409 Conflict.
4. **Eligibility Engine**:
   - Students cannot bypass eligibility by altering frontend payloads; eligibility is re-evaluated on the server during the `apply` operation.
   - Criteria checks confirm CGPA threshold, branch membership, batch graduation year, job status (`published`), and non-expired deadline.
5. **Ownership Isolation**:
   - Recruiters can only retrieve and modify applicants for jobs they own (`job.recruiterId == req.user._id`).
   - Students can only view and withdraw their own applications.

---

## Known Limitations & Future Enhancements

### Current Scope & Sensible Design Choices
- **Resume Links**: Resumes are stored as verified cloud storage URLs (Google Drive, Dropbox, PDF URLs). This enables zero-dependency local setup without requiring paid AWS S3 credentials or local binary storage.
- **Email Notifications**: Status updates are recorded in an audit trail timeline visible in real-time on the student dashboard. External SMTP providers (SendGrid/SES) can be attached without altering the database schema.

### Roadmap for Future Releases
- Integration of live video interview scheduling (Google Meet / Zoom webhooks).
- Bulk CSV candidate export for campus placement office reporting.
- Real-time WebSocket notifications for instant status change alerts.

---

## License

This project is open-source and available under the [MIT License](LICENSE). Built for academic placement systems and software engineering campus interview portfolios.
