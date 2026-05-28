#!/usr/bin/env bash
# Sets a TCP password for the powolabi PostgreSQL role (required by Prisma).
# Run once, then: npm run db:migrate && npm run db:seed

set -euo pipefail

DEV_PASSWORD="${1:-ois_dev_local}"

echo "Setting PostgreSQL password for user 'powolabi'..."
sudo -u postgres psql -v ON_ERROR_STOP=1 -c "ALTER USER powolabi WITH PASSWORD '${DEV_PASSWORD}';"

echo ""
echo "Done. Ensure .env contains:"
echo "DATABASE_URL=\"postgresql://powolabi:${DEV_PASSWORD}@localhost:5432/ois_command_center?schema=public\""
echo ""
echo "Next:"
echo "  npm run db:migrate"
echo "  npm run db:seed"
echo "  npm run dev"
