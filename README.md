# SnapReward 🎁

A points-based reward redemption platform built with **Express.js** (backend) and **Nuxt 4** (frontend), containerized with **Docker** and deployed to a **VPS** via **GitHub Actions + GHCR**, backed by **Neon PostgreSQL**.

## 🏗️ Architecture

```mermaid
flowchart TB
    BROWSER["🌐 Browser — Vue 3 hydrated"]

    subgraph vps["🖥️ VPS — docker network coupon_network"]
        FE["Nuxt 4 / Nitro<br/>:3000"]
        BE["Express 5 API<br/>:8080"]
    end

    DB[("Neon PostgreSQL")]
    CDN["Cloudinary"]

    BROWSER -->|"1 request page"| FE
    FE -->|"2 SSR fetch — internal DNS<br/>http://backend:8080"| BE
    BROWSER -->|"3 REST + JWT — public URL"| BE
    BE -->|"Prisma 7"| DB
    BE -->|"upload / destroy"| CDN

    style BROWSER fill:#e3f2fd,stroke:#1976d2
    style FE fill:#e8f5e9,stroke:#2e7d32
    style BE fill:#fff3e0,stroke:#ef6c00
    style DB fill:#f3e5f5,stroke:#7b1fa2
    style CDN fill:#fce4ec,stroke:#c2185b
```

📐 **[ดูเอกสารโครงสร้างระบบฉบับเต็ม → ARCHITECTURE.md](ARCHITECTURE.md)** — layered pattern, auth flow, ER diagram, CI/CD pipeline, environments

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Nuxt 4, @nuxt/ui v4, Pinia |
| Backend | Express.js, Prisma ORM |
| Database | Neon PostgreSQL |
| Image Storage | Cloudinary |
| Logging | Winston (file) + `activity_logs` table + node-cron cleanup |
| Container | Docker multi-stage (`node:22-alpine`, non-root) |
| Registry | GitHub Container Registry (ghcr.io) |
| Deployment | GitHub Actions → SSH → Docker Compose on VPS |
| Testing | Jest (backend), Vitest + Playwright (frontend) |

## 📦 Project Structure

```
Exam-ClickNext-WebCoupon/
├── backend/                 # Express API server
│   ├── server.js            # Entry: middleware chain + error handler
│   ├── routes/              # API route definitions (setupRoutes.js รวมทั้งหมด)
│   ├── controllers/         # Route handlers — req/res เท่านั้น
│   ├── services/            # Business logic (จุดที่ unit test)
│   ├── middleware/          # Auth, RBAC, rate limit, upload
│   ├── lib/                 # Prisma, Cloudinary, Winston
│   ├── jobs/                # node-cron — log cleanup
│   ├── utils/               # AppError
│   ├── prisma/              # Schema, migrations, seed
│   └── tests/               # Unit tests (Jest)
│
├── nuxt-app/                # Nuxt 4 frontend
│   ├── app/
│   │   ├── pages/           # Route pages (file-based)
│   │   ├── layouts/         # default / auth / admin
│   │   ├── components/      # Vue components
│   │   ├── composables/     # useApi + feature composables
│   │   ├── middleware/      # Route guard
│   │   └── stores/          # Pinia stores
│   └── test/                # Vitest (unit + nuxt)
│
├── docker-compose.yml       # local (build จาก source)
├── docker-compose.staging.yml
├── docker-compose.prod.yml  # pull image จาก GHCR + healthcheck
└── .github/workflows/       # CI/CD pipeline
```

โครงสร้างชั้น backend เป็น **layered pattern**: `routes → controllers → services → prisma`
แต่ละชั้นรู้จักเฉพาะชั้นถัดไป — service ไม่แตะ `req`/`res` จึงเทสได้โดยไม่ต้องเปิดเซิร์ฟเวอร์

## 🚀 Started

### Prerequisites

- Node.js 18+
- PostgreSQL (Neon) or local PostgreSQL

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:8080
```

### Frontend Setup

```bash
cd nuxt-app

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=8080
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env)

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login (get JWT) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (invalidate refresh) |

### Rewards
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/rewards` | List all rewards |
| GET | `/api/rewards/:id` | Get reward details |

### Redemptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/redeem/:rewardId` | Redeem a reward |
| GET | `/api/redeem/history` | Get user's redemption history |

### Admin (requires admin role)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/:id/role` | Update user role |
| PATCH | `/api/admin/users/:id/points` | Update user points |
| GET | `/api/admin/rewards` | List all rewards |
| POST | `/api/admin/rewards` | Create reward |
| PATCH | `/api/admin/rewards/:id` | Update reward |
| DELETE | `/api/admin/rewards/:id` | Delete reward |
| POST | `/api/admin/upload-image` | Upload image to Cloudinary |
| GET | `/api/admin/logs` | Activity logs (filter + pagination) |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (Docker healthcheck + CI) |

## 🔒 Security Features

- **Helmet.js** - HTTP security headers
- **Rate Limiting** - General (100/15min) + Auth (10/15min)
- **JWT Access Tokens** - 15 minute expiry
- **Refresh Token Rotation** - 7 day expiry, token replacement
- **Role-Based Access Control** - `user` and `admin` roles

## 🧪 Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd nuxt-app && npm test
```

## 🚢 Deployment (GitHub Actions → GHCR → VPS)

```
feature/* ──PR──► dev ──auto──► Staging      (/opt/coupon-staging)
                   └───PR────► main ──approve──► Production (/opt/coupon-app)
```

| Event | สิ่งที่เกิดขึ้น |
|-------|----------------|
| Pull Request | Backend tests + Frontend typecheck/unit tests เท่านั้น |
| Push `dev` | CI → build & push images → deploy staging อัตโนมัติ |
| Push `main` | CI → build & push images → **รอ approve** → deploy production → health check |

Images ถูก tag ด้วย short SHA เสมอ — rollback ได้ด้วย:

```bash
cd /opt/coupon-app
IMAGE_TAG=<previous-sha> docker compose -f docker-compose.prod.yml up -d
```

รายละเอียด pipeline, secrets ที่ต้องตั้ง และ environment matrix อยู่ใน [ARCHITECTURE.md](ARCHITECTURE.md#7-cicd-pipeline)

### Run with Docker locally

```bash
# ต้องมี .env ที่ root (DATABASE_URL, JWT_SECRET, NUXT_PUBLIC_API_BASE_URL)
docker compose up -d --build
```

## 📄 License

ISC
