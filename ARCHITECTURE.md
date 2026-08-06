# 🏗️ System Architecture — SnapReward

เอกสารนี้อธิบายโครงสร้างระบบทั้งหมด ตั้งแต่ Browser → Frontend → Backend → Database
รวมถึง CI/CD pipeline และ runtime topology ของแต่ละ environment

> Diagram ทั้งหมดเป็น Mermaid — GitHub เรนเดอร์ให้อัตโนมัติ

---

## 1. ภาพรวมระบบ (High-level Overview)

```mermaid
flowchart TB
    subgraph client["🌐 Client"]
        BROWSER["Browser<br/>Vue 3 SPA hydrated"]
    end

    subgraph vps["🖥️ VPS — Docker Network: coupon_network"]
        FE["Nuxt 4 — Nitro Server<br/>:3000<br/>SSR + Static Assets"]
        BE["Express 5 API<br/>:8080<br/>REST + JWT"]
    end

    subgraph external["☁️ Managed Services"]
        DB[("Neon PostgreSQL<br/>Serverless Postgres")]
        CDN["Cloudinary<br/>Image Storage + CDN"]
    end

    BROWSER -->|"1 HTTP GET page"| FE
    FE -->|"2 SSR fetch<br/>http://backend:8080"| BE
    BROWSER -->|"3 REST + Bearer token<br/>NUXT_PUBLIC_API_BASE_URL"| BE
    BE -->|"Prisma 7 + adapter-pg<br/>TLS sslmode=require"| DB
    BE -->|"upload / destroy"| CDN
    BROWSER -.->|"โหลดรูปตรงจาก CDN"| CDN

    style BROWSER fill:#e3f2fd,stroke:#1976d2
    style FE fill:#e8f5e9,stroke:#2e7d32
    style BE fill:#fff3e0,stroke:#ef6c00
    style DB fill:#f3e5f5,stroke:#7b1fa2
    style CDN fill:#fce4ec,stroke:#c2185b
```

### จุดสำคัญของ Data Flow

| เส้นทาง | ใช้ URL | เหตุผล |
|---------|---------|--------|
| SSR (server → server) | `NUXT_API_BASE_URL` = `http://backend:8080` | วิ่งผ่าน Docker internal DNS ไม่ต้องออกอินเทอร์เน็ต เร็วกว่าและไม่ติด CORS |
| Client (browser → API) | `NUXT_PUBLIC_API_BASE_URL` | Browser อยู่นอก Docker network จึงต้องใช้ public URL |

