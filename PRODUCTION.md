# OIS Management Center Production Runbook

This document explains how to run **OIS Management Center** in production.

The app is a Next.js 16 App Router application with Prisma/PostgreSQL, server actions, credential login, client portal login codes, email verification, and local uploaded-file storage.

## Important Deployment Notes

- Use a real HTTPS domain in production. Auth cookies and email links depend on it.
- Use PostgreSQL over TCP for production. Do not use the local Unix socket URL that may work on your laptop.
- Use `npx prisma migrate deploy` in production. Do not use `prisma db push` for production deploys.
- This app stores uploads on disk under `uploads/`. Use persistent storage or replace local file storage with object storage before using serverless/ephemeral hosting.
- Keep `.env` private. Never commit real secrets.

## Production Architecture

```text
Internet
  |
  v
HTTPS reverse proxy or platform router
  |
  v
Next.js app, npm run start
  |
  +-- PostgreSQL database
  +-- uploads/documents
  +-- uploads/update-requests
  +-- uploads/receipts
```

## Supported Hosting Shape

Recommended:

- Ubuntu VPS or dedicated server
- Node.js process managed by systemd or PM2
- Nginx or Caddy for HTTPS reverse proxy
- PostgreSQL managed database or local PostgreSQL
- Persistent disk for `uploads/`

Also acceptable:

- Render/Railway/Fly.io/container host, if it has persistent volume support for `uploads/`
- Docker, if `uploads/` is mounted as a durable volume

Not recommended without storage changes:

- Static export
- Ephemeral serverless hosting
- Any platform where local disk disappears between deploys/restarts

Next.js production mode for this repo is the standard Node.js server:

```bash
npm run build
npm run start
```

## Prerequisites

Install these on the server:

- Node.js 20.19 or newer
- npm 10 or newer
- PostgreSQL 14 or newer, or a managed PostgreSQL database
- Git
- Nginx or Caddy if self-hosting
- Certbot if using Nginx with Let's Encrypt

Check Node:

```bash
node -v
npm -v
```

If needed, install Node with `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20.20.0
nvm alias default 20.20.0
```

## 1. Clone The App

Example location:

```bash
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
git clone <your-repo-url> /var/www/ois-command-center
cd /var/www/ois-command-center
```

Install dependencies from the lockfile:

```bash
npm ci
```

`npm ci` also runs `prisma generate` through the `postinstall` script.

## 2. Create Production Environment Variables

Create `.env` on the server:

```bash
cp .env.example .env
nano .env
```

Use this production shape:

```env
DATABASE_URL="postgresql://ois_app:STRONG_DB_PASSWORD@db-host:5432/ois_command_center?schema=public"
SESSION_SECRET="replace-with-a-long-random-secret-at-least-32-characters"

ADMIN_EMAIL="admin@your-domain.com"
ADMIN_PASSWORD="replace-with-a-strong-temporary-admin-password"
ADMIN_NAME="OIS Admin"

APP_ENV="production"
APP_URL="https://ois.your-domain.com"
OIS_VALIDATE_PRODUCTION_ENV="true"

EMAIL_PROVIDER="console"
EMAIL_FROM="OIS Management Center <no-reply@your-domain.com>"

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
SMTP_SECURE="false"
```

Generate a strong session secret:

```bash
openssl rand -base64 48
```

Generate a temporary admin password:

```bash
openssl rand -base64 24
```

### Required Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string over TCP |
| `SESSION_SECRET` | Yes | Signs admin and client portal session tokens |
| `APP_ENV` | Yes | Set to `production` for strict checks |
| `APP_URL` | Yes | Public HTTPS app URL used in emails and settings |
| `OIS_VALIDATE_PRODUCTION_ENV` | Recommended | Set `true` to force production env validation |
| `ADMIN_EMAIL` | First seed | Admin account email created/updated by seed |
| `ADMIN_PASSWORD` | First seed | Admin password created/updated by seed |
| `ADMIN_NAME` | First seed | Admin display name |
| `SMTP_HOST` | If SMTP enabled | SMTP host |
| `SMTP_PORT` | If SMTP enabled | SMTP port |
| `SMTP_USER` | If SMTP enabled | SMTP username |
| `SMTP_PASS` | If SMTP enabled | SMTP password or app password |
| `SMTP_SECURE` | If SMTP enabled | `false` for STARTTLS on 587, `true` for implicit TLS |

### SMTP Notes

The dashboard settings store non-secret email configuration, but SMTP secrets stay in `.env`.

For Gmail SMTP, a common setup is:

```env
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-google-app-password"
SMTP_SECURE="false"
```

After deployment, test email from `/dashboard/settings`.

## 3. Create The PostgreSQL Database

On the database server:

```sql
CREATE USER ois_app WITH PASSWORD 'STRONG_DB_PASSWORD';
CREATE DATABASE ois_command_center OWNER ois_app;
GRANT ALL PRIVILEGES ON DATABASE ois_command_center TO ois_app;
```

If your PostgreSQL version requires schema privileges explicitly:

