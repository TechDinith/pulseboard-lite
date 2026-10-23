# PulseBoard Lite — Progress Notes

Multi-tenant team task board. Portfolio project for a job hunt.
Working loop and continuation rules: see "How to continue" below.

## Target stack (must all appear)

- Next.js, React, TypeScript, Tailwind, Redux Toolkit + RTK Query
- Spring Boot + PostgreSQL + JWT
- Node.js SSE service fed by Redis Pub/Sub
- Polling → WebSockets, Redis, SQS export worker, Docker, CI, README

## Build order

1. Frontend skeleton (Next.js + TS + Tailwind, static dashboard) — **DONE**
2. Redux Toolkit + RTK Query — **DONE**
3. Spring Boot + Postgres + JWT — **DONE**
4. Multi-tenant boards/cards — **DONE**
5. Polling — **DONE**
6. Node SSE service fed by Redis Pub/Sub — **DONE**
7. WebSockets — **DONE**
8. SQS worker (export job)
9. Docker, CI, README

## How to continue (new session / new agent)

Read in this order: `AGENTS.md` -> `frontend/AGENTS.md` -> this file -> the current step.

**User:** senior full-stack engineer (Java/Spring, Postgres, Docker) who is **new to
Next.js / React / frontend tooling**. Explain frontend concepts at that level — do not
assume familiarity with App Router, Server Components, or RTK Query.

**Working loop per step:** BUILD -> WALKTHROUGH -> INTERVIEW PREP -> stop and wait.
**No quizzes** (explicitly skipped by the user). Finish each step ASAP, but always
stop at the end to explain what was built, why, and which parts are interview
topics — even if not asked.

**Rules:**
- Do **not** commit unless explicitly asked.
- Verify before declaring done: `tsc --noEmit` + `eslint .` + `next build` in
  `frontend/`; `.\mvnw.cmd -B -DskipTests compile` in `backend/`.
- Update this file at the end of every step.
- Shell quirk: use `npm.cmd` / `npx.cmd` (PowerShell blocks the `.ps1` shims).

## NEXT — Step 8: SQS export worker

Add a Node worker that consumes export jobs from SQS and writes CSV exports.

- Likely LocalStack in `docker-compose.yml` for SQS.
- Worker reads a job (board id, tenant id, requested by), loads data from Postgres
  or calls the backend, writes an artifact, records status.
- Frontend/backend: an endpoint to request an export + status polling.
- After this: 9 Docker/CI/README.

## Environment facts

- Next.js 16.3.8, React 19.2.8, Tailwind CSS v4, TypeScript 5, ESLint 9 flat config.
- Next 16 specifics that matter here:
  - Turbopack is default for `next dev` / `next build` (no flag needed).
  - `params` / `searchParams` / `cookies()` / `headers()` are async-only.
  - `PageProps<'/route'>` / `LayoutProps<'/route'>` are global generated types (via `next typegen`).
  - `middleware` renamed to `proxy`; `next lint` removed (use ESLint CLI).
- Shell quirk: PowerShell execution policy blocks `npx.ps1`. Run tools via
  `node node_modules/<pkg>/bin/...` or `npx.cmd`.
- Repo has its own bundled docs at `frontend/node_modules/next/dist/docs/` (per
  `AGENTS.md`).

## Step 1 — files added

- `types/index.ts` — domain types: `Tenant`, `Plan`, `Member`, `Card`, `Priority`,
  `Column`, `Board`, `ActivityEvent`, `ActivityKind`.
- `data/mock-data.ts` — mock `members`, `tenants`, `currentTenant`, `currentUserId`,
  `board`, `activity`, `getMember()`.
- `components/avatar.tsx`, `components/priority-badge.tsx`,
  `components/task-card.tsx`, `components/board-column.tsx`,
  `components/board.tsx`, `components/activity-feed.tsx`,
  `components/app-header.tsx` — all Server Components (no `"use client"`).
- `app/page.tsx` — composes header + board + activity sidebar.
- `app/layout.tsx` — metadata (title/description), `font-sans` on body.
- `app/globals.css` — body font uses the Geist variable instead of Arial.

## Decisions

- All Step 1 components are Server Components (static, zero client JS for the shell).
  Interactivity (drag/drop, search, tenant switch) lands with RTK/RTK Query in Step 2.
- Data is nested (`Column.cards`) for now. HTTP/state layer in Step 2 will make the
  source of truth the Redux store + RTK Query cache; normalization can happen then.
