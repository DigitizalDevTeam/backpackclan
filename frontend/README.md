# Backpackclan Admin (Frontend)

Next.js 16 admin panel for the Backpackclan travel portal CMS.

## Prerequisites

- Node.js 20+
- Laravel backend running (see `../backend`) when using API mode

## Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000/admin](http://localhost:3000/admin)

## Environment

| Variable | Description |
|----------|-------------|
| `USE_LARAVEL_API` | `true` = proxy to Laravel; `false` = mock data mode |
| `LARAVEL_API_URL` | Laravel API base, e.g. `http://backpackclan.test/backend/api` |
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | `true` = show demo logins on sign-in page (dev only) |
| `ALLOW_DEMO_PAYMENTS` | `true` = allow demo pay without gateway (must match backend) |

## Demo logins

**Laravel mode** (after `php artisan migrate --seed`):

| Email | Password | Role |
|-------|----------|------|
| admin@backpackclan.com | password | Administrator |
| editor@backpackclan.com | password | Editor |
| viewer@backpackclan.com | password | Viewer |
| customer@demo.com | password | Customer |
| priya@email.com | password123 | Customer |

**Mock mode** (`USE_LARAVEL_API=false`): same emails/passwords; edits persist in `frontend/.mock-data/`.

## Backend setup (Laragon)

```bash
cd ../backend
composer install
cp .env.example .env   # configure DB + APP_URL
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Set in `backend/.env`:

```
APP_URL=http://backpackclan.test/backend
ASSET_URL=http://backpackclan.test/backend/public
```

## Features (Milestone 1)

- Auth, RBAC, users, roles & permissions
- Media library with uploads
- SEO, menus, banners, homepage sections (10 types)
- Global settings, dashboard, homepage preview
- TipTap rich text for CMS content fields
- Forgot password API (reset link logged in Laravel debug mode)

## Production build (low-RAM VPS)

`SIGKILL` during `npm run build` usually means the server ran out of RAM (OOM killer).

**On the server (2 GB RAM or less):**

```bash
cd frontend
npm run build:lowmem
```

**If it still fails**, add swap then rebuild:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
free -h
npm run build:lowmem
```

**Alternative:** build on your local machine or CI, then deploy the `.next` folder and run `npm run start` on the server (no rebuild needed there).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run build:lowmem` | Production build for low-RAM VPS (1.5 GB Node heap cap) |
| `npm run lint` | ESLint |

## Documentation

- [Milestone 1 plan](../docs/MILESTONE-1-IMPLEMENTATION-PLAN.md)
- [Design tokens](./docs/DESIGN-TOKENS.md)
