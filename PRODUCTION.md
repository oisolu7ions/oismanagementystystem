# OIS Command Center — Production Setup

This guide explains how to deploy and run **OIS Command Center** in production.

For local development, see [README.md](./README.md).

---

## Overview

| Item | Detail |
|------|--------|
| App | Next.js 16 (App Router) + TypeScript |
| Database | PostgreSQL via Prisma |
| Auth | Credential login with JWT session cookie (`ois_session`) |
| File storage | Uploaded documents saved to `uploads/documents/` on disk |

### Hosting requirement

This app stores uploaded documents on the **local filesystem**. Use a server with a **persistent disk** (VPS, dedicated server, or a container with a mounted volume).

Serverless platforms (for example Vercel) are **not suitable** unless you replace local file storage with object storage (S3, R2, etc.).

---

## Prerequisites

### Server

- Linux VPS or dedicated server (Ubuntu 22.04+ recommended)
- Public domain or internal hostname
- HTTPS (required — session cookies are `secure` in production)

### Software

| Tool | Version |
|------|---------|
| Node.js | **20.19+**, 22.12+, or 24+ (required by Prisma 7) |
| npm | 10+ |
| PostgreSQL | 14+ |
| Reverse proxy | Nginx or Caddy (recommended) |
| Process manager | systemd, PM2, or similar |

Check Node version:

```bash
node -v
```

If needed, install with nvm:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20.20.0
nvm use 20.20.0
```

---

## 1. Clone and install

```bash
git clone <your-repo-url> /var/www/ois-command-center
cd /var/www/ois-command-center
npm ci
```

`npm ci` installs exact versions from `package-lock.json` and runs `prisma generate` via `postinstall`.

---

## 2. Environment variables

Create a production env file on the server. Do **not** commit secrets to git.

```bash
cp .env.example .env
```

Edit `.env`:

```env
# PostgreSQL — use your production host, user, password, and database name
DATABASE_URL="postgresql://ois_app:STRONG_DB_PASSWORD@db-host:5432/ois_command_center?schema=public"

# Generate a long random secret (at least 32 characters)
# Example: openssl rand -base64 48
SESSION_SECRET="replace-with-a-long-random-production-secret"

# Initial admin account (used by seed)
ADMIN_EMAIL="admin@yourcompany.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
ADMIN_NAME="OIS Admin"

# Required for production runtime
NODE_ENV="production"
```

### Generate secrets

```bash
# Session secret
openssl rand -base64 48

# Strong admin password
openssl rand -base64 24
```

### Variable reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Standard PostgreSQL URL over TCP. Not `prisma+postgres://`. |
| `SESSION_SECRET` | Yes | JWT signing secret. Minimum 32 characters. |
| `ADMIN_EMAIL` | Yes (first deploy) | Email for the seeded admin user. |
| `ADMIN_PASSWORD` | Yes (first deploy) | Password for the seeded admin user. Change from dev defaults. |
| `ADMIN_NAME` | No | Display name for the admin user. |
| `NODE_ENV` | Yes | Must be `production` in production. |

---

## 3. PostgreSQL setup

### Create database and user

On your PostgreSQL server:

```sql
CREATE USER ois_app WITH PASSWORD 'STRONG_DB_PASSWORD';
CREATE DATABASE ois_command_center OWNER ois_app;
GRANT ALL PRIVILEGES ON DATABASE ois_command_center TO ois_app;
```

Verify connectivity from the app server:

```bash
psql "postgresql://ois_app:STRONG_DB_PASSWORD@db-host:5432/ois_command_center" -c "SELECT 1"
```

### Apply schema

**First deploy on an empty database**

If `prisma migrate deploy` fails because of migration ordering on a brand-new database, sync the schema directly:

```bash
npx prisma db push
```

**Ongoing production deploys**

Once the database is initialized, prefer migration deploy:

```bash
npx prisma migrate deploy
```

Check status:

```bash
npx prisma migrate status
```

### Seed admin and default data

Run once after the schema is in place:

```bash
npm run db:seed
```

Expected output:

```text
Admin user ready: admin@yourcompany.com
Seeded 4 OIS packages
```

Re-running seed updates the admin password hash if `ADMIN_PASSWORD` changes.

---

## 4. Document uploads directory

Uploaded files are stored at:

```text
/var/www/ois-command-center/uploads/documents/
```

Create the directory and ensure the app user can write to it:

```bash
mkdir -p uploads/documents
chown -R <app-user>:<app-group> uploads
chmod 750 uploads uploads/documents
```

Back up this directory with your database. Uploaded files are **not** stored in PostgreSQL.

---

## 5. Build the app

```bash
npm run build
```

This runs:

1. `prisma generate`
2. `next build`

Fix any build errors before continuing.

---

## 6. Run in production

