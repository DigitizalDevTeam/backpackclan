# Backpackclan — Milestone 4 Implementation Plan

**Stack:** Next.js 16 + Laravel 13  
**Focus:** Third-party integrations (WhatsApp, Google Tag Manager, Tawk.to live chat)  
**Status:** Complete

---

## 1. Objectives

| Goal | Description |
|------|-------------|
| WhatsApp widget | Floating chat button on public site + customer account |
| Google Tag Manager | Analytics / marketing tags via GTM container |
| Tawk.to live chat | Embedded support chat widget |
| Admin configuration | Enable/disable + IDs from **Admin → Settings → Integrations** |
| Security | Validate and sanitize third-party IDs before script injection |

**Out of scope for M4:** Live weather API, WhatsApp Business API automation, custom chat backend.

---

## 2. Architecture

```
Admin Settings (integrations group)
        ↓
Laravel site_settings table  ←→  Next.js BFF /api/admin/settings/integrations
        ↓
Public layout API (site/layout) exposes integrations to frontend
        ↓
SitePageShell + AccountShell render:
  • WhatsAppWidget (if whatsappWidget + social.whatsapp)
  • SiteIntegrations (GTM script + Tawk.to embed)
```

Integrations load on **public pages and customer account only** — not in the admin panel.

---

## 3. Admin configuration

**Path:** `/admin/settings` → **Integrations** tab

| Field | Purpose |
|-------|---------|
| WhatsApp floating widget | Toggle fixed bottom-right WhatsApp button |
| Tawk.to live chat | Toggle Tawk.to embed |
| Tawk.to Property / Widget ID | Format: `propertyId/widgetId` from embed snippet |
| Google Tag Manager container ID | Format: `GTM-XXXXXXX` (blank = disabled) |

**Dependency:** WhatsApp widget requires a number under **Social** settings.

---

## 4. Validation rules

| Field | Rule |
|-------|------|
| `gtmId` | Optional; if set must match `GTM-[A-Z0-9]+` |
| `tawkToId` | Required when `tawkToEnabled`; format `hex/hex` |
| `whatsappWidget` | Boolean; no extra field (uses social WhatsApp) |

IDs are normalized on save (GTM uppercased, Tawk.to lowercased) and re-sanitized at render time.

---

## 5. Files touched

### Backend
- `app/Services/SettingsService.php` — integration validation
- `tests/Unit/IntegrationSettingsTest.php`

### Frontend
- `components/admin/settings/SettingsManager.tsx` — enabled Integrations tab
- `components/site/SiteIntegrations.tsx` — GTM + Tawk.to with sanitization
- `components/site/WhatsAppWidget.tsx` — (existing) floating button
- `lib/site/integrations.ts` — ID sanitizers
- `lib/validations/settings.ts` — Zod rules

---

## 6. Testing checklist

1. **Admin → Settings → Integrations** — save valid GTM + Tawk IDs
2. **Public homepage** — view source / Network tab for `gtm.js` and `embed.tawk.to`
3. **WhatsApp widget** — enable toggle + set Social WhatsApp number → green button appears
4. **Customer account** — same widgets appear on `/account/*`
5. **Admin panel** — confirm no GTM/Tawk scripts load on `/admin/*`
6. **Invalid IDs** — reject `UA-12345-1` as GTM, reject malformed Tawk ID

```bash
cd backend && php artisan test --filter=IntegrationSettingsTest
```

---

## 7. Production notes

- Create a GTM container and add GA4 / conversion tags inside GTM (not hardcoded in the app).
- Tawk.to: copy IDs from **Administration → Chat Widget → Direct Chat Link** embed code.
- WhatsApp: use full international format in Social settings (e.g. `+919876543210`).
- Cookie consent banners (if required) should be configured as a GTM tag or separate CMP — not included in this milestone.

---

## 8. Related milestones

| Milestone | Relationship |
|-----------|--------------|
| M1 | Settings CMS + placeholder Integrations tab |
| M2 | Destination weather table (manual; live API deferred) |
| M3 | Customer portal shells that render integrations |