```sql
\c ois_command_center
GRANT ALL ON SCHEMA public TO ois_app;
```

From the app server, verify connectivity:

```bash
psql "postgresql://ois_app:STRONG_DB_PASSWORD@db-host:5432/ois_command_center?schema=public" -c "SELECT 1"
```

## 4. Verify Migration History Before Deploying

Before running migrations:

```bash
npx prisma validate
npx prisma migrate status
```

Expected clean result:

```text
Database schema is up to date!
```

If this reports pending old migrations that would create tables already present, stop and clean migration history before deploying.

The init migration should be first:

```text
prisma/migrations/20260525000000_init
```

Do not reintroduce the older duplicate path:

```text
prisma/migrations/20260528000000_init
```

## 5. Apply Production Migrations

For production and staging:

```bash
npx prisma migrate deploy
```

Do not use these in production:

```bash
npx prisma migrate dev
npx prisma db push
```

Use `migrate dev` only for local development. Use `db push` only for temporary local experiments.

## 6. Seed Admin And Default Data

Run after the database schema exists:

```bash
npm run db:seed
```

The seed uses these `.env` values:

```env
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_NAME
```

Re-running the seed can update the admin password hash if `ADMIN_PASSWORD` changes.

After first login, store the admin password in a password manager and rotate it if needed.

## 7. Prepare Persistent Upload Storage

The app writes files under:

```text
uploads/documents
uploads/update-requests
uploads/receipts
```

Create the directories:

```bash
mkdir -p uploads/documents uploads/update-requests uploads/receipts
```

Set ownership to the app user:

```bash
sudo chown -R www-data:www-data uploads
sudo chmod -R 750 uploads
```

If you run the app as a different user, replace `www-data:www-data`.

Upload limits:

- Document uploads: 10 MB per file
- Update request uploads: 10 MB per file
- Next server action body limit: 10 MB
- Reverse proxy should allow slightly more, for example 12 MB

Back up `uploads/` together with the database.

## 8. Build The App

From the app directory:

```bash
npm run build
```

This runs:

```bash
prisma generate
next build
```

Fix any build errors before continuing.

## 9. Run A Foreground Smoke Test

Start the production server:

```bash
npm run start
```

Default port:

```text
3000
```

If you need a different port:

```bash
PORT=3001 npm run start
```

In another terminal:

```bash
curl -I http://127.0.0.1:3000
```

Stop the foreground process after the smoke test.

## 10. Run With systemd

Find the absolute `npm` path:

```bash
which npm
```

Create a service:

```bash
sudo nano /etc/systemd/system/ois-command-center.service
```

Example:

