# PulseBoard Lite — monorepo

Multi-tenant team task board. One repo, several independent services.

| Path | Stack | Status |
| --- | --- | --- |
| `frontend/` | Next.js 16, React 19, TypeScript, Tailwind v4, Redux Toolkit + RTK Query | Steps 1–2, 4–8 done |
| `backend/` | Spring Boot 4, PostgreSQL, JWT (Maven) | Steps 3–4, 8 done; Redis + WebSocket + SQS |
| `sse-service/` | Node.js SSE + Redis Pub/Sub | Step 6 done |
| `worker/` | Node.js SQS export worker | Step 8 done |
| `docker-compose.yml` | local Postgres (+ later Redis, LocalStack) | running |
| `PROGRESS.md` | running project memory — update at the end of every step | — |

Each service owns its own toolchain and `node_modules` / `target`. Nothing at the
root except composition: container config, docs, CI, and this file.

## Frontend / Next.js agents

Next-specific rules live in `frontend/AGENTS.md` — `next dev` re-generates that
file inside the app directory. Read it before writing any code under `frontend/`.

The bundled Next docs are at `frontend/node_modules/next/dist/docs/`.

## Backend

```
cd backend
.\mvnw.cmd spring-boot:run      # requires: docker compose up -d postgres
```
