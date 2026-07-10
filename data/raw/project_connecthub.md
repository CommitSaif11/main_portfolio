## What it does
ConnectHub is a full-stack social posting platform. Users register, create and manage
posts in a paginated feed, and manage their profile including picture uploads stored on
AWS S3. It's a general-purpose backend engineering showcase rather than an AI project —
demonstrates production-grade API architecture, auth, and infra skills independent of
the AI/GenAI work in the other projects.

## My role
Built solo. Full-stack: async FastAPI backend architecture, auth system, S3 image
pipeline, database migrations, and the React frontend.

## Tech stack
- Backend: FastAPI (fully async), SQLAlchemy 2.0 (async ORM, mapped columns),
  PostgreSQL via asyncpg, Alembic migrations, AWS S3 (profile pictures), Pillow (image
  processing), PyJWT, pwdlib/Argon2 (password hashing), aiosmtplib (async email)
- Frontend: React 19, Vite, React Router, Axios
- Testing: Pytest with moto (mocked S3) and SQLite

## Key results / metrics
- Fully async from HTTP routes down to database queries — no blocking I/O in the
  request path.
- JWT-based stateless auth with configurable expiry.
- Argon2 password hashing (modern, memory-hard — stronger default than bcrypt for
  new projects).
- Email-based password reset flow with hashed, expiring tokens.
- Profile pictures are resized to 200x200 and converted to WebP before S3 upload,
  cutting storage size and bandwidth.
- Ownership-based authorization on every mutating endpoint (users/posts can only be
  edited or deleted by their owner).
- Full Pytest suite with S3 and database mocked out, so tests run without any real
  cloud dependency.

## Interesting decisions / tradeoffs
- **Fully async architecture end-to-end:** chose async SQLAlchemy 2.0 + asyncpg over
  the simpler sync stack specifically to demonstrate handling concurrent I/O-bound
  load correctly, which matters more here than in the AI projects where the LLM call
  itself is usually the bottleneck.
- **Argon2 over bcrypt:** Argon2 is the more modern, memory-hard hashing choice,
  more resistant to GPU-based cracking — a deliberate "do it properly" choice rather
  than the most common default.
- **Image pipeline (resize + WebP conversion) before upload, not after:** saves S3
  storage cost and serves smaller images to the frontend, at the cost of extra
  server-side processing per upload — a bandwidth/cost vs. compute tradeoff.
- **Alembic migrations from day one** rather than letting SQLAlchemy auto-create
  tables, so schema changes are versioned and reproducible — the kind of discipline
  that matters once a project has real users, even though this is a personal project.
- **Mocked-dependency test suite (moto + SQLite)** so the test suite has zero
  external dependency on real AWS credentials or a live Postgres instance, making CI
  straightforward.

## Links
- GitHub: https://github.com/CommitSaif11/ConnectHub