# PulseBoard Lite — Progress Notes

Multi-tenant team task board. Portfolio project using the 4-part loop
(BUILD → WALKTHROUGH → PROGRESS → WAIT for user "ready" before QUIZ).

## Target stack (must all appear)

- Next.js, React, TypeScript, Tailwind, Redux Toolkit + RTK Query
- Spring Boot + PostgreSQL + JWT
- Node.js SSE service fed by Redis Pub/Sub
- Polling → WebSockets, Redis, SQS export worker, Docker, CI, README

## Build order

1. Frontend skeleton (Next.js + TS + Tailwind, static dashboard) — **DONE**
2. Redux Toolkit + RTK Query — **DONE**
3. Spring Boot + Postgres + JWT — **DONE**
4. Multi-tenant boards/cards
5. Polling
6. Node SSE service fed by Redis Pub/Sub
7. WebSockets
8. SQS worker (export job)
9. Docker, CI, README

## Environment facts

- Next.js 16.3.8, React 19.2.8, Tailwind CSS v4, TypeScript 5, ESLint 9 flat config.
- Next 16 specifics that matter here:
  - Turbopack is default for `next dev` / `next build` (no flag needed).
  - `params` / `searchParams` / `cookies()` / `headers()` are async-only.
  - `PageProps<'/route'>` / `LayoutProps<'/route'>` are global generated types (via `next typegen`).
  - `middleware` renamed to `proxy`; `next lint` removed (use ESLint CLI).
- Shell quirk: PowerShell execution policy blocks `npx.ps1`. Run tools via
  `node node_modules/<pkg>/bin/...` or `npx.cmd`.
- Repo has its own bundled docs at `node_modules/next/dist/docs/` (per AGENTS.md).

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
- Step 3: the Spring API was stopped after verification; the `pulseboard-postgres`
  docker container was left running. Restart the API with `backend\mvnw.cmd spring-boot:run`.
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
- TODO: re-quiz "client boundary import graph" and "static vs dynamic triggers" in a later step.

## Step 2 — Redux Toolkit + RTK Query (in progress)

- Approach: RTK Query `fetchBaseQuery` against Next **Route Handlers** (`app/api/*`)
  that serve the mock data. Swappable to Spring Boot later via base URL/env.
- Endpoints: `getMembers`, `getBoard`, `getActivity` (shared `getMembers` cache).

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