- `types/index.ts` shape anticipates multi-tenancy now (`Board.tenantId`,
  `Tenant`, `currentTenant`) so Step 4 doesn't force a rewrite.
- Sidebar hidden below `xl`, board columns scroll horizontally.

## Verification (Step 1)

- `tsc --noEmit`: clean
- `eslint .`: clean
- `next build`: success; `/` and `/_not-found` prerendered as static
- runtime smoke test (prod server): page HTML contains PulseBoard / Sprint 24 / cards

## Step 2 — files added / changed

- `app/api/members/route.ts`, `app/api/board/route.ts`, `app/api/activity/route.ts`
  — Route Handlers serving mock data as JSON (board 250ms, activity 400ms delay to
  exercise loading states). Not cached by default in Next 16.
- `lib/features/api/apiSlice.ts` — `createApi` + `fetchBaseQuery`; endpoints
  `getMembers`, `getBoard`, `getActivity`; tagTypes `Members`/`Board`/`Activity`;
  `baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api"` (swap to Spring Boot later).
- `lib/store.ts` — `makeStore()` factory + `AppStore`/`RootState`/`AppDispatch` types.
- `lib/hooks.ts` — typed `useAppDispatch` / `useAppSelector` via `.withTypes`.
- `components/providers.tsx` — `"use client"` Redux `<Provider>`; store created once
  via `useState(makeStore)` (ref pattern rejected by React 19 `react-hooks/refs`).
- `app/layout.tsx` — `<Providers>{children}</Providers>`.
- `components/board.tsx` — now `"use client"`, uses `useGetBoardQuery` +
  `useGetMembersQuery`, skeleton + error/retry states.
- `components/activity-feed.tsx` — now `"use client"`, uses `useGetActivityQuery` +
  `useGetMembersQuery`.
- `components/board-column.tsx` / `task-card.tsx` — no longer import mock data;
  members passed down as props (server-data-free leaf components).

## Decisions (Step 2)

- Mock backend = Next Route Handlers, so RTK Query does a real HTTP round trip and
  the same code swaps to Spring Boot via base URL. No `next-redux-wrapper` needed
  because data is fetched **client-side** in Step 2 (no SSR store hydration yet).
- `getMembers` is requested by two components → RTK Query dedupes/shares the cache.
- `/` stays static (shell); data arrives client-side → route handlers are Dynamic.
- Loading + error + refetch UI wired now so polling/realtime steps can reuse it.

## Verification (Step 2)

- `tsc --noEmit`: clean
- `eslint .`: clean
- `next build`: success. Routes: `/` static; `/api/board|members|activity` dynamic.
- prod smoke test: `/api/*` return 200 JSON (board 5 cols, 5 members, 5 events); `/` 200.

## Open issues / notes

- ESLint must be run via `node node_modules/eslint/bin/eslint.js .` locally.
- No git commit made yet (awaiting explicit request).
- README still the create-next-app default (Step 9).
- Step 3: after the restructure smoke test both services were **left running**
  (`backend` :8080, `frontend` :3000) with the `pulseboard-postgres` container. Stop
  them before working, or restart with `cd backend; .\mvnw.cmd spring-boot:run` and
  `cd frontend; npm.cmd run dev`.
- Step 3: emails are globally unique (revisit per-tenant email in Step 4).
- Frontend still talks to the Next mock API; Step 4 switches RTK Query base URL to Spring.

## Quiz history / weak areas

### Step 1 quiz (Next.js fundamentals)

- Q1/Q1b Server vs Client Components, `"use client"` as a **module boundary**:
  WEAK. User's instinct right (don't mark whole board), but missed that the import
  graph (children + `@/data/mock-data`) is pulled into the client bundle and hydrates.
  Re-test later.
- Q2 why `/` is static vs what forces dynamic. Answer: "I don't know".
- Q2b which changes force dynamic: got `searchParams` / `cookies()` / `no-store` right;
  fell for the `useState` trap (does NOT force dynamic; illegal in Server Components).
- Weak areas to reinforce (quizzes are skipped — fold these into walkthroughs
  instead): client-boundary import graph, static vs dynamic triggers.

## Step 3 — Spring Boot + PostgreSQL + JWT (DONE)

### Files added (`backend/`)

- `pom.xml` — Boot 4.1.1 parent (Initializr emitted a bogus `4.1.1.RELEASE`;
  Central only has `4.1.1`). Starters use the **new Boot 4 names**:
  `spring-boot-starter-webmvc` (not `-web`), `spring-boot-starter-data-jpa`,
  `spring-boot-starter-security`, `spring-boot-starter-validation`,
  `spring-boot-starter-flyway`; plus `flyway-database-postgresql`, `postgresql`.
