# Avishkaar — Offbeat Tourism & Local Heritage Discovery

Visual-first, community-verified discovery platform for offbeat tourism, regional cuisines, and local heritage. A Pinterest-style masonry feed of photos and short vertical clips, ranked by an explainable **Hidden Gem Score** instead of popularity, with AI-structured commute / food / activity / living-heritage guides, community-verified safety advisories, trust-gated volunteer local guides, and offline pocket cards.

## Quick start (Demo Mode — no keys needed)

```bash
npm ci
npm run dev        # http://localhost:3000
```

With no env vars set, the app runs in **Demo Mode**: 58 seeded destinations, 6 demo personas (switchable in 1 click from the account menu), and a local JSON demo store. This is the mode for local development and live judging.

```bash
npm test           # domain + API/security + slug/search tests
npx tsc --noEmit   # typecheck
npm run build      # production build
npm start          # production server
```

## Expo mobile app (`mobile/`)

```bash
cd mobile
cp .env.example .env   # optional: set Supabase + API base URL
npm install
npx expo start         # open in Expo Go (iOS / Android)
```

```bash
cd mobile
npm test               # mobile domain + store tests
npm run typecheck      # mobile TypeScript check
```

## Modes

| | Demo Mode | Supabase Mode |
|---|---|---|
| Enabled when | No `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Both are set |
| Data | `.data/demo-store.json` (local) or `/tmp` on serverless | Supabase PostgreSQL (5 tables) |
| Auth | Persona switcher, body `userId` trusted **in development only** | Supabase Auth (email + Google), verified Bearer token |
| Persistence | **Ephemeral by design** — the demo store is a JSON file, lost on serverless cold starts. Not production storage. | Durable |

> **Production safety:** in `NODE_ENV=production`, Demo Mode auth is refused unless `DEMO_MODE=true` is set explicitly — a deploy that forgot its Supabase env vars fails closed instead of trusting client-supplied user IDs.

## Environment variables

Copy `.env.example` to `.env.local`:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase mode | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase mode | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase mode (server) | Server-side only, never expose to the client |
| `GEMINI_API_KEY` | No | Without it, a deterministic multilingual fallback extractor is used |
| `GEMINI_MODEL` | No | Default `gemini-2.5-flash` |
| `DEMO_MODE` | No | Set `true` only to intentionally run Demo Mode in production |
| `ALLOW_DEMO_CHECKIN` | No | Enabled by default (including deployment builds) for live judging. Set `false` to require real browser geolocation within a 25 km haversine radius. |

## Vercel & Supabase deployment checklist

1. **Vercel Domains & Protection:** Use your Production domain under **Vercel → Project → Settings → Domains** (or disable **Vercel Authentication** under **Deployment Protection** if sharing branch preview URLs across devices).
2. **Vercel Environment Variables:** Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and optionally `GEMINI_API_KEY`.
3. **Supabase Auth Redirects:** In **Supabase → Authentication → URL Configuration**, set **Site URL** to your Production Vercel URL and add these to **Redirect URLs**:
   - `https://<your-vercel-domain>/**`
   - `http://localhost:3000/**`
   - `avishkaar://**` and `exp://**` (for Expo Go mobile auth)

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/0001_init.sql` (5 tables: `profiles`, `places`, `vouches`, `user_badges`, `guide_requests`; RLS policies; atomic `vouch_place` / `check_in_place` / `verify_safety_alert` / `award_milestone_badges` RPCs; `place-media` storage bucket; auto-profile on signup).
3. Set the env vars above.
4. Seed demo data: `npm run seed`

## Core mechanics

- **Hidden Gem Score** = `((Vouches × 2) + (Verified Check-ins × 5)) / log10(Mainstream Popularity Index + 10)` — shown with a full breakdown on every card.
- **Vouch** = +10 Trailblazer points to the place's author; **Verified Visit Vouch** (check in first, then vouch) = +25. You cannot vouch for or check in to your own place.
- **Tiers:** Wanderer (0+) · Pathfinder (100+) · Local Legend (300+). Only Pathfinder+, Local Legends, or verified locals can volunteer as guides.
- **Safety advisories** become public when authored by a Pathfinder+, or after 2+ community verifies; 2+ flags that outnumber verifies hide an alert.
- **Detour Bar:** "Instead of X, Go Here" — top-3 lower-crowd alternatives for crowded hotspots (Gemini vibe match when configured, deterministic fallback otherwise).
- **Uploads:** authenticated only; file type is detected from magic bytes (JPEG/PNG/WebP/GIF, MP4/WebM) — SVG/HTML and spoofed types are rejected. Images ≤ 25 MB, video clips ≤ 8 MB.

## Project layout

```
src/app/          App Router pages (`/`, `/about`, `/contact`, `/place/[id]` slug/UUID, `/submit`, `/offline`, `/profile`) + API routes
src/components/   AppProvider, Navbar, AuthModal, LeafletMap, MediaCardPlayer, AvishkaarLogo
src/lib/          domain.ts (scoring/trust/slug/search rules), store.ts (Demo + Supabase),
                  gemini.ts, detour.ts, supabase.ts, validation.ts,
                  upload-validation.ts
src/data/seed.ts  58 seeded destinations, personas, vouches, badges
mobile/           Expo SDK 58 iOS & Android app (Expo Router + Reanimated + Supabase parity)
supabase/         SQL migrations
tests/            node:test suites (domain, API validation/security, search/slugs)
.planning/        GSD project planning state (roadmap, requirements, state) —
                  kept in-repo on purpose: it is the shared project memory
                  for the GSD workflow described in GEMINI.md
```

## CI

`.github/workflows/ci.yml` runs install, tests, typecheck, lint, and the production build on every push and pull request.
