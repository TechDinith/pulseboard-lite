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
2. Redux Toolkit + RTK Query — next
3. Spring Boot + Postgres + JWT
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

## Open issues / notes

- ESLint must be run via `node node_modules/eslint/bin/eslint.js .` locally.
- No git commit made for Step 1 yet (awaiting explicit request).
- README still the create-next-app default (Step 9).

## Quiz history / weak areas

- (none yet)