```ini
[Unit]
Description=OIS Management Center
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/ois-command-center
Environment=NODE_ENV=production
EnvironmentFile=/var/www/ois-command-center/.env
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

If `which npm` returns an `nvm` path, use that exact path in `ExecStart`.

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

Restart after deploys:

```bash
sudo systemctl restart ois-command-center
```

## 11. Configure HTTPS Reverse Proxy

### Nginx Example

Create:

```bash
sudo nano /etc/nginx/sites-available/ois-command-center
```

Config:

```nginx
server {
    listen 80;
    server_name ois.your-domain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ois.your-domain.com;

    ssl_certificate     /etc/letsencrypt/live/ois.your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ois.your-domain.com/privkey.pem;

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
        proxy_buffering off;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/ois-command-center /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Issue a certificate:

```bash
sudo certbot --nginx -d ois.your-domain.com
```

Firewall recommendation:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

Keep port `3000` private. Expose only 80 and 443 publicly.

### Caddy Alternative

Example `Caddyfile`:

```caddyfile
ois.your-domain.com {
    request_body {
        max_size 12MB
    }
    reverse_proxy 127.0.0.1:3000
}
```

Caddy handles HTTPS automatically.

## 12. First Production Verification

Use a real HTTPS domain, not localhost.

Check public pages:

- `https://ois.your-domain.com/contact`
- `https://ois.your-domain.com/legal/privacy`
- `https://ois.your-domain.com/legal/terms`
- `https://ois.your-domain.com/legal/security`
- `https://ois.your-domain.com/legal/accessibility`

Check admin:

- Visit `/login`
- Sign in with seeded admin
- Open `/dashboard`
- Create a test client
- Create a test project
- Upload a document
- Open the uploaded document
- Create an invoice
- Create a task
- Log out
- Confirm `/dashboard` redirects when logged out

Check client portal:

- Create or enable a client portal user
- Send verification email
- Verify email link
- Request client login code
- Confirm login code email is delivered
- Submit a client update request
- Upload an allowed file
- Try a blocked file type and confirm rejection
- Confirm logout works

Check system settings:

- Open `/dashboard/settings`
- Confirm `APP_URL` shows the HTTPS production URL
- Confirm SMTP configured status is correct
- Send a test email if SMTP is enabled

## 13. Staging First

Before production, deploy the same code to staging:

- Separate staging database
- Separate staging `.env`
- Separate staging domain with HTTPS
- Separate upload storage
- SMTP set to a safe test recipient, or console mode

Run this checklist on staging:

- Admin login
- Client login code flow
- Email verification
- File uploads
- Legal pages
- Dashboard
- Client portal
- Update request submission confirmation
- Mobile viewport check

Promote to production only after staging passes.

## 14. Deploying Updates

On the server:

```bash
cd /var/www/ois-command-center
git pull
npm ci
npx prisma migrate deploy
npm run build
sudo systemctl restart ois-command-center
```

Then verify:

```bash
npx prisma migrate status
sudo systemctl status ois-command-center
curl -I https://ois.your-domain.com
```

If migrations fail, do not continue to restart blindly. Check:

```bash
npx prisma migrate status
journalctl -u ois-command-center -n 100
```

## 15. Backups

Back up both database and uploads.

Database:

```bash
pg_dump "postgresql://ois_app:STRONG_DB_PASSWORD@db-host:5432/ois_command_center?schema=public" > ois-db-$(date +%F).sql
```

Uploads:

```bash
tar -czf ois-uploads-$(date +%F).tar.gz uploads/
```

Recommended backup policy:

- Daily database backup
- Daily upload backup
- Store backups off-server
- Test restore monthly
- Encrypt backups if they contain client documents

Restore order:

1. Restore database.
2. Restore `uploads/`.
3. Start app.
4. Verify uploaded files open from the dashboard/client portal.

## 16. Production Security Checklist

Before launch:

- `.env` exists on the server and is not committed
- `APP_ENV=production`
- `OIS_VALIDATE_PRODUCTION_ENV=true`
- `APP_URL` is the real HTTPS domain
- `SESSION_SECRET` is unique and at least 32 characters
- `ADMIN_PASSWORD` is strong and not the default
- PostgreSQL user is dedicated to this app
- Database accepts connections only from trusted hosts
- HTTPS is enabled
- App port is not public
- Upload directories are persistent and backed up
- SMTP uses an app password or provider token, not a personal password
- Staging checklist passed
- Admin 2FA is planned before handling sensitive production client data at scale

## 17. Troubleshooting

### `DATABASE_URL is not set`

- Confirm `.env` exists in the project root, not inside `src/`
- Confirm systemd `EnvironmentFile` points to the right file
- Restart the app after editing `.env`

### `Authentication failed against the database server`

- The database username/password in `DATABASE_URL` is wrong
- Test with `psql` using the exact same URL
- In production, use a TCP database URL with a password

### `No space left on device`

Check disk:

```bash
df -h
du -sh .next node_modules uploads
```

Safe cleanup targets:

```bash
rm -rf .next
npm run build
```

Do not delete `uploads/` unless you have a backup and intend to remove uploaded files.

### Login fails in production but works locally

- Confirm HTTPS is working
- Confirm `APP_URL` uses `https://`
- Confirm `SESSION_SECRET` is present
- Confirm database migrations ran
- Re-run seed if the admin account was never created

### Email verification or login code emails do not arrive

- Check `/dashboard/settings`
- Confirm email provider mode
- Confirm SMTP env vars are set
- Check app logs for SMTP errors
- For Gmail, use an app password and `SMTP_SECURE=false` on port 587

### File uploads fail

- Confirm Nginx/Caddy allows at least `12M`
- Confirm `uploads/` exists
- Confirm app user can write to `uploads/`
- Confirm file type is allowed
- Confirm file is 10 MB or smaller

### `prisma migrate status` shows old init pending

Do not run `prisma migrate dev`.

The clean migration folder should include:

```text
20260525000000_init
```

It should not include the duplicate restored path:

```text
20260528000000_init
```

Clean the duplicate migration folder and run:

```bash
npx prisma migrate status
```

Expected:

```text
Database schema is up to date!
```

### App will not start under systemd

Check logs:

```bash
journalctl -u ois-command-center -n 100
```

Common causes:

- Wrong `WorkingDirectory`
- Wrong `ExecStart` path
- `.env` missing or unreadable
- Upload directory not writable
- Database URL invalid

## 18. Useful Commands

| Command | Purpose |
| --- | --- |
| `npm ci` | Install exact dependencies |
| `npm run build` | Build production app |
| `npm run start` | Run production server |
| `npx prisma validate` | Validate Prisma schema |
| `npx prisma migrate status` | Check migration state |
| `npx prisma migrate deploy` | Apply production migrations |
| `npm run db:seed` | Create/update admin and default packages |
| `journalctl -u ois-command-center -f` | Follow app logs |
| `sudo systemctl restart ois-command-center` | Restart production service |

## 19. Minimal Happy Path

For a fresh VPS after PostgreSQL and HTTPS are ready:

```bash
cd /var/www/ois-command-center
npm ci
cp .env.example .env
nano .env
npx prisma validate
npx prisma migrate deploy
npm run db:seed
mkdir -p uploads/documents uploads/update-requests uploads/receipts
sudo chown -R www-data:www-data uploads
npm run build
sudo systemctl restart ois-command-center
```

Then open:

```text
https://ois.your-domain.com
```

For local development instructions, see [README.md](./README.md).