- `src/main/resources/application.yml` — datasource from `DB_URL`/`DB_USER`/`DB_PASSWORD`
  (default local docker creds), `jpa.hibernate.ddl-auto=validate`, `open-in-view=false`,
  Flyway enabled, `pulseboard.jwt.secret` + `ttl` (`PT12H`).
- `src/main/resources/db/migration/V1__init.sql` — `tenants` + `users` tables
  (uuid PKs, FK `users.tenant_id`, unique `tenants.slug` + `users.email`, tenant index).
- `tenant/` — `Plan` (FREE/PRO/ENTERPRISE), `Tenant`, `TenantRepository`.
- `user/` — `Role` (OWNER/ADMIN/MEMBER), `User` (lazy `ManyToOne` tenant), `UserRepository`.
- `auth/` — `JwtService` (hand-rolled HS256, JDK-only), `JwtClaims`,
  `JwtAuthenticationFilter`, `AuthPrincipal`, `AuthService`, `AuthController`
  (`POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`),
  DTOs (`RegisterRequest`, `LoginRequest`, `UserResponse`, `AuthResponse`).
- `common/` — `ApiException` (+ `conflict`/`unauthorized`), `ApiError`,
  `GlobalExceptionHandler` (409 ApiException, 400 validation).
- `config/SecurityConfig.java` — stateless chain, CSRF off, CORS for `localhost:3000`,
  permitAll on register/login, JWT filter before `UsernamePasswordAuthenticationFilter`,
  BCrypt encoder, JSON 401/403 handlers.
- `BackendApplication` — `exclude = UserDetailsServiceAutoConfiguration.class`
  (Boot 4 package `org.springframework.boot.security.autoconfigure`) to remove the
  random in-memory user + "generated security password" log.
- `../docker-compose.yml` — `postgres:16-alpine`, db/user/pass `pulseboard`,
  healthcheck, named volume.

### Decisions (Step 3)

- JWT is hand-rolled HS256 via `javax.crypto.Mac` + constant-time `MessageDigest.isEqual`
  — **zero extra deps**, dodges Boot 4 / Jackson 3 version conflicts. Production would
  use Nimbus JOSE or JJWT.
- No `UserDetailsService`/`AuthenticationManager`; login uses `passwordEncoder.matches()`.
- Email is **globally unique** for now (email-only login). Per-tenant uniqueness → Step 4.
- Register creates the tenant if its slug is new; first user becomes `OWNER`.
- Flyway owns the schema; `ddl-auto=validate` means JPA never creates tables.

### Verification (Step 3)

- `.\mvnw.cmd -B -DskipTests compile`: 22 sources compile (Java 21).
- Postgres 16.15 up (docker, healthy); Flyway "Successfully applied 1 migration" → v1.
- App boots on :8080, connects to Postgres, Hibernate validates schema.
- `register` → 201 token+user; `login` → 200 token; `GET /me` (Bearer) → 200 user.
- `GET /me` no token → **401 JSON**; duplicate email → **409 `email_taken`**;
  bad payload → **400 `validation_error`** (field messages); wrong password → 401.
- "Using generated security password" warning gone.

### Environment facts (Boot)

- Spring Boot **4.1.1**, Java 21, Spring Security 7, Hibernate 7, Jakarta EE.
- Initializr's `4.1.1.RELEASE` parent is not in Central — use `4.1.1`.
- New modular starters: `spring-boot-starter-webmvc`, `-flyway`, and
  `spring-boot-starter-<feature>-test` variants.
- Maven wrapper pulls Maven 3.10.0 (first `mvnw` run is slow).

### To run

- `docker compose up -d postgres`
- `cd backend; .\mvnw.cmd spring-boot:run`
  (env: `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_TTL`, `SERVER_PORT`)
- `cd frontend; npm.cmd run dev` → http://localhost:3000
  (`npm` is blocked by PowerShell execution policy here — use `npm.cmd`.)

## Repo restructure (after Step 3 — DONE)

The Next.js app used to own the repo root, which made `backend/` look like a stray
folder. Moved to a clean polyglot-monorepo layout **before** Steps 4–9 added more
services and CI/README paths.

### New layout

