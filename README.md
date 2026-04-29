# SnapReward 🎁

A points-based reward redemption platform built with **Express.js** (backend) and **Nuxt 4** (frontend), deployed on **Railway** with **Neon PostgreSQL** database.

## 🏗️ Architecture

```
┌─────────────────────┐         ┌─────────────────────┐
│   Nuxt 4 Frontend   │◄───────►│   Express Backend   │
│   (Port 3000)       │  REST   │   (Port 8080)       │
└─────────────────────┘         └──────────┬──────────┘
                                           │
                                           ▼
                                   ┌─────────────────────┐
                                   │  Neon PostgreSQL    │
                                   └─────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Nuxt 4, @nuxt/ui v4, Pinia |
| Backend | Express.js, Prisma ORM |
| Database | Neon PostgreSQL |
| Image Storage | Cloudinary |
| Deployment | Railway (CI/CD via GitHub) |
| Testing | Jest (backend), Vitest (frontend) |

## 📦 Project Structure

```
Exam-ClickNext-WebCoupon/
├── backend/                 # Express API server
│   ├── controllers/         # Route handlers
│   ├── middleware/         # Auth, rate limit, upload
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   ├── lib/                # Prisma, Cloudinary config
│   ├── prisma/             # Schema & migrations
│   └── tests/              # Unit tests (Jest)
│
├── nuxt-app/               # Nuxt 4 frontend
│   ├── app/
│   │   ├── components/     # Vue components
│   │   ├── composables/    # Shared logic
│   │   ├── pages/          # Route pages
│   │   └── stores/         # Pinia stores
│   └── tests/              # E2E & unit tests
│
└── .github/workflows/      # CI/CD pipeline
```

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

## 🚢 Deployment (Railway)

1. Connect GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy both backend and frontend
4. Set `ALLOWED_ORIGINS` to your frontend URL

## 📄 License

ISC