โค้ดที่ตัดสินใจเรื่องนี้อยู่ที่ [useApi.ts:7-9](nuxt-app/app/composables/useApi.ts#L7-L9)

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Nuxt 4 (Vue 3.5), @nuxt/ui v4, Tailwind 4, Pinia 3 | `nuxt ^4.4.2` |
| Backend | Express 5, Prisma 7 (driverAdapters + `@prisma/adapter-pg`) | `express ^5.2.1` |
| Database | Neon PostgreSQL (serverless) | — |
| Auth | JWT access token (15m) + Refresh token rotation (7d) | `jsonwebtoken ^9` |
| Storage | Cloudinary (multer memory upload) | `cloudinary ^2.8` |
| Logging | Winston (file) + `activity_logs` table + `node-cron` cleanup | `winston ^3.19` |
| Container | Docker multi-stage, `node:22-alpine`, non-root user | — |
| Registry | GitHub Container Registry (ghcr.io) | — |
| CI/CD | GitHub Actions → SSH deploy → Docker Compose | — |
| Test | Jest + jest-mock-extended (BE), Vitest + Playwright (FE) | — |

---

## 3. Backend Architecture — Layered Pattern

Backend แยกเป็น 4 ชั้นชัดเจน แต่ละชั้นรู้จักเฉพาะชั้นถัดไป

```mermaid
flowchart LR
    REQ["HTTP Request"] --> GM

    subgraph gm["Global Middleware — server.js"]
        GM["helmet → cors → express.json → generalLimiter"]
    end

    GM --> ROUTE

    subgraph layers["Layered Pattern"]
        ROUTE["routes/<br/>กำหนด path + แปะ middleware<br/>authRoutes, adminRoutes, ..."]
        CTRL["controllers/<br/>อ่าน req → เรียก service → ส่ง res<br/>ไม่มี business logic"]
        SVC["services/<br/>Business logic ทั้งหมด<br/>คำนวณแต้ม, ตรวจ stock, hash password"]
        DATA["lib/prisma.js<br/>Prisma Client singleton"]
    end

    ROUTE -->|"authMiddleware<br/>requireRole('admin')<br/>upload.single('image')"| CTRL
    CTRL --> SVC
    SVC --> DATA
    DATA --> DB[("Neon<br/>PostgreSQL")]

    SVC -.->|"throw AppError(msg, status)"| ERR["Global Error Handler<br/>server.js:36"]
    CTRL -.->|"next(err)"| ERR
    ERR --> RES["JSON response<br/>message + status code"]

    SVC -.->|"logActivity()"| LOG[("activity_logs")]

    style ROUTE fill:#e8f5e9,stroke:#2e7d32
    style CTRL fill:#fff3e0,stroke:#ef6c00
    style SVC fill:#e3f2fd,stroke:#1976d2
    style DATA fill:#f3e5f5,stroke:#7b1fa2
    style ERR fill:#ffebee,stroke:#c62828
```

### กติกาของแต่ละชั้น

| ชั้น | หน้าที่ | ห้ามทำ |
|------|--------|--------|
| `routes/` | ประกาศ endpoint + ต่อ middleware chain | ห้ามมี logic |
| `controllers/` | แปลง `req` → พารามิเตอร์, เรียก service, ตอบ `res` | ห้ามเรียก Prisma ตรง |
| `services/` | Business rule + transaction + เรียก Prisma | ห้ามแตะ `req`/`res` |
| `lib/` | Client ของ external system (Prisma, Cloudinary, Winston) | — |

การแยกแบบนี้ทำให้ service เทสได้โดยไม่ต้อง mock HTTP — ดูตัวอย่างที่ [tests/redeemService.test.js](backend/tests/redeemService.test.js)

### Route Map

```
/api/health                      → health check (ใช้โดย Docker healthcheck + CI)
/api/auth      [authLimiter]     → register / login / refresh / logout
/api/user      [auth]            → profile, points
/api/rewards                     → list / detail (public)
/api/redeem    [auth]            → redeem reward, history
/api/admin     [auth + role]     → users, rewards CRUD, upload-image, logs
```

`adminRoutes` ใช้ `router.use(authMiddleware, requireRole('admin'))` ครอบทั้งไฟล์ — ทุก endpoint ใต้ `/api/admin` จึงถูกป้องกันโดยอัตโนมัติ ไม่มีทางลืมแปะทีละเส้น

---

## 4. Frontend Architecture — Nuxt 4

```mermaid
flowchart TB
    subgraph pages["app/pages/ — File-based Routing"]
        P1["index.vue"]
        P2["rewards/"]
        P3["profile/"]
        P4["admin/"]
    end

    subgraph layout["app/layouts/"]
        L["default / auth / admin"]
    end

    subgraph comp["app/components/"]
        C["RewardCard, AdminSidebar,<br/>navbar, BottomNav, ..."]
    end

    subgraph logic["app/composables/ — Data Layer"]
        CO["useRewards, useRedeem, useProfile,<br/>useAdminUsers, useAdminRewards, useAdminLogs"]
        API["useApi — apiFetch wrapper"]
    end

    subgraph store["app/stores/ — Pinia"]
        S["auth.ts<br/>token, refreshToken, user, role"]
    end

    MW["app/middleware/auth.ts<br/>route guard"] --> pages
    pages --> layout
    pages --> comp
    comp --> CO
    pages --> CO
    CO --> API
    API --> S
    API -->|"$fetch + Bearer"| BE["Express API"]

    style API fill:#fff3e0,stroke:#ef6c00
    style S fill:#e3f2fd,stroke:#1976d2
```

### `useApi` — จุดรวมของทุก request

Composable นี้เป็นด่านเดียวที่คุยกับ backend ทำให้ logic 3 อย่างรวมศูนย์ไว้ที่เดียว:

1. เลือก base URL ตาม SSR / client
2. แนบ `Authorization: Bearer <token>` จาก Pinia store อัตโนมัติ
3. **Auto-refresh**: เจอ `401` → เรียก `authStore.refresh()` → ยิง request เดิมซ้ำ → ถ้ายังพัง → `logout()`

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    autonumber
    participant B as Browser
    participant S as Pinia auth store
    participant A as Express /api/auth
    participant DB as Neon PostgreSQL

    Note over B,DB: Login
    B->>A: POST /login { username, password }
    A->>DB: findUnique(user)
    DB-->>A: user row
    A->>A: bcrypt.compare
    A->>DB: INSERT refresh_token (expires +7d)
    A-->>S: { token 15m, refreshToken 7d, user }

    Note over B,DB: เรียก API ปกติ
    B->>A: GET /api/rewards + Authorization Bearer header
    A->>A: authMiddleware — jwt.verify → req.user
    A-->>B: 200 data

    Note over B,DB: Access token หมดอายุ
    B->>A: GET /api/user/profile
    A-->>B: 401 Access token missing/expired
    S->>A: POST /refresh { refreshToken }
    A->>DB: หา token + เช็ค expiresAt
    A->>DB: DELETE token เดิม + INSERT token ใหม่
    Note right of DB: Refresh Token Rotation<br/>token เดิมใช้ซ้ำไม่ได้
    A-->>S: { token ใหม่, refreshToken ใหม่ }
    S->>A: retry request เดิม
    A-->>B: 200 data
```

### Security Layers

| กลไก | ค่า | ไฟล์ |
|------|-----|------|
| Helmet HTTP headers | default set | [server.js:18](backend/server.js#L18) |
| CORS allowlist | `ALLOWED_ORIGINS` (คั่นด้วย `,`) | [server.js:20-29](backend/server.js#L20-L29) |
| Rate limit ทั่วไป | 100 req / 15 นาที / IP | [ratelimiter.js](backend/middleware/ratelimiter.js) |
| Rate limit auth | 10 req / 15 นาที / IP | ครอบเฉพาะ `/api/auth` |
| Access token | JWT อายุ 15 นาที | [authService.js:12](backend/services/authService.js#L12) |
| Refresh token | 7 วัน + rotation ทุกครั้งที่ refresh | [authService.js:98](backend/services/authService.js#L98) |
| RBAC | `requireRole('admin')` | [authMiddleware.js:21](backend/middleware/authMiddleware.js#L21) |
| Fail-fast | ไม่มี `JWT_SECRET` → `process.exit(1)` | [server.js:11-14](backend/server.js#L11-L14) |
| Container | รันด้วย non-root `appuser` | Dockerfile ทั้งสองตัว |

---

## 6. Data Model

```mermaid
erDiagram
    user ||--o{ redemptions : "แลกของรางวัล"
    user ||--o{ refresh_token : "มี session"
    rewards ||--o{ redemptions : "ถูกแลก"

    user {
        int id PK
        string username UK
        string password "nullable — รองรับ OAuth"
        string role "user | admin"
        string provider "local | ..."
        int points
        datetime created_at
        datetime updated_at
    }

    refresh_token {
        int id PK
        string token UK
        int userId FK
        datetime expiresAt
    }

    rewards {
        int id PK
        string title UK
        int points_required
        string image_url
        string public_id "Cloudinary"
        int stock
        datetime redeem_start_date
        datetime redeem_end_date
        datetime expiry_date
    }

    redemptions {
        int id PK
        int users_id FK
        int reward_id FK
        int redeemed_points
        string status
        datetime redeemed_at
    }

    activity_logs {
        int id PK
        string level "info | warning | error"
        string action "user_login, reward_redeemed"
        int actor_id "null = system"
        string target_type
        json metadata
        string ip_address
        datetime created_at
    }
```

`redemptions` มี `@@unique([users_id, reward_id])` — ผู้ใช้ 1 คนแลกรางวัลชิ้นเดิมซ้ำไม่ได้ บังคับที่ระดับ database ไม่ใช่แค่ในโค้ด

`activity_logs` ไม่มี FK ไปที่ `user` โดยตั้งใจ — log ต้องอยู่รอดแม้ user ถูกลบ จึงเก็บ `actor_name` เป็น snapshot ไว้ด้วย

---

## 7. CI/CD Pipeline

```mermaid
flowchart TB
    DEV["👨‍💻 git push"] --> BR{"branch?"}

    subgraph ci["STAGE 1 — CI (รันขนานกัน)"]
        BCI["Backend<br/>npm ci → prisma generate → jest"]
        FCI["Frontend<br/>npm ci → nuxi typecheck → vitest"]
    end

    BR --> BCI
    BR --> FCI

    BCI --> GATE{"ผ่านทั้งคู่<br/>และเป็น push?"}
    FCI --> GATE
    GATE -->|"PR เท่านั้น"| STOP["หยุด — ไม่ build image"]

    subgraph build["STAGE 2 — Build & Push"]
        B1["docker buildx<br/>multi-stage + gha cache"]
        B2["ghcr.io/.../backend:sha"]
        B3["ghcr.io/.../frontend:sha"]
        B1 --> B2
        B1 --> B3
    end

    GATE -->|"push"| B1

    B2 --> DEPLOY{"ref?"}
    B3 --> DEPLOY
    DEPLOY -->|"refs/heads/dev"| STG
    DEPLOY -->|"refs/heads/main"| APPROVE

    subgraph stg["STAGE 3a — Staging"]
        STG["SSH → /opt/coupon-staging<br/>compose pull → up -d → prune"]
    end

    subgraph prd["STAGE 3b — Production"]
        APPROVE["⏸️ GitHub Environment<br/>required reviewers"]
        PROD["SSH → /opt/coupon-app<br/>compose pull → up -d → prune"]
        HC["✅ curl APP_URL/api/health"]
        APPROVE --> PROD --> HC
    end

    style ci fill:#e8f5e9,stroke:#2e7d32
    style build fill:#fff3e0,stroke:#ef6c00
    style stg fill:#e1f5fe,stroke:#0277bd
    style prd fill:#fce4ec,stroke:#c2185b
    style APPROVE fill:#fff9c4,stroke:#f9a825
```

ไฟล์: [.github/workflows/ci.yml](.github/workflows/ci.yml)

### Branch Strategy

```
feature/*  ──PR──►  dev  ──auto──►  Staging (VPS_HOST)
                     │
                     └──PR──►  main  ──approve──►  Production (VPS_HOST_PROD)
```

- **Pull Request** → รันแค่ STAGE 1 (test + typecheck) ไม่ build image ไม่ deploy
- **Push to `dev`** → CI → build → deploy staging อัตโนมัติ
- **Push to `main`** → CI → build → **รอ approve** → deploy production → health check

### Image Tagging

ทุก build ติด 3 tag: ชื่อ branch, short SHA และ `latest` (เฉพาะ `main`)
Deploy ใช้ **short SHA** เป็น `IMAGE_TAG` เสมอ — rollback ทำได้ทันทีด้วยการ export tag เก่าแล้ว `up -d` ใหม่

```bash
# rollback บน VPS
cd /opt/coupon-app
IMAGE_TAG=<sha-เดิม> docker compose -f docker-compose.prod.yml up -d
```

### Secrets ที่ต้องตั้งใน GitHub

| Secret | ใช้ที่ |
|--------|-------|
| `DATABASE_URL` | backend-ci (prisma generate, jest) |
| `JWT_SECRET` | backend-ci |
| `NUXT_PUBLIC_API_BASE_URL` | build arg ของ frontend image |
| `GHCR_TOKEN` | login ghcr บน VPS |
| `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` | deploy staging |
| `VPS_HOST_PROD` / `VPS_SSH_KEY_PROD` | deploy production |
| `APP_URL` | health check หลัง deploy |

> `NUXT_PUBLIC_API_BASE_URL` ถูกตั้ง **2 ที่** โดยตั้งใจ:
> - **build arg** ใน Dockerfile → เป็นค่า default ที่ติดไปกับ bundle ตอน `nuxt build`
> - **runtime env** ใน compose → Nitro อ่าน `NUXT_PUBLIC_*` ตอนบูตแล้ว override `runtimeConfig.public` ให้ ทำให้เปลี่ยน URL ได้โดยไม่ต้อง rebuild image

---

## 8. Container Build

ทั้งสอง image เป็น multi-stage บน `node:22-alpine` และรันด้วย non-root user

```mermaid
flowchart LR
    subgraph be["backend/Dockerfile"]
        B1["Stage 1: build<br/>npm ci → prisma generate"] --> B2["Stage 2: runner<br/>copy node_modules + .prisma + source<br/>USER appuser → :8080"]
    end

    subgraph fe["nuxt-app/Dockerfile"]
        F1["Stage 1: deps<br/>npm ci"] --> F2["Stage 2: build<br/>ARG API_BASE_URL<br/>nuxt build"] --> F3["Stage 3: runner<br/>copy .output เท่านั้น<br/>USER appuser → :3000"]
    end

    style B2 fill:#e8f5e9,stroke:#2e7d32
    style F3 fill:#e8f5e9,stroke:#2e7d32
```

Frontend runner คัดลอกแค่ `.output/` — ไม่มี source code และไม่มี `node_modules` ติดไปด้วย เพราะ Nitro bundle ทุกอย่างไว้แล้ว

---

## 9. Environments

| | Local Dev | Staging | Production |
|---|---|---|---|
| Trigger | `npm run dev` | push `dev` | push `main` + approve |
| Compose file | `docker-compose.yml` | `docker-compose.staging.yml` | `docker-compose.prod.yml` |
| Image | build จาก source | `ghcr.io/.../<sha>` | `ghcr.io/.../<sha>` |
| Path บน VPS | — | `/opt/coupon-staging` | `/opt/coupon-app` |
| Database | Neon หรือ Postgres เครื่องตัวเอง | Neon (แนะนำใช้ branch แยก) | Neon |
| Health check | — | — | ✅ หลัง deploy |

### Environment Variables

**Backend**

```env
PORT=8080
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/db?sslmode=require
JWT_SECRET=<random-long-string>
ALLOWED_ORIGINS=https://your-frontend.com,http://localhost:3000
LOG_RETENTION_DAYS=90
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend**

```env
NUXT_PUBLIC_API_BASE_URL=https://api.your-domain.com   # browser ใช้
NUXT_API_BASE_URL=http://backend:8080                  # SSR ใช้ (ตั้งใน compose)
```

---

## 10. Observability

ระบบมี log 2 ชั้นที่คนละหน้าที่กัน:

```mermaid
flowchart LR
    APP["Express App"] --> W["Winston<br/>lib/logger.js"]
    APP --> AL["logService.logActivity()"]

    W --> F1["backend/logs/error.log"]
    W --> F2["backend/logs/combined.log"]
    W -.->|"NODE_ENV != production"| CON["Console (colorized)"]

    AL --> DBL[("activity_logs<br/>ใน Neon")]
    DBL --> ADMIN["GET /api/admin/logs<br/>+ filter + pagination"]

    CRON["node-cron<br/>ทุกวัน 02:00"] -->|"ลบ log เก่ากว่า<br/>LOG_RETENTION_DAYS"| DBL

    style W fill:#fff3e0,stroke:#ef6c00
    style DBL fill:#f3e5f5,stroke:#7b1fa2
```

| ชั้น | ปลายทาง | ใช้ทำอะไร | อายุ |
|------|---------|-----------|------|
| Winston | ไฟล์ในคอนเทนเนอร์ | debug ปัญหาทางเทคนิค / stack trace | ตามอายุคอนเทนเนอร์ |
| ActivityLog | ตาราง `activity_logs` | audit trail ให้ admin ดูผ่านหน้าเว็บ | 90 วัน (cron ลบให้) |

`logActivity()` จับ error เองและไม่ throw ต่อ — การเขียน log ล้มเหลวจะไม่ทำให้ business transaction พัง

> ⚠️ **ข้อควรรู้ 2 ข้อเรื่อง Winston**
>
> 1. ไฟล์ log เขียนลงในคอนเทนเนอร์ซึ่งไม่มี volume mount — log หายทุกครั้งที่ deploy ใหม่ ถ้าต้องเก็บจริงจังควร mount volume หรือเปลี่ยนไปเขียน stdout แล้วให้ Docker logging driver จัดการ
> 2. [logger.js](backend/lib/logger.js) ใช้ `path.join(__dirname, '../logs/...')` → path จริงคือ `backend/logs/` แต่ในรีโปยังมี `backend/lib/logs/*.log` ที่ถูก commit ไว้ตั้งแต่ก่อนเพิ่มกฎใน `.gitignore` (กฎ `lib/logs/*.log` ไม่มีผลกับไฟล์ที่ track ไปแล้ว) — ควรเอาออกด้วย `git rm --cached backend/lib/logs/*.log` และเพิ่ม `logs/` ลง `.gitignore`

---

## 11. โครงสร้างไฟล์

```
Exam-ClickNext-WebCoupon/
├── .github/workflows/ci.yml        # CI/CD pipeline ทั้งหมด
├── docker-compose.yml              # local — build จาก source
├── docker-compose.staging.yml      # staging — pull จาก GHCR
├── docker-compose.prod.yml         # production — pull จาก GHCR + healthcheck
│
├── backend/                        # Express 5 API
│   ├── server.js                   # entry: middleware chain + error handler
│   ├── routes/                     # setupRoutes.js รวม route ทั้งหมด
│   ├── controllers/                # req/res เท่านั้น
│   ├── services/                   # business logic (unit test ที่นี่)
│   ├── middleware/                 # auth, RBAC, rate limit, multer upload
│   ├── lib/                        # prisma, cloudinary, winston
│   ├── jobs/logCleanup.js          # cron ลบ log เก่า
│   ├── utils/appError.js           # AppError(message, statusCode)
│   ├── prisma/                     # schema + migrations + seed
│   ├── tests/                      # Jest
│   └── Dockerfile
│
└── nuxt-app/                       # Nuxt 4 frontend
    ├── app/
    │   ├── pages/                  # file-based routing
    │   ├── layouts/                # default | auth | admin
    │   ├── components/
    │   ├── composables/            # useApi + feature composables
    │   ├── stores/auth.ts          # Pinia
    │   └── middleware/auth.ts      # route guard
    ├── test/                       # Vitest (unit + nuxt project)
    ├── playwright.config.ts        # E2E
    └── Dockerfile
```

---

## 12. เพิ่มฟีเจอร์ใหม่ต้องแตะไฟล์ไหนบ้าง

ลำดับการทำงานมาตรฐานของโปรเจกต์นี้:

```mermaid
flowchart LR
    A["1 prisma/schema.prisma<br/>+ migrate"] --> B["2 services/<br/>business logic"]
    B --> C["3 tests/<br/>Jest unit test"]
    C --> D["4 controllers/"]
    D --> E["5 routes/<br/>+ middleware"]
    E --> F["6 composables/<br/>เรียกผ่าน useApi"]
    F --> G["7 pages/ + components/"]
    G --> H["8 PR → dev<br/>CI ตรวจอัตโนมัติ"]
```

เขียน service กับ test ก่อน controller — เพราะ service ไม่ผูกกับ HTTP จึงเทสได้เร็วโดยไม่ต้องเปิดเซิร์ฟเวอร์