```
.
├── frontend/          Next.js 16 (app/, components/, lib/, types/, package.json, …)
│   ├── AGENTS.md        next-dev-generated rules (moved here with the app)
│   └── .gitignore       Next-specific ignores (moved here)
├── backend/           Spring Boot 4 + Maven (pom.xml)
├── docker-compose.yml root composition (Postgres now; Redis/LocalStack later)
├── AGENTS.md          root monorepo map (pointer to frontend/AGENTS.md)
└── PROGRESS.md        this file
```
(`sse-service/` and `worker/` will be added alongside `backend/` in Steps 6 and 8.)

### Changes made

- `git mv`'d the whole Next app + its configs + `README.md`, `AGENTS.md`, `CLAUDE.md`
  into `frontend/`. Each service now owns its own toolchain and deps dir.
- Deleted stale root artifacts: `node_modules/`, `.next/`, `tsconfig.tsbuildinfo`
  (renaming `node_modules` on Windows breaks the `.bin` shims, so it was rebuilt).
- `.gitignore` **split**: root now ignores Java/IDE/env/OS/`node_modules/` at any
  depth (`backend/target/`, `.idea/`, `*.iml`); `frontend/.gitignore` keeps the
  create-next-app rules (now correctly anchored to the app dir).
- Root `AGENTS.md` rewritten as a monorepo map; the `next dev`-generated rules
  block now lives in `frontend/AGENTS.md` (where `next dev` re-creates it).
- Fresh `npm install` (374 packages) in `frontend/`.

### Verification (after restructure)

- `frontend`: `tsc --noEmit` clean, `eslint .` clean, `next build` green
  (`/` static; `/api/board|members|activity` dynamic). `LayoutProps` briefly errored
  until `next build` regenerated the `next typegen` globals.
- `backend`: `mvnw compile` clean (unchanged, moved nothing).
- Runtime: Postgres healthy; `/` 200; `/api/board` returns `Sprint 24` + 5 columns;
  Spring `register` → 201 OWNER + tenant, `GET /me` → 200.
- Note: `/` HTML no longer contains "Sprint 24" — expected since Step 2 made the
  board a client component; data arrives via RTK Query, not SSR.


## Step 4 � multi-tenant boards & cards (DONE)

### Backend (`backend/`)
- Migrations: `V2__boards_cards.sql` (boards/columns/cards with tenant_id, indexes), `V3__per_tenant_email.sql` (unique (tenant_id,email), drop global unique).
- Entities/repos: `Board`, `BoardColumn`, `Card` + repositories with tenant scoping (`findByIdAndTenantId`, `findByIdAndBoard_TenantId`).
- Services/controllers: `BoardService`/`BoardController` (`/api/boards` CRUD-ish, get detail, add column), `CardService`/`CardController` (`/api/cards` CRUD + `/move`). All operations filter by `AuthPrincipal.tenantId`; cross-tenant access returns 404/403 as appropriate.
- Auth: per-tenant email uniqueness enforced; register uses tenant + checks `(tenantId,email)`.
- Exceptions/handlers updated.

