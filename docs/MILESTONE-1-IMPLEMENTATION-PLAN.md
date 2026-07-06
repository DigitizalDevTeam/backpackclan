# Backpackclan Travel Portal — Milestone 1 Implementation Plan

**Stack:** Next.js 16 (App Router) + Laravel 13 + MySQL  
**Focus:** Admin Panel Foundation, CMS Modules, Homepage Structure, Dynamic Content Management  
**Status:** Milestone 1 complete — admin CMS + Laravel API wired  
**Reference sites:** [WanderOn](https://wanderon.in), [JustWravel](https://www.justwravel.com), [Capture A Trip](https://www.captureatrip.com)

---

## 1. Milestone 1 Objectives


| Goal                   | Description                                                            |
| ---------------------- | ---------------------------------------------------------------------- |
| Admin Panel Foundation | Sidebar layout, auth screens, role-aware navigation, reusable UI kit   |
| CMS Foundation         | CRUD screens for all content modules with mock data                    |
| Homepage Structure     | Section-based homepage builder (enable/disable, reorder, edit)         |
| Interactive UX         | Every action gives feedback — toasts, confirmations, validation errors |
| API-ready              | Typed mock services + Laravel schema so M2+ can plug in real APIs      |


**Out of scope for M1:** Trips, bookings, leads, payments, customer portal, public trip listing (Milestones 2–4).

---



## 2. Current Project State

```
backpackclan/
├── backend/          # Laravel 13, MySQL (backpackclan), APP_URL=backpackclan.test/backend
└── frontend/         # Next.js 16, Tailwind 4, React 19 — default starter only
```

**Already done:** Laravel + Next.js scaffolding, database configured.  
**Not started:** Admin routes, auth, CMS modules, shared components, API layer.

---



## 3. Architecture Decisions



### 3.1 Frontend (primary M1 work)


| Decision       | Choice                          | Rationale                                |
| -------------- | ------------------------------- | ---------------------------------------- |
| Router         | Next.js App Router              | Already in place                         |
| Styling        | Tailwind CSS 4                  | Already in place                         |
| UI components  | shadcn/ui + Radix primitives    | Accessible, modern, fast to build        |
| Forms          | React Hook Form + Zod           | Validation + clear error messages        |
| Tables         | TanStack Table                  | Sortable, filterable admin lists         |
| Toasts         | Sonner                          | Success / error / info feedback          |
| Icons          | Lucide React                    | Consistent icon set                      |
| State (M1)     | React Context + local mock JSON | No API dependency for demos              |
| Rich text      | TipTap or React Quill           | Homepage & CMS content blocks            |
| File upload UI | Dropzone component              | Media manager (mock upload)              |
| Drag & drop    | @dnd-kit                        | Menu order, section reorder, banner sort |




### 3.2 Backend (foundation only in M1)


| Decision      | Choice                               | Rationale                                       |
| ------------- | ------------------------------------ | ----------------------------------------------- |
| API style     | REST JSON under `/api/v1/admin`      | Simple, Laravel-native                          |
| Auth          | Laravel Sanctum (SPA tokens)         | Next.js admin will consume later                |
| Media storage | `storage/app/public/media` + symlink | Standard Laravel pattern                        |
| Roles         | `admin`, `editor`, `viewer`          | Spatie Laravel Permission or simple roles table |


**M1 backend scope:** Migrations, models, seeders, and API route stubs. Full API wiring can trail the UI by 1–2 sprints if the client needs clickable screens first.

### 3.3 Environment URLs


| App                 | Local URL (suggested)                            |
| ------------------- | ------------------------------------------------ |
| Next.js Admin       | `http://localhost:3000/admin`                    |
| Laravel API         | `https://backpackclan.test/backend/api/v1`       |
| Public preview (M1) | `http://localhost:3000` (homepage preview route) |


---



## 4. Implementation Phases



### Phase 1 — Foundation (Week 1)

**Goal:** Shared layout, design system, auth shell, navigation.

#### 4.1.1 Install frontend dependencies

```bash
cd frontend
npm install @hookform/resolvers zod react-hook-form sonner lucide-react
npm install @tanstack/react-table @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install date-fns clsx tailwind-merge class-variance-authority
# shadcn/ui init + core components (button, input, dialog, toast, etc.)
```



#### 4.1.2 Folder structure

```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (admin)/
│   │   ├── layout.tsx                 # Sidebar + header shell
│   │   ├── dashboard/page.tsx
│   │   ├── media/page.tsx
│   │   ├── seo/
│   │   │   ├── page.tsx               # SEO list
│   │   │   └── [id]/page.tsx
│   │   ├── menus/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── banners/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── homepage/
│   │   │   ├── page.tsx               # Section manager
│   │   │   └── sections/[slug]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── users/
│   │       ├── page.tsx
│   │       └── [id]/page.tsx
│   ├── preview/
│   │   └── homepage/page.tsx          # Live homepage preview
│   ├── layout.tsx
│   └── page.tsx                       # Redirect or marketing stub
├── components/
│   ├── ui/                            # shadcn primitives
│   ├── admin/                         # Sidebar, Header, PageHeader, DataTable
│   ├── forms/                         # FormField wrappers, ImagePicker, VideoPicker
│   └── homepage/                      # Section preview blocks
├── lib/
│   ├── utils.ts
│   ├── validations/                   # Zod schemas per module
│   └── mock/                          # Mock data + mock API functions
├── types/                             # TypeScript interfaces
└── hooks/                             # useToast, useConfirm, useMockApi
```



#### 4.1.3 Admin layout components


| Component         | Behavior                                                          |
| ----------------- | ----------------------------------------------------------------- |
| `AdminSidebar`    | Collapsible nav, active route highlight, role-filtered menu items |
| `AdminHeader`     | Breadcrumbs, user menu, “Preview Homepage” link                   |
| `PageHeader`      | Title, description, primary action button                         |
| `ConfirmDialog`   | Reusable delete/disable confirmation                              |
| `EmptyState`      | Friendly empty list placeholder                                   |
| `LoadingSkeleton` | Table/card loading states                                         |




#### 4.1.4 Auth screens (mock)


| Screen          | Route              | Interactions                                                                                     |
| --------------- | ------------------ | ------------------------------------------------------------------------------------------------ |
| Login           | `/login`           | Email/password validation, error on empty fields, success toast → redirect to `/admin/dashboard` |
| Forgot Password | `/forgot-password` | Email validation, success toast “Reset link sent”                                                |


**Mock auth:** Hardcoded credentials in `lib/mock/auth.ts` (e.g. `admin@backpackclan.com` / `password`). Store session in `localStorage` or cookie for route protection via middleware.

---



### Phase 2 — Authentication & Roles (Week 1–2)



#### 4.2.1 Role model


| Role       | Permissions                                                          |
| ---------- | -------------------------------------------------------------------- |
| **Admin**  | Full access — users, settings, all CMS                               |
| **Editor** | CMS modules, homepage, media — no global settings or user management |
| **Viewer** | Read-only lists and previews                                         |




#### 4.2.2 Screens


| Screen             | Route               | Features                                               |
| ------------------ | ------------------- | ------------------------------------------------------ |
| User List          | `/admin/users`      | Search, role filter, status badge, edit/delete actions |
| Add/Edit User      | `/admin/users/[id]` | Name, email, role select, active toggle                |
| Profile (optional) | `/admin/profile`    | Change password form                                   |




#### 4.2.3 UX requirements

- Delete user → confirmation dialog → “User deleted successfully” toast
- Role change → “Role updated” toast
- Editor role → hide Settings & Users in sidebar
- Form validation: required email, valid email format, password min 8 chars



#### 4.2.4 Laravel (parallel)

```
users (existing)
roles
role_user
permissions (optional for M1)
```

Seed default admin user + sample editor/viewer.

---



### Phase 3 — Media Manager (Week 2)

Inspired by WordPress media library + travel site hero imagery needs.

#### 4.3.1 Screen: `/admin/media`


| Area         | Features                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------- |
| Toolbar      | Upload button, search, type filter (image/video/document), grid/list toggle              |
| Grid view    | Thumbnail, filename, size, upload date, checkbox multi-select                            |
| Detail panel | Alt text, title, URL copy, replace, delete                                               |
| Upload modal | Drag-and-drop zone, progress bar (simulated), validation (max 5MB images, mp4 for video) |




#### 4.3.2 Interactions


| Action      | Feedback                                      |
| ----------- | --------------------------------------------- |
| Upload      | Progress → “File uploaded successfully” toast |
| Delete      | Confirm → “Media deleted” toast               |
| Bulk delete | Confirm with count → success toast            |
| Copy URL    | “URL copied to clipboard” toast               |




#### 4.3.3 Reusable `MediaPicker`

Used in Banners, Homepage sections, and Global Settings (logo/favicon).

#### 4.3.4 Laravel

```
media
  - id, uuid, filename, path, mime_type, size, alt_text, title
  - uploaded_by, created_at, updated_at
```

---



### Phase 4 — SEO Manager (Week 2)



#### 4.4.1 Screen: `/admin/seo`


| Feature            | Detail                                                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Page list          | Homepage, About, Contact, Blog index (+ placeholders for M3 pages)                                                      |
| Per-page form      | Meta title, meta description, OG image (MediaPicker), canonical URL, robots (index/noindex), JSON-LD snippet (textarea) |
| Preview card       | Google SERP preview mockup                                                                                              |
| Character counters | Title ≤ 60, description ≤ 160 with warning colors                                                                       |




#### 4.4.2 Interactions

- Save → “SEO settings updated” toast
- Validation: meta title required, URL format for canonical
- Reset to defaults → confirmation → toast



#### 4.4.3 Laravel

```
seo_meta
  - id, page_key (unique), meta_title, meta_description
  - og_image_id, canonical_url, robots, schema_json
```

---



### Phase 5 — Menu Manager (Week 2–3)

Reference: header nav on WanderOn / JustWravel (Destinations, Trips, About, Contact, etc.)

#### 4.5.1 Screens


| Screen      | Route               | Features                                    |
| ----------- | ------------------- | ------------------------------------------- |
| Menu List   | `/admin/menus`      | Header Menu, Footer Menu, Mobile Menu cards |
| Menu Editor | `/admin/menus/[id]` | Nested drag-and-drop tree                   |




#### 4.5.2 Menu item fields

- Label, URL (internal path or external), open in new tab, icon (optional)
- Parent item (for dropdowns: e.g. Destinations → Leh Ladakh, Spiti)
- Visibility toggle, sort order



#### 4.5.3 Interactions

- Drag to reorder → auto-save toast “Menu order saved”
- Add item → inline form or slide-over panel
- Delete item → confirm (warn if has children)
- Enable/disable item → status toast



#### 4.5.4 Laravel

```
menus          - id, name, slug, location (header|footer|mobile)
menu_items     - id, menu_id, parent_id, label, url, target, sort_order, is_active
```

---



### Phase 6 — Banner Manager (Week 3)



#### 4.6.1 Screens


| Screen          | Route                 | Features                                           |
| --------------- | --------------------- | -------------------------------------------------- |
| Banner List     | `/admin/banners`      | Table: title, placement, status, schedule, actions |
| Add/Edit Banner | `/admin/banners/[id]` | Full banner form                                   |




#### 4.6.2 Banner form fields


| Field                  | Type                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| Title                  | Text                                                                |
| Placement              | Select: Homepage Hero, Homepage Secondary, Destination Page, Custom |
| Media                  | Image or Video (toggle) via MediaPicker                             |
| Headline & Subheadline | Text                                                                |
| CTA buttons            | Repeater: label, URL, style (primary/secondary/outline)             |
| Link URL               | Optional click-through for whole banner                             |
| Schedule               | Start date / end date (optional)                                    |
| Status                 | Active / Inactive                                                   |
| Sort order             | Number                                                              |




#### 4.6.3 Interactions

- Create → redirect to list + success toast
- Toggle status → instant badge update + toast
- Delete → confirmation
- Duplicate banner → “Banner duplicated” toast
- Date validation: end date after start date



#### 4.6.4 Laravel

```
banners
  - id, title, placement, media_type, media_id, headline, subheadline
  - link_url, cta_buttons (JSON), starts_at, ends_at, sort_order, is_active
```

---



### Phase 7 — Homepage Section Manager (Week 3–4)

Core CMS feature — modular homepage like reference travel sites.

#### 4.7.1 Screen: `/admin/homepage`

**Section list (drag-and-drop order)**


| #   | Section (default)     | Enable toggle | Actions |
| --- | --------------------- | ------------- | ------- |
| 1   | Hero Banner           | ✓             | Edit    |
| 2   | Featured Destinations | ✓             | Edit    |
| 3   | Popular Trips         | ✓             | Edit    |
| 4   | Why Choose Us         | ✓             | Edit    |
| 5   | Testimonials          | ✓             | Edit    |
| 6   | Instagram / Gallery   | ✓             | Edit    |
| 7   | Blog Highlights       | ✓             | Edit    |
| 8   | Newsletter CTA        | ✓             | Edit    |
| 9   | Partner Logos         | ✓             | Edit    |
| 10  | FAQ Strip             | ✓             | Edit    |




#### 4.7.2 Section editor: `/admin/homepage/sections/[slug]`

Each section type has a tailored form:


| Section                   | Editable content                                                                     |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Hero**                  | Banner picker or inline: headline, subtext, background image/video, 1–2 CTAs         |
| **Featured Destinations** | Section title, grid of cards (image, name, trip count, link) — mock destination data |
| **Popular Trips**         | Title, filter tags (mock), card layout toggle (grid/carousel)                        |
| **Why Choose Us**         | Title, 3–6 icon+title+description blocks                                             |
| **Testimonials**          | Title, testimonial cards (name, trip, rating, text, avatar)                          |
| **Gallery**               | Title, image grid from MediaPicker                                                   |
| **Blog Highlights**       | Title, 3 post cards (mock)                                                           |
| **Newsletter CTA**        | Headline, description, button text, placeholder email field (preview only)           |
| **Partner Logos**         | Logo images + optional links                                                         |
| **FAQ Strip**             | Title, 3–5 Q&A pairs                                                                 |




#### 4.7.3 Global section controls

- **Enable/Disable** toggle on list → toast “Section enabled/disabled”
- **Reorder** via drag handle → toast “Homepage order saved”
- **Save section** → “Section updated successfully”
- **Preview** button → opens `/preview/homepage` in new tab



#### 4.7.4 Homepage preview: `/preview/homepage`

Renders all **enabled** sections in order using the same components that will power the public site in M3. Uses mock data from section configs.

#### 4.7.5 Laravel

```
homepage_sections
  - id, slug, title, type, sort_order, is_enabled, content (JSON), updated_at
```

`content` JSON stores section-specific fields (flexible schema per `type`).

---



### Phase 8 — Global Settings (Week 4)



#### 4.8.1 Screen: `/admin/settings`

Tabbed interface:


| Tab              | Fields                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------- |
| **General**      | Site name, tagline, logo, favicon, contact email, phone, address                            |
| **Social**       | Facebook, Instagram, YouTube, WhatsApp number, LinkedIn URLs                                |
| **Branding**     | Primary color, secondary color, font preset (preview swatch)                                |
| **Footer**       | Copyright text, footer description, payment icons toggle                                    |
| **Integrations** | Placeholder toggles (WhatsApp widget, Tawk.to, GTM ID) — disabled with “Coming in M4” badge |
| **Maintenance**  | Maintenance mode toggle, maintenance message                                                |




#### 4.8.2 Interactions

- Save per tab → “Settings saved successfully”
- Logo/favicon via MediaPicker
- Maintenance mode ON → warning banner in admin + toast
- Validation: email format, phone format, required site name



#### 4.8.3 Laravel

```
settings
  - id, group, key, value (JSON/text), updated_at
```

Or single `site_settings` JSON column for M1 simplicity.

---



### Phase 9 — Dashboard & Polish (Week 4)



#### 4.9.1 Dashboard: `/admin/dashboard`


| Widget                 | Content                                                |
| ---------------------- | ------------------------------------------------------ |
| Welcome                | Logged-in user name, role                              |
| Quick stats (mock)     | Total media, active banners, enabled homepage sections |
| Quick actions          | Add Banner, Upload Media, Edit Homepage, SEO Settings  |
| Recent activity (mock) | “Homepage hero updated”, “New banner added”, etc.      |
| System status          | API: “Mock mode” badge until Laravel connected         |




#### 4.9.2 Cross-cutting UX checklist


| Pattern             | Implementation                                            |
| ------------------- | --------------------------------------------------------- |
| Form submit success | Green Sonner toast, 3s duration                           |
| Form submit error   | Red toast + inline field errors                           |
| Delete              | `AlertDialog` → destructive confirm → success toast       |
| Status toggle       | Immediate UI update + toast                               |
| Unsaved changes     | `beforeunload` or modal on navigate away                  |
| Empty states        | Illustration + CTA (“Upload your first image”)            |
| Loading             | Button spinner + disabled state during mock delay (300ms) |
| 404                 | Admin-styled not found page                               |
| Responsive          | Sidebar collapses to drawer on mobile                     |


---



## 5. Complete Screen & Route Map

```
/login
/forgot-password

/admin/dashboard
/admin/users
/admin/users/new
/admin/users/[id]

/admin/media

/admin/seo
/admin/seo/[pageKey]

/admin/menus
/admin/menus/[id]

/admin/banners
/admin/banners/new
/admin/banners/[id]

/admin/homepage
/admin/homepage/sections/[slug]

/admin/settings

/preview/homepage
```

**Total: ~18 distinct screens/views** (including new/edit variants).

---



## 6. Mock Data Strategy

All modules read/write through a mock service layer so the UI is fully functional without Laravel.

```
frontend/lib/mock/
├── auth.ts
├── users.ts
├── media.ts
├── seo.ts
├── menus.ts
├── banners.ts
├── homepage.ts
├── settings.ts
└── api-client.ts      # Simulates delay, returns { success, data, errors }
```

**Pattern:**

```typescript
// lib/mock/api-client.ts
export async function mockMutation<T>(
  fn: () => T,
  delayMs = 400
): Promise<{ success: true; data: T } | { success: false; errors: Record<string, string> }> {
  await new Promise((r) => setTimeout(r, delayMs));
  return { success: true, data: fn() };
}
```

Persist mock data in `localStorage` so edits survive page refresh during demos.

---



## 7. Laravel Backend Plan (M1 Foundation)



### 7.1 API routes (stubs)

```
POST   /api/v1/admin/login
POST   /api/v1/admin/logout
GET    /api/v1/admin/me

GET|POST|PUT|DELETE  /api/v1/admin/users
GET|POST|PUT|DELETE  /api/v1/admin/media
GET|PUT              /api/v1/admin/seo/{pageKey}
GET|PUT              /api/v1/admin/menus/{id}
GET|POST|PUT|DELETE  /api/v1/admin/banners
GET|PUT              /api/v1/admin/homepage/sections
PUT                  /api/v1/admin/homepage/sections/reorder
GET|PUT              /api/v1/admin/settings
```



### 7.2 Migrations order

1. `roles`, `role_user`
2. `media`
3. `seo_meta`
4. `menus`, `menu_items`
5. `banners`
6. `homepage_sections`
7. `settings`



### 7.3 Seeders

- Default roles + admin user
- Sample menus (header with Destinations dropdown)
- 2–3 banners
- All homepage sections (enabled/disabled mix)
- Default SEO for homepage
- Default global settings (Backpackclan branding)



### 7.4 When to connect API

Replace `lib/mock/*` calls with `fetch` to Laravel one module at a time:

1. Auth (Sanctum cookie or token)
2. Settings & SEO (simple reads)
3. Media (real file upload)
4. Menus, Banners, Homepage sections

---



## 8. Design Direction

Align with modern travel portals (WanderOn, JustWravel):


| Element       | Direction                                                          |
| ------------- | ------------------------------------------------------------------ |
| Color palette | Deep teal/emerald primary + warm orange CTA accent + neutral grays |
| Typography    | Clean sans-serif (Geist or Inter), bold headings                   |
| Admin chrome  | Light sidebar, white content area, subtle shadows                  |
| Cards         | Rounded-xl, border, hover elevation on lists                       |
| Tables        | Zebra optional, sticky header, row actions on hover                |
| Forms         | Two-column on desktop, labeled inputs, helper text                 |
| Status badges | Active=green, Inactive=gray, Scheduled=blue, Draft=yellow          |


Create `frontend/docs/DESIGN-TOKENS.md` or extend `globals.css` with CSS variables for brand colors.

---



## 9. Task Breakdown & Suggested Timeline


| #   | Task                                          | Est.     | Depends on |
| --- | --------------------------------------------- | -------- | ---------- |
| 1   | shadcn/ui setup + design tokens               | 1 day    | —          |
| 2   | Admin layout (sidebar, header, breadcrumbs)   | 1 day    | 1          |
| 3   | Auth screens + route middleware               | 1 day    | 2          |
| 4   | Mock API layer + localStorage persistence     | 0.5 day  | —          |
| 5   | Dashboard                                     | 0.5 day  | 2, 3       |
| 6   | Users & roles module                          | 1 day    | 2, 4       |
| 7   | Media manager + MediaPicker                   | 2 days   | 2, 4       |
| 8   | SEO manager                                   | 1 day    | 7          |
| 9   | Menu manager (nested DnD)                     | 1.5 days | 2, 4       |
| 10  | Banner manager                                | 1.5 days | 7          |
| 11  | Homepage section list + editors               | 3 days   | 7, 10      |
| 12  | Homepage preview page                         | 1 day    | 11         |
| 13  | Global settings                               | 1 day    | 7          |
| 14  | UX polish (toasts, confirms, validation pass) | 1 day    | All        |
| 15  | Laravel migrations, models, seeders           | 2 days   | —          |
| 16  | Laravel API controllers (CRUD)                | 2 days   | 15         |
| 17  | Connect frontend to API (optional M1 tail)    | 2 days   | 16         |


**Total estimate:** ~4 weeks (1 developer full-time)  
**UI-only demo ready:** ~3 weeks (tasks 1–14)  
**Full stack M1:** ~4–5 weeks

---



## 10. Acceptance Criteria



### Admin Panel Foundation

- [ ] User can log in (mock) and land on dashboard
- [ ] Sidebar navigation works for all modules
- [ ] Role-based menu visibility (admin vs editor vs viewer)
- [ ] Responsive layout on tablet and mobile



### Media Manager

- [ ] Upload, search, filter, delete with confirmations
- [ ] MediaPicker reusable in other forms



### SEO Manager

- [ ] Edit meta for each page with SERP preview
- [ ] Validation and save feedback



### Menu Manager

- [ ] Create nested menu items with drag-and-drop order
- [ ] Enable/disable items with toast feedback



### Banner Manager

- [ ] Full CRUD with image/video, CTAs, scheduling
- [ ] Status toggle and duplicate



### Homepage Management

- [ ] Enable/disable sections from list
- [ ] Reorder sections via drag-and-drop
- [ ] Edit each section type with appropriate fields
- [ ] Preview page reflects enabled sections and content



### Global Settings

- [ ] All tabs save independently with validation
- [ ] Logo/favicon selection from media library



### UX (all modules)

- [ ] Every submit shows success or error feedback
- [ ] Every delete shows confirmation then toast
- [ ] Form validation shows inline errors
- [ ] Buttons show loading state during actions
- [ ] No dead clicks — all interactive elements respond

---



## 11. Deliverables Checklist


| Deliverable                | Output                                  |
| -------------------------- | --------------------------------------- |
| Admin Panel Foundation     | Layout, auth, dashboard, navigation     |
| Homepage Structure         | 10 configurable sections with preview   |
| Dynamic Content Management | Banners, menus, SEO, settings, media    |
| Documentation              | This plan + README setup steps          |
| Demo                       | Fully clickable admin without API       |
| Backend ready              | Migrations, models, seeders, API routes |


---

