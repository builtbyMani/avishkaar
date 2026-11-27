# Roadmap: Avishkaar

## Overview

Avishkaar ships all features from the 48-hour hackathon blueprint in 5 Vertical MVP phases aligned directly to the hackathon schedule: foundation/schema/seeding, visual feed/auth/vouches, location detail/Gemini AI/Support Local/Offline/Leaflet map, check-ins/badges/trust-gated volunteer guides, and final mobile polish/deployment/demo readiness.

## Phases

- [ ] **Phase 1: Foundation, 5-Table Schema & Seed Data** - Next.js + Tailwind + Supabase foundation, 5 Postgres tables + RPCs + Storage, and 15–20 seeded offbeat destinations
- [ ] **Phase 2: Discovery Feed, Auth, Post Form & Vouches** - Email/Google auth, Masonry feed (photos + short clips + filters) sorted by Hidden Gem Score, Post Gem form, and live Vouch RPC
- [ ] **Phase 3: Location Detail, Gemini AI, Support Local, Offline & Map** - `/place/[id]` with Gemini strict JSON extraction + fallback, Support Local, Safety banners, Offline Pocket Card, and Leaflet + OSM map
- [ ] **Phase 4: Check-ins, Badges & Volunteer Guides** - Geolocation + Demo Check-in toggle, Verified Visit Vouch (+25), auto-awarded badges + trophy shelf, and trust-gated Volunteer Guides
- [ ] **Phase 5: Polish, Deploy & Demo Readiness** - Mobile pass, loading skeletons, zero console errors, production build/deploy readiness, and 3-minute live demo verification

## Phase Details

### Phase 1: Foundation, 5-Table Schema & Seed Data
**Goal**: Working Next.js App Router + Tailwind project with Supabase 5-table SQL schema, Storage bucket, Vouch RPC, and 15–20 seeded real lesser-known destinations (with photos, 2–3 short clips, vendor tags, and verified local guides)
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-02, SCAL-01
**Success Criteria** (what must be TRUE):
  1. Next.js App Router + Tailwind CSS app runs cleanly (`npm run dev` / `npm run build`) with typed domain models and Supabase/local fallback data layer
  2. SQL migration defines `profiles`, `places`, `vouches`, `user_badges`, `guide_requests`, RLS policies, Storage bucket, and atomic `vouch_place` RPC
  3. Dataset seeds 15–20 real lesser-known destinations with high-res photos, 2–3 short vertical video clips, safety advisories, Support Local vendors, and seeded verified guides
**Plans**: 3 plans

Plans:
- [ ] 01-01: Scaffold Next.js App Router, Tailwind CSS, dependencies (`@supabase/supabase-js`, `@google/genai`, `leaflet`, `lucide-react`)
- [ ] 01-02: Create Supabase 5-table SQL migrations, RLS, Storage bucket, Vouch RPC, and dual-mode repository layer
- [ ] 01-03: Seed 15–20 real offbeat destinations with photos, 2–3 short clips, Support Local vendors, safety alerts, and verified local guides

### Phase 2: Discovery Feed, Auth, Post Form & Vouches
**Goal**: Users authenticate with Email/Google, browse the Hidden-Gem-ranked Masonry feed (photos + short clips + category/region pills), submit new hidden gems, and Vouch to increment Trailblazer Scores
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: AUTH-01, FEED-01, FEED-02, FEED-03, SPOT-01, TRST-01, TRST-02
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can sign up/log in (Email or Google via Supabase Auth, plus demo persona switcher when testing without external keys)
  2. Masonry feed (`columns-2 md:columns-4`) renders photos and short vertical video clips/embeds, filters by category/region pills, and sorts strictly by Hidden Gem Score
  3. User can submit "Post a Hidden Gem" uploading media to Storage and immediately see the new spot in the feed
  4. User can Vouch on a place and observe the author's `trailblazer_score` increment (`+10`, or `+25` if verified visit) and tier auto-promote (`Wanderer` / `Pathfinder` / `Local Legend`)
**Plans**: 3 plans

Plans:
- [ ] 02-01: Auth UI & session management (Supabase Email/Google + profile/tier badge header)
- [ ] 02-02: Hidden Gem ranking engine + responsive Masonry feed (photos + short clips + category/region filter pills)
- [ ] 02-03: "Post a Hidden Gem" upload modal/page + live Vouch button wired to RPC/score update

