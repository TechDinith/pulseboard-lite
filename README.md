# PulseBoard Lite

> **Multi-tenant team task board** — a full-stack portfolio project demonstrating modern distributed system architecture.

PulseBoard Lite is a real-time, multi-tenant task board (think Trello/Jira-lite) built as a polyglot monorepo. It showcases authentication, multi-tenancy, real-time WebSocket/SSE updates, async job processing via SQS, and a modern React frontend — all wired together with Docker and CI/CD.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Component Breakdown](#component-breakdown)
- [How It Works (Data Flow)](#how-it-works-data-flow)
- [Multi-Tenancy](#multi-tenancy)
- [Real-Time Updates](#real-time-updates)
- [Async Export Jobs](#async-export-jobs)
- [Prerequisites](#prerequisites)
- [How to Run (Step-by-Step)](#how-to-run-step-by-step)
- [Happy Path Walkthrough](#happy-path-walkthrough)
- [CI/CD](#cicd)
- [Key Design Decisions](#key-design-decisions)

---

## Architecture Overview

```
+------------------------------------------------------------------+
|                    FRONTEND (Next.js) - :3000                     |
|  React 19 . TypeScript . Tailwind v4 . Redux Toolkit + RTK Query  |
+------------------------------------------------------------------+
                             | HTTP REST + WebSocket
                             v
+------------------------------------------------------------------+
|                  BACKEND (Spring Boot) - :8080                    |
|  Java 21 . Spring Security . JPA . Flyway . JWT (HS256)           |
+------------------------------------------------------------------+
       |          |          |          |
       v          v          v          v
+----------+ +--------+ +----------+ +------------+
|PostgreSQL| | Redis  | |LocalStack| |SSE Service |
|  :5432   | | :6379  | | :4566    | |  (Node)    |
|  (Data)  | |(PubSub)| | (SQS)    | |   :4000    |
+----------+ +--------+ +----------+ +------------+
                                      |
                                      v
                              +--------------+
                              |   Worker     |
                              |  (Node.js)   |
                              | (SQS Poller) |
                              +--------------+
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) | Server/Client rendering, routing |
| | React 19 | UI components, hooks |
| | TypeScript 5 | Type safety |
| | Tailwind CSS v4 | Utility-first styling |
| | Redux Toolkit + RTK Query | State management, data fetching, caching |
| | @dnd-kit | Drag-and-drop |
| **Backend** | Spring Boot 4 | REST API, business logic |
| | Spring Security 7 | JWT auth, CORS |
| | Spring Data JPA | ORM, repositories |
| | Flyway | Database migrations |
| | PostgreSQL 16 | Primary data store |
| | Redis 7 | Pub/Sub for real-time events |
| | Hand-rolled JWT (HS256) | Stateless auth (zero extra deps) |
| **Real-Time** | WebSocket (Spring) | Bidirectional client communication |
| | Redis Pub/Sub | Event fan-out between services |
| | SSE (Node.js) | Server-Sent Events (alternate transport) |
| **Async** | AWS SQS (LocalStack) | Message queue for export jobs |
| | Node.js Worker | CSV generation, DB updates |
| **Infra** | Docker Compose | Local development environment |
| | GitHub Actions | CI/CD (lint, typecheck, build) |

---

## Component Breakdown

### 1. Frontend (Next.js) - Port 3000
**Job:** The user-facing web app. Renders boards, cards, columns, exports, login/register pages. Manages client state, fetches data, handles drag-and-drop, and opens WebSocket for real-time sync.

**Connects to:** Backend via HTTP REST + WebSocket. SSE service via EventSource (alternate).

---

### 2. Backend (Spring Boot) - Port 8080
**Job:** The core API server. Handles authentication (register/login/JWT), all business logic (boards, cards, columns, exports), enforces multi-tenancy, publishes real-time events to Redis, and enqueues export jobs to SQS.

**Connects to:** PostgreSQL (data), Redis (events), SQS/LocalStack (jobs), Frontend (HTTP/WS).

---

### 3. PostgreSQL - Port 5432
**Job:** Primary relational database. Stores tenants, users, boards, columns, cards, exports. Schema managed by Flyway migrations (V1-V5). Every table has `tenant_id` for row-level isolation.

**Connects to:** Backend (JPA), Worker (direct `pg` queries).

---

### 4. Redis - Port 6379
**Job:** In-memory message broker. Used purely for Pub/Sub — backend publishes `board:<boardId>` events, SSE service subscribes and fans out to WebSocket clients. No persistent data stored.

**Connects to:** Backend (publish), SSE service (subscribe).

---

### 5. SSE Service (Node.js) - Port 4000
**Job:** Lightweight Express server that bridges Redis Pub/Sub to browsers via Server-Sent Events. Accepts `GET /events?boardId=...`, subscribes to Redis channel, streams events to connected clients.

**Connects to:** Redis (subscribe), Frontend (SSE).

---

### 6. LocalStack (SQS) - Port 4566
**Job:** Local AWS cloud emulator providing an SQS queue (`pulseboard-exports`). Backend sends export job messages; worker polls for them. Decouples backend from worker for async processing.

**Connects to:** Backend (send), Worker (receive/delete).

---

### 7. Worker (Node.js)
**Job:** Background process that long-polls SQS. When a job arrives, queries PostgreSQL for board cards, generates CSV, updates export status to `COMPLETED` with CSV content, and deletes the SQS message.

**Connects to:** SQS (poll), PostgreSQL (read cards, update exports).

---

## How It Works (Data Flow)

```
Frontend --HTTP/WS--> Backend --SQL--> PostgreSQL
   |                      |
   |                      |--Redis Pub--> Redis <--Sub-- SSE Service <--SSE-- Frontend
   |                      |
   |                      |--SQS Send--> LocalStack <--Poll-- Worker --SQL--> PostgreSQL
```

### Action to Flow Map

| Action | Flow |
|--------|------|
| **Register/Login** | Frontend -> Backend -> PostgreSQL (creates user/tenant, issues JWT) |
| **List boards** | Frontend -> Backend -> PostgreSQL (queries by tenantId) |
| **Open board** | Frontend -> Backend (detail) + WebSocket subscribe -> Backend verifies tenant -> Redis channel |
| **Add card** | Frontend -> Backend -> PostgreSQL (insert) -> Redis (publish event) -> All clients refetch |
| **Drag card** | Frontend -> Backend (move) -> PostgreSQL (update) -> Redis (publish) -> All clients refetch |
| **Request export** | Frontend -> Backend -> PostgreSQL (QUEUED) -> SQS (enqueue) -> Worker (process) -> PostgreSQL (COMPLETED) |
| **Download CSV** | Frontend -> Backend -> PostgreSQL (read content) -> Browser download |

---

## Multi-Tenancy

### How tenants are created
1. User registers with `email`, `password`, `displayName`, `tenantName`
2. Backend slugifies `tenantName` -> `acme-corp`
3. If slug exists -> reuse tenant (allows multiple users to join same workspace)
4. If new -> create `Tenant` with `Plan.FREE`
5. Creates `User` linked to tenant with `Role.OWNER`

### How tenants are separated (Row-Level Isolation)
- Every table has `tenant_id` column
- JWT token carries `tenantId` claim
- `JwtAuthenticationFilter` extracts `tenantId` into `AuthPrincipal`
- Every service method filters by `tenantId`:
  ```java
  boardRepository.findByIdAndTenantId(boardId, principal.tenantId())
      .orElseThrow(() -> ApiException.notFound("Board not found"));
  ```
- Even if a user guesses another tenant's board ID -> query returns 404

### Joining an existing workspace
Register with the **same workspace name** (e.g., "Acme Corp"). The slug matches, so the new user is added to the existing tenant. Both users share the same `tenantId` and see the same boards.

---

## Real-Time Updates

1. Frontend opens WebSocket to `ws://localhost:8080/ws?token=<JWT>`
2. Sends `{ type: "subscribe", boardId: "..." }`
3. Backend verifies tenant owns the board, subscribes session to Redis channel `board:<boardId>`
4. When a card/column changes, backend publishes event to Redis
5. Backend's `BoardSocketHandler` receives Redis message, fans out to all local WebSocket sessions
6. Frontend receives `board:update` -> RTK Query refetches board detail
7. Polling (30s) acts as fallback for reconnect gaps

**Alternate transport:** SSE service on `:4000` subscribes to same Redis channels and streams via `EventSource`.

---

## Async Export Jobs

1. User requests export -> Backend creates `ExportRequest` (status: `QUEUED`)
2. Backend sends SQS message to LocalStack queue `pulseboard-exports`
3. Worker long-polls SQS (`WaitTimeSeconds: 10`)
4. Worker receives job, queries PostgreSQL for all cards in the board
5. Worker generates CSV using `csv-stringify/sync`
6. Worker updates `exports` table: status -> `COMPLETED`, stores CSV in `content` column
7. Worker deletes SQS message
8. Frontend shows "Download CSV" button -> fetches with auth token -> browser downloads file

---

## Prerequisites

- **Docker Desktop** (for Postgres, Redis, LocalStack)
- **Java 21** (for Backend)
- **Node.js 22+** (for Frontend, SSE Service, Worker)

---

## How to Run (Step-by-Step)

### Step 1: Start Infrastructure
```bash
docker compose up -d
```
This starts PostgreSQL (`:5432`), Redis (`:6379`), and LocalStack (`:4566`).

### Step 2: Start Backend
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
Boots on `:8080`. Flyway runs migrations automatically. Connects to Postgres + Redis.

### Step 3: Start SSE Service
```bash
cd sse-service
node index.js
```
Boots on `:4000`. Connects to Redis for Pub/Sub.

### Step 4: Start Worker
```bash
cd worker
node index.js
```
Starts polling SQS queue for export jobs.

### Step 5: Start Frontend
```bash
cd frontend
npm.cmd run dev
```
Boots on `:3000`. Open http://localhost:3000 in your browser.

### Stop Everything
```bash
# Stop all services (Ctrl+C in each terminal)
# Stop Docker containers:
docker compose down
```

---

## Happy Path Walkthrough

### 1. Register
1. Go to http://localhost:3000 -> redirects to `/login`
2. Click "Create workspace"
3. Fill: Workspace Name, Your Name, Email, Password
4. Backend creates tenant + OWNER user, returns JWT
5. Frontend stores token, redirects to Dashboard

### 2. Create a Board
1. On Dashboard, enter board name -> click "Create Board"
2. Click the board card to open it

### 3. Build the Board
1. Click "+ Add column" -> enter column name (e.g., "To Do", "In Progress", "Done")
2. Click "+ Add a card" in any column -> enter title, description, priority
3. Cards appear on the board

### 4. Drag & Drop
1. Grab a card and drag it to another column
2. Position is saved to backend
3. All connected tabs see the update in real-time

### 5. Search
1. Type in the search bar (top nav)
2. Cards filter by title/description/labels
3. Columns with no matches are hidden

### 6. Real-Time (Two Users)
1. Register a second user with the **same workspace name**
2. Open the same board in two browser tabs (one per user)
3. Create/move cards in one tab -> watch them appear in the other tab instantly

### 7. Export
1. Go to `/exports` page
2. Select a board -> click "Request Export"
3. Watch the worker terminal process the job
4. Click "Download CSV" when status shows `COMPLETED`
5. CSV file downloads to your computer

### 8. Multi-Tenancy Test
1. Register a user with a **different** workspace name
2. Notice they cannot see boards from the first workspace
3. Backend strictly scopes all data by `tenantId`

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on push/PR to `main`:
- **Backend:** `mvnw compile` (Java 21, Maven)
- **Frontend:** ESLint + `tsc --noEmit` + `next build` (Node 22)

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Hand-rolled JWT** | Avoids Boot 4 / Jackson 3 version conflicts; zero extra deps; ~50 lines |
| **Per-tenant email uniqueness** | Users can share email across workspaces |
| **Redis Pub/Sub over direct WS** | Decouples backend from transport; SSE as fallback |
| **SQS over direct processing** | Async keeps API fast; worker scales independently |
| **RTK Query over manual fetch** | Auto-caching, dedup, invalidation, polling |
| **@dnd-kit over react-beautiful-dnd** | Modern, maintained, better accessibility |
| **Row-level tenant isolation** | Simple, effective; every query filters by `tenantId` |
| **Flyway over JPA DDL** | Version-controlled schema; `ddl-auto=validate` ensures safety |
| **LocalStack for SQS** | Free local AWS emulation for development |

---

## Interview Talking Points

1. **"How does real-time work?"** -> Backend publishes to Redis -> SSE service fans out -> WebSocket clients receive -> RTK Query refetches
2. **"How is multi-tenancy implemented?"** -> Shared DB, shared schema, row-level isolation via `tenant_id`. JWT carries `tenantId`. Every query filters by it.
3. **"How does drag-and-drop persist?"** -> @dnd-kit handles UI drag. On drop, PATCH updates backend. Backend publishes event. All clients refetch.
4. **"How does the export worker work?"** -> Backend enqueues to SQS. Worker long-polls. Processes job, updates DB, deletes message. Frontend polls status.
5. **"Why hand-rolled JWT?"** -> Spring Boot 4 brought Jackson 3 and modular starters. JJWT had version conflicts. Hand-rolled HS256 with `javax.crypto.Mac` is ~50 lines, zero deps, constant-time comparison prevents timing attacks.
6. **"How does RTK Query handle caching?"** -> Tag-based invalidation. Mutations invalidate tags -> auto-refetch. Deduplicates concurrent requests.

---

## Project Structure

```
pulseboard-lite/
+-- frontend/          # Next.js 16 (app/, components/, lib/, types/)
+-- backend/           # Spring Boot 4 (src/, pom.xml, Flyway migrations)
+-- sse-service/       # Node.js SSE + Redis Pub/Sub
+-- worker/            # Node.js SQS export worker
+-- docker-compose.yml # Postgres + Redis + LocalStack
+-- .github/workflows/ # GitHub Actions CI
+-- README.md          # This file
+-- AGENTS.md          # Monorepo map
+-- PROGRESS.md        # Build history & notes
```

---

*Built as a portfolio project to demonstrate full-stack, distributed system architecture.*