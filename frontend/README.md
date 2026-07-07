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

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |

## Documentation

- [Milestone 1 plan](../docs/MILESTONE-1-IMPLEMENTATION-PLAN.md)
- [Design tokens](./docs/DESIGN-TOKENS.md)