### Phase 3: Location Detail, Gemini AI, Support Local, Offline & Map
**Goal**: Users open `/place/[id]` to view AI-structured Commute/Food/Activity cards (with manual fallback), Support Local vendors, Safety banners, Offline Pocket Card (`localStorage` + print/PDF), and Leaflet + OSM maps
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: SPOT-02, SPOT-03, SPOT-04, LOCL-01, OFFL-01
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. Gemini API route converts messy captions into validated `JSONB` (Last-Mile Commute, Must-Try Food, Local Activity, Safety) using strict JSON output mode, falling back gracefully on timeout/error
  2. `/place/[id]` renders Commute, Must-Try Food, Local Activity, high-contrast Safety banner (`Cultural Etiquette`, `Avoid After Dark`, `Low Network`, `Scam Alert`), and Support Local vendors (name, specialty, map pin, contact)
  3. Clicking "Save for Offline" persists Commute, Food, and Safety cards to `localStorage`, shows an Offline Pocket Card viewer, and renders a clean print/PDF view
  4. Leaflet + OpenStreetMap displays place pins, Support Local vendor pins, and red safety warning markers without API key errors
**Plans**: 3 plans

Plans:
- [ ] 03-01: Gemini API strict JSON extraction endpoint (`/api/structure-place`) + manual fallback parser wired into Post a Hidden Gem
- [ ] 03-02: `/place/[id]` detail experience (structured cards, Support Local section, Safety banner, Save for Offline `localStorage` + print/PDF stylesheet + `/offline` pocket viewer)
- [ ] 03-03: Leaflet + OpenStreetMap interactive map component (place pins, vendor pins, red safety warning markers)

### Phase 4: Check-ins, Badges & Volunteer Guides
**Goal**: Travelers check in via Geolocation or Demo toggle to unlock Verified Visit Vouches (+25 pts), auto-earn milestone badges on a profile trophy shelf, and request trust-gated Volunteer Local Guides
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: CHKN-01, CHKN-02, GUID-01, GUID-02
**UI hint**: yes
**Success Criteria** (what must be TRUE):
  1. User can check in via browser Geolocation API or "Demo Check-in" toggle, unlocking Verified Visit Vouch (+25 pts) and increasing Hidden Gem Score check-in count
  2. `user_badges` auto-awards *First Discovery*, *Foodie Scout*, and *Local Legend* when milestones are met and renders them on `/profile` trophy shelf
  3. Only `Pathfinder` (`100+`), `Local Legend` (`300+`), or seeded verified locals can enable `is_guide` (`guide_region`, `languages`)
  4. `/place/[id]` lists matching local guides with languages spoken and a "Request Guide" modal that writes `Pending` / `Accepted` rows to `guide_requests`
**Plans**: 2 plans

Plans:
- [ ] 04-01: Geolocation + Demo Check-in toggle, Verified Visit Vouch (+25), auto-awarded badges & `/profile` trophy shelf
- [ ] 04-02: Trust-gated Volunteer Guide toggle (`Pathfinder`/`Local Legend`/verified local) + matching guides list & Request Guide modal/dashboard

### Phase 5: Polish, Deploy & Demo Readiness
**Goal**: Mobile-first polish, loading skeletons, zero console/build errors, automated verification of core formulas & flows, Vercel config, and verified 3-minute live demo script
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: All v1 requirements verified end-to-end
**Success Criteria** (what must be TRUE):
  1. `npm run build` and automated unit/integration tests for Hidden Gem Score, Gemini JSON fallback, tier promotion, badge triggers, and guide gating pass cleanly
  2. App loads with loading skeletons, mobile responsiveness, print/PDF styling, and zero uncaught runtime/console errors
  3. Complete 3-minute live demo flow works end-to-end (Feed → Place Detail/Support Local/Safety/Offline → Post Gem AI → Vouch & Badge → Request Volunteer Guide)
**Plans**: 2 plans

Plans:
- [ ] 05-01: Mobile responsiveness, skeletons, error boundaries, and Vercel deployment configuration
- [ ] 05-02: Automated test suite + live headless browser/E2E verification of all 5 phases & 3-minute demo flow

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation, 5-Table Schema & Seed Data | 0/3 | Not started | - |
| 2. Discovery Feed, Auth, Post Form & Vouches | 0/3 | Not started | - |
| 3. Location Detail, Gemini AI, Support Local, Offline & Map | 0/3 | Not started | - |
| 4. Check-ins, Badges & Volunteer Guides | 0/2 | Not started | - |
| 5. Polish, Deploy & Demo Readiness | 0/2 | Not started | - |
