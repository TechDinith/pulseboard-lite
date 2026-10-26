# PulseBoard Lite

Multi-tenant team task board.

## Architecture & Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Redux Toolkit + RTK Query.
- **Backend:** Spring Boot 4, PostgreSQL, JWT (Maven).
- **SSE Service:** Node.js, Express, Redis Pub/Sub.
- **Worker:** Node.js, SQS export worker.

## Prerequisites

- Docker Desktop (for Postgres, Redis, LocalStack).
- Java 21 (for Backend).
- Node.js 22+ (for Frontend, SSE Service, Worker).

## Local Development Setup

1. **Infrastructure:**
   ```bash
   docker compose up -d
   ```

2. **Backend:**
   ```bash
   cd backend
   .\mvnw.cmd spring-boot:run
   ```
   (Requires `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `JWT_TTL` env vars or defaults)

3. **Frontend:**
   ```bash
   cd frontend
   npm.cmd run dev
   ```

4. **SSE Service:**
   ```bash
   cd sse-service
   node index.js
   ```

5. **Worker:**
   ```bash
   cd worker
   node index.js
   ```

## CI/CD

The project uses GitHub Actions for continuous integration. The workflow runs linting, typechecking, and build/compile tasks for all services.
