# Requirements: Avishkaar

**Defined:** 2026-11-27
**Core Value:** Surface lesser-known destinations, regional cuisines, and local heritage through community-verified **Vouches** and **Hidden Gem Score** ranking instead of mainstream popularity clickbait.

## v1 Requirements

### Authentication & Profiles

- [ ] **AUTH-01**: User can sign up and log in with Email/Password or Google via Supabase Auth and persist session across refreshes
- [ ] **AUTH-02**: User profile stores and displays `trailblazer_score`, tier (`Wanderer`, `Pathfinder`, `Local Legend`), `is_guide`, `guide_region`, and `languages`

### Discovery Feed & Hidden Gem Ranking

- [ ] **FEED-01**: User can browse a responsive Tailwind Masonry grid (`columns-2 md:columns-4`) rendering both high-res photos and short-form vertical video clips/embeds
- [ ] **FEED-02**: User can filter the discovery feed using category and region pills
- [ ] **FEED-03**: Feed ranks places by Hidden Gem Score `((Vouches * 2) + (Verified Check-ins * 5)) / log10(Mainstream Popularity Index + 10)`

### Places, AI Structuring, Safety & Maps

- [ ] **SPOT-01**: Authenticated user can submit "Post a Hidden Gem" uploading photos/short clips to Supabase Storage with raw description text
- [ ] **SPOT-02**: Gemini API (strict JSON mode) extracts raw description into structured `JSONB` cards (**Last-Mile Commute**, **Must-Try Food**, **Local Activity**) and `safety_alerts`, with manual fallback if Gemini times out or errors
- [ ] **SPOT-03**: Location page `/place/[id]` displays structured Commute, Must-Try Food, Local Activity cards and a high-contrast Safety & "Do Not Do" banner (`Cultural Etiquette`, `Avoid After Dark`, `Low Network`, `Scam Alert`)
- [ ] **SPOT-04**: Interactive Leaflet + OpenStreetMap map renders custom place pins, Support Local pins, and red safety warning markers

### Local Economy & Offline Pocket Card

- [ ] **LOCL-01**: Location page `/place/[id]` displays a "Support Local" section tagging food vendors, artisans, homestays, and cultural practitioners (name, specialty, map pin, contact)
- [ ] **OFFL-01**: "Save for Offline" button caches the location's commute, food, and safety cards in `localStorage` for zero-network access and provides a clean print/PDF view

### Vouch & Trailblazer Trust System

- [ ] **TRST-01**: User can Vouch for a place (+10 pts standard, +25 pts Verified Visit Vouch after check-in), triggering a Postgres RPC to increment author `profiles.trailblazer_score`
- [ ] **TRST-02**: Trailblazer tiers auto-unlock (`0–99` Wanderer, `100–299` Pathfinder, `300+` Local Legend) and grant `Local Legend` priority visibility

### Check-ins, Badges & Volunteer Guides

- [ ] **CHKN-01**: User can check in via browser Geolocation API or a "Demo Check-in" toggle for live judging, unlocking Verified Visit Vouch and incrementing `verified_checkins`
- [ ] **CHKN-02**: `user_badges` table auto-awards milestone badges (*First Discovery*, *Foodie Scout*, *Local Legend*) and displays them on the user's profile trophy shelf
- [ ] **GUID-01**: Only `Pathfinder` (`100+` pts), `Local Legend` (`300+` pts), or seeded verified locals can toggle `is_guide` and configure `guide_region` and `languages`
- [ ] **GUID-02**: `/place/[id]` lists matching local guides (with languages spoken) and a "Request Guide" modal writing `Pending` / `Accepted` records to `guide_requests`

### Architecture & Scale Readiness

- [ ] **SCAL-01**: 5-table schema (`profiles`, `places`, `vouches`, `user_badges`, `guide_requests`), CDN media URLs, coordinates ready for PostGIS/H3, and stateless Next.js API routes

## v2 Requirements

### Geospatial & Caching Scale

- **SCAL-02**: Enable PostGIS + H3 hexagonal radius queries ("Hidden gems within 50km")
- **SCAL-03**: Add Redis feed caching and Postgres read replicas for 100k+ concurrent users

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time WebSocket chat | `guide_requests` (`Pending` / `Accepted`) workflow covers 48-hour coordination without WebSocket infra |
| Native mobile apps | Responsive Next.js + `localStorage` Offline Pocket Card covers mobile + low-network needs in 48 hours |
| Paid payment gateway for guides | Volunteer guide model focuses on community trust without payment compliance overhead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-02 | Phase 1 | Pending |
| SCAL-01 | Phase 1 | Pending |
| AUTH-01 | Phase 2 | Pending |
| FEED-01 | Phase 2 | Pending |
| FEED-02 | Phase 2 | Pending |
| FEED-03 | Phase 2 | Pending |
| SPOT-01 | Phase 2 | Pending |
| TRST-01 | Phase 2 | Pending |
| TRST-02 | Phase 2 | Pending |
| SPOT-02 | Phase 3 | Pending |
| SPOT-03 | Phase 3 | Pending |
| SPOT-04 | Phase 3 | Pending |
| LOCL-01 | Phase 3 | Pending |
| OFFL-01 | Phase 3 | Pending |
| CHKN-01 | Phase 4 | Pending |
| CHKN-02 | Phase 4 | Pending |
| GUID-01 | Phase 4 | Pending |
| GUID-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-27*
*Last updated: 2026-11-27 after initial definition*
