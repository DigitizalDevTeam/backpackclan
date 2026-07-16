# Backpackclan — Adventure Travel Portal

Full-stack travel booking platform for curated Himalayan group trips, bike tours, and treks. Built for the Indian adventure travel market (reference: WanderOn, JustWravel).

## Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| **Backend** | Laravel 13, PHP 8.3+, Sanctum API |
| **Database** | MySQL (production) / SQLite (dev) |
| **Payments** | Stripe + Razorpay |

## Project structure

```
backpackclan/
├── backend/     # Laravel API + admin CMS data
├── frontend/    # Public site, customer portal, admin panel (BFF)
└── docs/        # Implementation plans
```

## Quick start (Laragon / local)

### Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

Set in `backend/.env`:

```env
APP_URL=http://backpackclan.test/backend
FRONTEND_URL=http://localhost:3000
```

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Set in `frontend/.env.local`:

```env
USE_LARAVEL_API=true
LARAVEL_API_URL=http://backpackclan.test/backend/public/api
```

### URLs

| App | URL |
|-----|-----|
| Public site + admin | http://localhost:3000 |
| Admin panel | http://localhost:3000/admin |
| Customer account | http://localhost:3000/account |

## Demo accounts (after seed)

| Email                  | Password | Role        |
|------------------------|----------|-------------|
| admin@backpackclan.com | password | Super Admin |
| customer@demo.com      | password | Customer    |

## Features

### Public site
- Dynamic homepage (12 CMS sections)
- Trips, destinations, blog
- Lead forms (contact, callback, custom trip, corporate, partner, careers)
- Customer registration, login, booking checkout, payments

### Customer portal
- Bookings, documents, invoice/voucher download
- Profile edit, password change, booking cancellation (unpaid)
- Password reset flow

### Admin panel
- Full CMS: homepage, banners, blog, media, menus, SEO
- Travel ops: trips, destinations, departures, pricing, coupons
- Bookings CRM, leads, users, roles (RBAC), settings
- Trip policies: cancellation, refund, things to carry, max altitude
- Third-party integrations: WhatsApp widget, Google Tag Manager, Tawk.to live chat

## Scheduler (production)

Unpaid bookings auto-expire after 30 minutes (configurable):

```bash
# Add to server cron
* * * * * cd /path/to/backend && php artisan schedule:run >> /dev/null 2>&1
```

## Tests

```bash
cd backend
php artisan test
```

## Documentation

- [Frontend README](./frontend/README.md)
- [Milestone 1 plan](./docs/MILESTONE-1-IMPLEMENTATION-PLAN.md)
- [Milestone 2 plan](./docs/MILESTONE-2-IMPLEMENTATION-PLAN.md)
- [Milestone 4 plan](./docs/MILESTONE-4-IMPLEMENTATION-PLAN.md)

## Implementation status

| Milestone                                             | Status   |
|-------------------------------------------------------|----------|
| M1 — Admin CMS foundation                             | Complete |
| M2 — Trips, destinations, departures                  | Complete |
| M3 — Bookings, payments, customer portal              | Complete |
| Production polish (SEO, policies, rate limits, tests) | Complete |
| M4 — Integrations (WhatsApp, GTM, live chat)          | Complete |
