# Roadmap: Avishkaar

## Overview

Avishkaar ships all features from the 48-hour hackathon blueprint in 5 Vertical MVP phases aligned directly to the hackathon schedule: foundation/schema/seeding, visual feed/auth/vouches, location detail/Gemini AI/Support Local/Offline/Leaflet map, check-ins/badges/trust-gated volunteer guides, and final mobile polish/deployment/demo readiness.

## Phases

- [x] **Phase 1: Foundation, 5-Table Schema & Seed Data** - Next.js + Tailwind + Supabase foundation, 5 Postgres tables + RPCs + Storage, and 16 seeded offbeat destinations
- [x] **Phase 2: Discovery Feed, Auth, Post Form & Vouches** - Email/Google auth, Masonry feed (photos + short clips + filters) sorted by Hidden Gem Score, Post Gem form, and live Vouch RPC
- [x] **Phase 3: Location Detail, Gemini AI, Support Local, Offline & Map** - `/place/[id]` with Gemini strict JSON extraction + fallback, Support Local, Safety banners, Offline Pocket Card, and Leaflet + OSM map
- [x] **Phase 4: Check-ins, Badges & Volunteer Guides** - Geolocation + Demo Check-in toggle, Verified Visit Vouch (+25), auto-awarded badges + trophy shelf, and trust-gated Volunteer Guides
- [x] **Phase 5: Polish, Deploy & Demo Readiness** - Mobile pass, loading skeletons, zero console errors, production build verified, and 3-minute live demo flow tested end-to-end

## Phase Details

### Phase 1: Foundation, 5-Table Schema & Seed Data
**Goal**: Working Next.js App Router + Tailwind project with Supabase 5-table SQL schema, Storage bucket, Vouch RPC, and 15–20 seeded real lesser-known destinations (with photos, 2–3 short clips, vendor tags, and verified local guides)
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-02, SCAL-01
**Success Criteria** (what must be TRUE):
  1. Next.js App Router + Tailwind CSS app runs cleanly (`npm run dev` / `npm run build`) with typed domain models and Supabase/local fallback data layer
  2. SQL migration defines `profiles`, `places`, `vouches`, `user_badges`, `guide_requests`, RLS policies, Storage bucket, and atomic `vouch_place` RPC
  3. Dataset seeds 16 real lesser-known destinations with high-res photos, 3 short vertical video clips, safety advisories, Support Local vendors, and seeded verified guides
**Plans**: 3 plans

Plans:
- [x] 01-01: Scaffold Next.js App Router, Tailwind CSS, dependencies (`@supabase/supabase-js`, `@google/genai`, `leaflet`, `lucide-react`)
- [x] 01-02: Create Supabase 5-table SQL migrations, RLS, Storage bucket, Vouch RPC, and dual-mode repository layer
- [x] 01-03: Seed 16 real offbeat destinations with photos, 3 short clips, Support Local vendors, safety alerts, and verified local guides

### Phase 2: Discovery Feed, Auth, Post Form & Vouches
**Goal**: Users authenticate with Email/Google, browse the Hidden-Gem-ranked Masonry feed (photos + short clips + category/region pills), submit new hidden gems, and Vouch to increment Trailblazer Scores
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, FEED-01, FEED-02, FEED-03, SPOT-01, TRST-01, TRST-02
**UI hint**: yes
**Plans**: 3 plans

Plans:
- [x] 02-01: Auth UI & session management (Supabase Email/Google + profile/tier badge header)
- [x] 02-02: Hidden Gem ranking engine + responsive Masonry feed (photos + short clips + category/region filter pills)
- [x] 02-03: "Post a Hidden Gem" upload modal/page + live Vouch button wired to RPC/score update

### Phase 3: Location Detail, Gemini AI, Support Local, Offline & Map
**Goal**: Users open `/place/[id]` to view AI-structured Commute/Food/Activity cards (with manual fallback), Support Local vendors, Safety banners, Offline Pocket Card (`localStorage` + print/PDF), and Leaflet + OSM maps
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: SPOT-02, SPOT-03, SPOT-04, LOCL-01, OFFL-01
**UI hint**: yes
**Plans**: 3 plans

Plans:
- [x] 03-01: Gemini API strict JSON extraction endpoint (`/api/structure-place`) + manual fallback parser wired into Post a Hidden Gem
- [x] 03-02: `/place/[id]` detail experience (structured cards, Support Local section, Safety banner, Save for Offline `localStorage` + print/PDF view + `/offline` pocket viewer)
- [x] 03-03: Leaflet + OpenStreetMap interactive map component (place pins, vendor pins, red safety warning markers)

### Phase 4: Check-ins, Badges & Volunteer Guides
**Goal**: Travelers check in via Geolocation or Demo toggle to unlock Verified Visit Vouches (+25 pts), auto-earn milestone badges on a profile trophy shelf, and request trust-gated Volunteer Local Guides
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CHKN-01, CHKN-02, GUID-01, GUID-02
**UI hint**: yes
**Plans**: 2 plans

Plans:
- [x] 04-01: Geolocation + Demo Check-in toggle, Verified Visit Vouch (+25), auto-awarded badges & `/profile` trophy shelf
- [x] 04-02: Trust-gated Volunteer Guide toggle (`Pathfinder`/`Local Legend`/verified local) + matching guides list & Request Guide modal/dashboard

### Phase 5: Polish, Deploy & Demo Readiness
**Goal**: Mobile-first polish, loading skeletons, zero console/build errors, automated verification of core formulas & flows, Vercel config, and verified 3-minute live demo script
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: All v1 requirements verified end-to-end
**Plans**: 2 plans

Plans:
- [x] 05-01: Mobile responsiveness, skeletons, error handling, and production Turbopack build config
- [x] 05-02: Automated test suite + live HTTP E2E verification of all 5 phases & 3-minute demo flow

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, 5-Table Schema & Seed Data | 3/3 | Complete | 2026-11-27 |
| 2. Discovery Feed, Auth, Post Form & Vouches | 3/3 | Complete | 2026-11-27 |
| 3. Location Detail, Gemini AI, Support Local, Offline & Map | 3/3 | Complete | 2026-11-27 |
| 4. Check-ins, Badges & Volunteer Guides | 2/2 | Complete | 2026-11-27 |
| 5. Polish, Deploy & Demo Readiness | 2/2 | Complete | 2026-11-27 |
