# OIS Command Center

Internal CRM and project management dashboard for **OIS Technology** — leads, clients, projects, tasks, invoices, follow-ups, and client activity.

Built in phases. **Phase 1** (current): foundation, auth, database schema, dashboard shell.

## Tech stack

- Next.js (App Router), TypeScript, Tailwind CSS
- Prisma ORM + PostgreSQL
- Credential-based admin login (JWT session cookie)

## Prerequisites

- Node.js 20+
- PostgreSQL (running locally or remote)

---

## Run locally (see and test)

### 1. Open the project

```bash
cd /home/powolabi/Desktop/ois_management_system
```

Use your actual path if the project lives elsewhere.

### 2. Install dependencies (once)

```bash
npm install
```

### 3. Configure environment variables

Copy the example file if you do not have a `.env` yet:

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Standard PostgreSQL URL — **not** a `prisma+postgres://` URL |
| `SESSION_SECRET` | Random string, at least 32 characters |
| `ADMIN_EMAIL` | Email for the seeded admin user |
| `ADMIN_PASSWORD` | Password for the seeded admin user |
| `ADMIN_NAME` | Display name for the admin user |

Example `DATABASE_URL` (replace user and password with yours):

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ois_command_center?schema=public"
SESSION_SECRET="dev-secret-change-before-production-min-32-chars"
ADMIN_EMAIL="admin@ois.tech"
ADMIN_PASSWORD="changeme123"
ADMIN_NAME="OIS Admin"
```

### 4. Create the database

PostgreSQL must be running. Create the database if it does not exist:

```bash
createdb ois_command_center
```

Or in `psql`:

```sql
CREATE DATABASE ois_command_center;
```

### 5. Apply schema and seed admin

```bash
npm run db:migrate
```

When prompted for a migration name, use `init`.

**If you see “Drift detected” or “No migration found”** after using `db push` earlier, the repo includes a baseline migration (`20260528000000_init`). Mark it as applied once (keeps your data):

```bash
npx prisma migrate resolve --applied 20260528000000_init
npx prisma migrate status
```

You should see: `Database schema is up to date!`

For a **fresh empty database** only:

```bash
npx prisma migrate dev
npm run db:seed
```

Local-only quick sync (does not update migration history — avoid if you use `migrate dev`):

```bash
npx prisma db push --accept-data-loss
```

```bash
npm run db:seed
```

You should see: `Admin user ready: admin@ois.tech` (or whatever `ADMIN_EMAIL` you set).

### 6. Start the dev server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## What to test (Phase 1)

| Step | Expected result |
|------|-----------------|
| Visit `http://localhost:3000/` | Redirects to `/login` |
| Sign in with seeded credentials | Lands on `/dashboard` |
| Dashboard | Sidebar, header with your name, overview cards and lifecycle list |
| Sidebar | **Dashboard** is active; other items show “Phase N” (not built yet) |
| Sign out | Returns to login; visiting `/dashboard` redirects to login when logged out |

Default login after seed (unless you changed `.env`):

- **Email:** `admin@ois.tech`
- **Password:** `changeme123`

---

## Troubleshooting

### `P1000: Authentication failed` (common on Linux)

This usually means `DATABASE_URL` uses the wrong user or password for **TCP** connections (`localhost:5432`).

On many Linux setups:

- `psql` as your Linux user works **without a password** (peer auth on the Unix socket).
- Prisma connects over **TCP** to `localhost`, which requires a **password**.

Your server has roles `postgres` (superuser) and `powolabi` (can create databases). The default `.env` uses `postgres:postgres`, which is often **not** the real password.

**Fix — set a password for `powolabi` and use it in `.env`:**

```bash
sudo -u postgres psql -c "ALTER USER powolabi WITH PASSWORD 'pick_a_dev_password';"
```

Edit `.env`:

```env
DATABASE_URL="postgresql://powolabi:pick_a_dev_password@localhost:5432/ois_command_center?schema=public"
```

Create the database if needed (peer auth, no password):

```bash
psql -d postgres -c "CREATE DATABASE ois_command_center;"
```

Then migrate and seed:

```bash
npm run db:migrate
npm run db:seed
```

**Alternative — use the `postgres` superuser** (only if you know its TCP password):

```bash
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_postgres_password';"
```

```env
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/ois_command_center?schema=public"
```

**Verify TCP login** (should not prompt if the password is correct):

```bash
psql "postgresql://powolabi:pick_a_dev_password@localhost:5432/ois_command_center" -c "SELECT 1"
```

### Login fails after seed

- Confirm `npm run db:seed` completed without errors.
- Use the same email/password as in `.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).
- Email is stored lowercase; use the exact address from seed output.

### `SESSION_SECRET` errors

Ensure `SESSION_SECRET` in `.env` is at least 32 characters, then restart `npm run dev`.

### Production build check

```bash
npm run build
npm run start
```

Then open [http://localhost:3000](http://localhost:3000) (uses the production build).

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Generate Prisma client and production build |
| `npm run start` | Run production server (after `build`) |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate dev`) |
| `npm run db:seed` | Create or update admin user |
| `npm run db:studio` | Prisma Studio (browse data, usually port 5555) |

**Prisma migration command** (same as `npm run db:migrate`):

```bash
npx prisma migrate dev
```

---

## Roadmap (phases)

| Phase | Scope |
|-------|--------|
| **1** | Auth, schema, dashboard shell |
| 2 | Leads & clients CRUD |
| 3 | Projects & tasks |
| 4 | Invoices & follow-ups |
| 5 | Packages, notes, activity |

---

## Project structure

```
src/
  app/              # Routes (login, dashboard)
  actions/          # Server actions
  components/       # UI + layout
  config/           # Navigation, app config
  lib/              # Prisma, auth, validators
  types/            # Shared TypeScript types
prisma/
  schema.prisma     # Domain models
  seed.ts           # Admin seed
```