### Quick test (foreground)

```bash
npm run start
```

Default port: **3000**

Open `http://your-server:3000` to verify before putting a reverse proxy in front.

### Recommended: systemd service

Create `/etc/systemd/system/ois-command-center.service`:

```ini
[Unit]
Description=OIS Command Center
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ois-command-center
Environment=NODE_ENV=production
EnvironmentFile=/var/www/ois-command-center/.env
ExecStart=/home/<user>/.nvm/versions/node/v20.20.0/bin/npm run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Use the real path to `npm`/`node` on your server (`which node`).

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ois-command-center
sudo systemctl start ois-command-center
sudo systemctl status ois-command-center
```

View logs:

```bash
journalctl -u ois-command-center -f
```

---

## 7. Reverse proxy (Nginx + HTTPS)

Run the Next.js app on localhost and expose it through Nginx with TLS.

Example `/etc/nginx/sites-available/ois-command-center`:

```nginx
server {
    listen 80;
    server_name ois.yourcompany.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ois.yourcompany.com;

    ssl_certificate     /etc/letsencrypt/live/ois.yourcompany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ois.yourcompany.com/privkey.pem;

    client_max_body_size 12M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable the site and obtain a certificate (Certbot example):

```bash
sudo ln -s /etc/nginx/sites-available/ois-command-center /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d ois.yourcompany.com
```

`client_max_body_size 12M` allows document uploads up to the app limit of 10 MB.

---

## 8. Production checklist

Before going live:

- [ ] `NODE_ENV=production` is set
- [ ] `SESSION_SECRET` is a unique random value (32+ chars)
- [ ] `ADMIN_PASSWORD` is strong and not the dev default
- [ ] PostgreSQL uses a dedicated app user with limited privileges
- [ ] HTTPS is enabled (session cookies require it in production)
- [ ] `uploads/documents/` exists and is writable
- [ ] Firewall allows only 80/443 publicly; app port 3000 is internal
- [ ] Database and uploads directory backup strategy is in place
- [ ] `.env` is not committed to git

---

## 9. Deploying updates

On the server:

```bash
cd /var/www/ois-command-center
git pull
npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart ois-command-center
```

If a migration fails, check `npx prisma migrate status` before restarting.

---

## 10. Backups

Back up both:

1. **PostgreSQL database**

```bash
pg_dump "postgresql://ois_app:PASSWORD@db-host:5432/ois_command_center" > backup-$(date +%F).sql
```

2. **Uploaded documents**

```bash
tar -czf uploads-backup-$(date +%F).tar.gz uploads/
```

Restore the database before restoring files, or ensure document records and files stay in sync.

---

## 11. Verify production

| Step | Expected result |
|------|-----------------|
| Visit `https://your-domain/` | Redirects to `/login` |
| Sign in with seeded admin | Lands on `/dashboard` |
| Sign out | Returns to login; `/dashboard` redirects when logged out |
| Upload a document | File appears in list and opens from detail page |
| Restart app service | Uploaded files still accessible |

---

## 12. Troubleshooting

### App fails to start: `SESSION_SECRET must be set`

- Ensure `.env` contains `SESSION_SECRET` with at least 32 characters
- Confirm systemd `EnvironmentFile` points to the correct `.env`

### `P1000: Authentication failed`

- Verify `DATABASE_URL` username, password, host, and port
- Confirm PostgreSQL accepts TCP connections from the app server
- Test with `psql` using the same URL

### Login works in dev but not production

- HTTPS must be enabled (`secure` cookies are on in production)
- Re-run `npm run db:seed` if the admin user was never created
- Confirm `ADMIN_EMAIL` / `ADMIN_PASSWORD` match what you are using

### Document upload fails

- Check `uploads/documents/` exists and is writable
- Confirm reverse proxy `client_max_body_size` is at least 12M
- App limit is 10 MB per file

### `Prisma only supports Node.js versions 20.19+`

Upgrade Node on the server:

```bash
nvm install 20.20.0
nvm alias default 20.20.0
```

### Migration errors on first deploy

On a fresh database, use:

```bash
npx prisma db push
npm run db:seed
```

Then investigate migration status before relying on `migrate deploy` for future releases.

---

## 13. Useful commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx prisma migrate deploy` | Apply pending migrations (production) |
| `npx prisma migrate status` | Check migration state |
| `npm run db:seed` | Create/update admin and default packages |
| `npx prisma studio` | Browse database (run only on secure/admin access) |

---

## 14. Architecture summary

```text
Internet
   │
   ▼
[Nginx / Caddy]  ── HTTPS ──►  [Next.js :3000]
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
              PostgreSQL     uploads/documents/   JWT sessions
              (Prisma)       (local disk)       (SESSION_SECRET)
```

For questions about local development, see [README.md](./README.md).
