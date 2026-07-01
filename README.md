# OIS Management Center

Internal CRM and project management platform for **OIS Technology** — leads, clients, projects, tasks, invoices, follow-ups, documents, activity history, a client portal, and client update requests.

**Current status:** Phases **1–16** are live. Admin dashboard and client portal are fully functional. **Automation** and **AI assistant** are planned next — not built yet.

## Tech stack

- **Next.js 16** (App Router), TypeScript, Tailwind CSS
- **Prisma 7** + PostgreSQL
- **Admin auth:** credential login with JWT session cookie (`ois_session`)
- **Client portal auth:** separate JWT session cookie (`ois_client_session`) for `ClientUser` accounts
- **File storage:** local disk (`uploads/documents/`, `uploads/update-requests/`) — see [PRODUCTION.md](./PRODUCTION.md)

---

## What's built (modules)

| Module | Admin route | Description |
|--------|-------------|-------------|
| **Dashboard** | `/dashboard` | Real metrics, recent activity, module overview |
| **Packages** | `/dashboard/packages` | Service tiers, pricing, features |
| **Leads** | `/dashboard/leads` | Sales pipeline, sources, status |
| **Clients** | `/dashboard/clients` | Active relationships, packages, lead conversion |
| **Projects** | `/dashboard/projects` | Client work, status, service type, website checklist |
| **Tasks** | `/dashboard/tasks` | Prioritized project work, assignees |
| **Invoices** | `/dashboard/invoices` | Billing, due dates, payment links, recurring flags |
| **Receipts** | (via invoices) | PDF receipts per billing period — see [RECURRING_RECEIPTS.md](./RECURRING_RECEIPTS.md) |
| **Follow-ups** | `/dashboard/follow-ups` | Manual reminders for leads and clients |
| **Notes** | (on records) | Internal notes — **not exposed to clients** |
| **Documents** | `/dashboard/documents` | File uploads + external links |
| **Activity** | `/dashboard/activity` | Unified timeline across the client lifecycle |
| **Update Requests** | `/dashboard/update-requests` | Client change requests — review, status, pricing, tasks |
| **Client Portal** | `/client/login` | Read-only portal for client users |

### Client portal (`/client/*`)

Clients with portal accounts can:

- View **projects, tasks, invoices, documents** shared by OIS (visibility-controlled)
- Read **project updates** (safe activity messages only)
- Submit **update requests** with file uploads and external links
- Manage their **account** profile

Portal users are created by admins on each **Client detail** page under **Client Portal Controls**.

### Client visibility controls (Phase 15)

Admins control what each client sees. Internal records are **hidden by default** unless marked client-visible:

| Record | Default visibility | Client-facing fields |
|--------|-------------------|----------------------|
| Project | Hidden | `clientSummary`, `clientStatusNote` |
| Task | Hidden | `clientNote` |
| Invoice | Visible | `clientNote` |
| Document | Hidden | `clientDescription` |
| Activity | Hidden | `clientMessage` (safe update text) |
| Notes | Internal only | Never shown to clients |

All client portal queries filter by `clientId` + `clientVisible` server-side.

### Update requests (Phase 16)

Clients submit requests for website, portal, dashboard, automation, or general support changes. Admins can:

- Search and filter all requests
- Update status through the full workflow (Submitted → Under Review → … → Completed)
- Add internal notes and client-visible responses
- Set estimated/approved pricing and due dates
- Attach files or links
- **Create a task from a request** (when linked to a project)

---

## Prerequisites

- Node.js **20.19+** (required by Prisma 7)
- PostgreSQL 14+ (local or remote)

---

## Run locally

### 1. Clone and install

```bash
git clone https://github.com/oisolu7ions/oismanagementystystem.git
cd oismanagementystystem
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL URL — **not** a `prisma+postgres://` URL |
| `SESSION_SECRET` | Random string, at least 32 characters (signs both admin and client JWTs) |
| `ADMIN_EMAIL` | Email for the seeded admin user |
| `ADMIN_PASSWORD` | Password for the seeded admin user |
| `ADMIN_NAME` | Display name for the admin user |

Example:

```env
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/ois_command_center?schema=public"
SESSION_SECRET="dev-secret-change-before-production-min-32-chars"
ADMIN_EMAIL="admin@ois.tech"
ADMIN_PASSWORD="changeme123"
ADMIN_NAME="OIS Admin"
```

### 3. Create the database

```bash
createdb ois_command_center
```

Or in `psql`:

```sql
CREATE DATABASE ois_command_center;
```

### 4. Apply schema and seed

**Recommended (migration history):**

```bash
npm run db:migrate
npm run db:seed
```

**Quick local sync** (after pulling schema changes — e.g. Phases 15–16):

```bash
npx prisma db push --accept-data-loss
npx prisma generate
npm run db:seed
```

You should see: `Admin user ready: admin@ois.tech` (or your `ADMIN_EMAIL`).

### 5. Start the dev server

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)**.

| URL | Purpose |
|-----|---------|
| `/login` | Admin login → `/dashboard` |
| `/client/login` | Client portal login → `/client/dashboard` |

**Default admin** (after seed):

- Email: `admin@ois.tech`
- Password: `changeme123`

Client portal users are created per client in the admin dashboard — there is no seeded client login.