### Frontend (`frontend/`)
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api` in `.env.local`; `apiSlice` uses `fetchBaseQuery` with `prepareHeaders` attaching `Authorization: Bearer <token>` from `localStorage` (pulseboard_token). Added endpoints for auth/boards/cards.
- Removed Next mock API handlers (`app/api/*`).
- Added simple auth pages (`/login`, `/register`) storing token.

### Verification (Step 4)
- Backend: `.\mvnw.cmd -B -DskipTests compile` SUCCESS (34 sources).
- Frontend: `npx.cmd tsc --noEmit` clean; `next build` SUCCESS (routes /, /_not-found, /login, /register static).

## Step 5 � Polling (DONE)

### Frontend (`frontend/`)
- Added board detail route `/boards/[id]` (client component) using `useGetBoardDetailQuery` with `pollingInterval: 5000` to refresh board state periodically.
- RTK Query polling leverages existing tags/cache; works with Spring `/api/boards/{id}`.

### Verification (Step 5)
- Frontend: `npx.cmd tsc --noEmit` clean; `next build` SUCCESS (`/boards/[id]` dynamic).

## Step 6 � Node SSE service + Redis Pub/Sub (DONE)

### Backend (`backend/`)
- `pom.xml`: added `spring-boot-starter-data-redis`.
- `application.yml`: `spring.data.redis.host/port` from `REDIS_HOST`/`REDIS_PORT`.
- `events/BoardEventPublisher` � serializes events with **Jackson 3** (`tools.jackson.databind.ObjectMapper`; Boot 4 does not ship `com.fasterxml`), publishes to Redis channel `board:<boardId>`.
- `BoardService`/`CardService` publish `board.created`, `column.created`, `card.created|updated|moved|deleted` after mutations (board id resolved from the card's column).

### SSE service (`sse-service/`)
- `package.json` (ESM) � `express`, `cors`, `ioredis`.
- `index.js` � `GET /events?boardId=...` streams `text/event-stream`; one Redis subscription per board shared by all connected clients; event name `board:update`, data = JSON message. `GET /health` returns `{status:"ok"}`. CORS restricted to `:3000`.
- Default port 4000 (`PORT`), Redis URL via `REDIS_URL`.

### Infra
- `docker-compose.yml`: added `redis:7-alpine` (`pulseboard-redis`, :6379, healthcheck). Fixed the earlier bad append that put `redis` under `volumes`.

### Frontend (`frontend/`)
- `.env.local`: `NEXT_PUBLIC_SSE_URL=http://localhost:4000`.
- `lib/use-board-events.ts` � client hook opening `EventSource`, listening for `board:update`; handler kept in a ref so re-renders don't reconnect; closes on unmount.
- `/boards/[id]`: subscribes to SSE and calls RTK Query `refetch()` on events; polling kept at 30s as a safety net (SSE is primary).
- Added `/boards` (list + create), home `/` redirects to `/boards`; auth pages use typed RTK Query results.
- `apiSlice` fully typed (no `any`) � `AuthResult`, `BoardSummary`, `BoardDetail`, `CardSummary`, `ColumnWithCards`, create/update/move inputs.
- Removed the leftover mock-only UI path from the active routes.

### Verification (Step 6)
- Backend: `.\mvnw.cmd -B -DskipTests compile` SUCCESS (35 sources).
- Frontend: `npx.cmd tsc --noEmit` clean; `eslint .` clean; `next build` SUCCESS
  (`/`, `/boards`, `/login`, `/register` static; `/boards/[id]` dynamic).
- SSE service: `npm install` OK; `node index.js` starts on :4000 and `/health` ? `{"status":"ok"}`.
- **Not runtime-tested end-to-end**: Docker Desktop was not running during verification
  (Postgres/Redis containers could not start), so the full publish ? SSE ? refetch loop
  is unverified. Start Docker Desktop, `docker compose up -d`, backend, `sse-service`,
  then create a card to observe it.

## Step 7 � WebSockets (DONE)

### Backend (`backend/`)
- `pom.xml`: added `spring-boot-starter-websocket`.
- `ws/JwtHandshakeInterceptor` � verifies `?token=` during the handshake (JWT filter doesn't see WS upgrades without an Authorization header); stores `tenantId`/`userId` in session attributes; rejects with 401.
- `ws/BoardSocketHandler` � `TextWebSocketHandler` + Redis `MessageListener`:
  - client ? `{"type":"subscribe","boardId":"..."}`; subscription is checked against `boardRepository.findByIdAndTenantId(...)`, so cross-tenant board IDs are rejected.
  - Redis `board:*` messages are fan-out to local sessions as `{"type":"board:update","boardId":...,"payload":{original event}}`.
  - `unsubscribe`, `afterConnectionClosed`, and empty-room cleanup implemented.
- `config/WebSocketConfig` � registers handler at `/ws` (origin `http://localhost:3000`) and a `RedisMessageListenerContainer` on pattern `board:*`.
- `SecurityConfig` � `/ws` is `permitAll` at the filter-chain level; the handshake interceptor is the auth gate.

### Frontend (`frontend/`)
- `lib/use-board-socket.ts` � native `WebSocket`, token from `localStorage`, subscribe on open, exponential-backoff reconnect (1s?30s cap), closes on unmount.
- `/boards/[id]` uses `useBoardSocket` to `refetch()` on `board:update`; polling kept at 30s as reconnect-gap fallback.
- `.env.local`: `NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws`. SSE hook/service remain available as an alternate transport.

### Verification (Step 7)
- Backend: `.\mvnw.cmd -B -DskipTests compile` SUCCESS (38 sources).
- Frontend: `npx.cmd tsc --noEmit` clean; `eslint .` clean; `next build` SUCCESS.
- Runtime (Docker Desktop + Postgres + Redis + backend + sse-service):
  - register ? create board ? connect `ws://localhost:8080/ws?token=...` ? `subscribe` ? `subscribed`.
  - creating a card produced `board:update` with `card.created` payload (Redis ? WS fan-out) � PASS.
  - second tenant subscribing to the first tenant's board got `{"type":"error","payload":{"message":"board not found"}}` � PASS.
  - background processes started for the test were stopped afterwards; containers left running.