---

## Testing checklist

### Admin dashboard

| Step | Expected |
|------|----------|
| Sign in at `/login` | Lands on `/dashboard` with metrics |
| Create a lead → convert to client | Client record linked to lead |
| Create project, tasks, invoice, document | Records appear in lists and detail pages |
| Mark project/task/document client-visible | Sharing fields saved on edit/detail |
| View `/dashboard/activity` | Activity logged for create/update events |
| Create update request (admin or via client) | Appears in `/dashboard/update-requests` |

### Client portal

| Step | Expected |
|------|----------|
| Create portal user on client detail page | User can sign in at `/client/login` |
| Hidden project | Not visible in client portal |
| Mark project visible + add client summary | Project appears at `/client/projects` |
| Submit update request with attachment | Request visible to client and admin |
| Visit hidden record URL as client | 404 (server-side block) |
| Visit `/dashboard` as client | Redirected/blocked by middleware |

---

## Troubleshooting

### `P1000: Authentication failed`

Prisma uses TCP (`localhost:5432`) and needs a password. See [README troubleshooting](#fix--set-a-password-for-your-postgres-user) below or run:

```bash
npm run db:setup-auth
```

#### Fix — set a password for your Postgres user

```bash
sudo -u postgres psql -c "ALTER USER powolabi WITH PASSWORD 'pick_a_dev_password';"
```

```env
DATABASE_URL="postgresql://powolabi:pick_a_dev_password@localhost:5432/ois_command_center?schema=public"
```

```bash
psql -d postgres -c "CREATE DATABASE ois_command_center;"
npm run db:migrate
npm run db:seed
```

**Verify TCP login:**

```bash
psql "postgresql://powolabi:pick_a_dev_password@localhost:5432/ois_command_center" -c "SELECT 1"
```

### Schema out of date after `git pull`

```bash
npx prisma db push --accept-data-loss
npx prisma generate
npm run dev
```

### Login fails after seed

- Confirm `npm run db:seed` completed without errors
- Use the same email/password as in `.env`
- Restart `npm run dev` after changing `.env`

### `SESSION_SECRET` errors

Ensure `SESSION_SECRET` is at least 32 characters, then restart the dev server.

### Production build

```bash
npm run build
npm run start
```

For deployment, see **[PRODUCTION.md](./PRODUCTION.md)**.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Generate Prisma client + production build |
| `npm run start` | Run production server (after `build`) |
| `npm run db:migrate` | Apply Prisma migrations (`prisma migrate dev`) |
| `npm run db:seed` | Create or update admin user |
| `npm run db:studio` | Prisma Studio (browse data) |
| `npm run db:setup-auth` | Helper script for local Postgres password setup |

---

## Phase roadmap

| Phase | Scope | Status |
|-------|--------|--------|
| 1 | Auth, schema, dashboard shell | ✅ Live |
| 2 | Packages | ✅ Live |
| 3 | Leads | ✅ Live |
| 4 | Clients + lead conversion | ✅ Live |
| 5–6 | Projects | ✅ Live |
| 7 | Tasks | ✅ Live |
| 8 | Invoices | ✅ Live |
| 9 | Follow-ups | ✅ Live |
| 10 | Notes (internal) | ✅ Live |
| 11 | Documents (files + links) | ✅ Live |
| 12 | Dashboard metrics | ✅ Live |
| 13 | Activity timeline | ✅ Live |
| 14 | Client portal MVP | ✅ Live |
| 15 | Client portal visibility controls | ✅ Live |
| 16 | Client update requests | ✅ Live |
| 17 | Automation hooks | 🔜 Next |
| — | AI assistant | Planned |

Related docs:

- [PRODUCTION.md](./PRODUCTION.md) — deployment, HTTPS, uploads, systemd
- [RECURRING_RECEIPTS.md](./RECURRING_RECEIPTS.md) — recurring invoice receipt cron (not automated yet)

---

## Project structure

```
src/
  app/
    login/                    # Admin login
    dashboard/                # Admin CRM (all modules)
    client/
      login/                  # Client portal login
      (portal)/               # Client-facing pages
    api/
      documents/              # Admin document file serving
      receipts/               # Receipt PDF serving
      client/                 # Client-authenticated APIs
      update-requests/        # Admin attachment file serving
  actions/                    # Server actions (CRUD, auth, mutations)
  components/                 # UI by domain (clients, projects, client-portal, …)
  config/navigation.ts        # Admin sidebar
  lib/
    auth/                     # Admin + client session helpers
    activity/                 # Activity logging
    client-portal/            # Portal queries + visibility filters
    update-requests/          # Update request constants + file storage
    validators/               # Zod schemas
  types/
prisma/
  schema.prisma               # Full domain schema
  seed.ts                     # Admin seed
uploads/
  documents/                  # Uploaded document files
  update-requests/            # Update request attachments
```

---

## Security notes

- Admin routes (`/dashboard/*`, admin APIs) require `ois_session`
- Client routes (`/client/*`, `/api/client/*`) require `ois_client_session`
- Client users cannot access admin routes; admins and clients use separate cookies
- Client portal data is filtered server-side — never rely on UI hiding alone
- Internal notes and raw activity messages are not exposed to clients by default
