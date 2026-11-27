# Requirements: Avishkaar

**Defined:** 2026-11-27
**Core Value:** Surface lesser-known destinations, regional cuisines, and local heritage through community-verified **Vouches** and **Hidden Gem Score** ranking instead of mainstream popularity clickbait.

## v1 Requirements (Phases 1–5 Complete)

### Authentication & Profiles

- [x] **AUTH-01**: User can sign up and log in with Email/Password or Google via Supabase Auth and persist session across refreshes
- [x] **AUTH-02**: User profile stores and displays `trailblazer_score`, tier (`Wanderer`, `Pathfinder`, `Local Legend`), `is_guide`, `guide_region`, and `languages`

### Discovery Feed & Hidden Gem Ranking

- [x] **FEED-01**: User can browse a responsive Tailwind Masonry grid (`columns-2 md:columns-4`) rendering both high-res photos and short-form vertical video clips/embeds
- [x] **FEED-02**: User can filter the discovery feed using category and region pills
- [x] **FEED-03**: Feed ranks places by Hidden Gem Score `((Vouches * 2) + (Verified Check-ins * 5)) / log10(Mainstream Popularity Index + 10)`

### Places, AI Structuring, Safety & Maps

- [x] **SPOT-01**: Authenticated user can submit "Post a Hidden Gem" uploading photos/short clips to Supabase Storage with raw description text
- [x] **SPOT-02**: Gemini API (strict JSON mode) extracts raw description into structured `JSONB` cards (**Last-Mile Commute**, **Must-Try Food**, **Local Activity**) and `safety_alerts`, with manual fallback if Gemini times out or errors
- [x] **SPOT-03**: Location page `/place/[id]` displays structured Commute, Must-Try Food, Local Activity cards and a high-contrast Safety & "Do Not Do" banner (`Cultural Etiquette`, `Avoid After Dark`, `Low Network`, `Scam Alert`)
- [x] **SPOT-04**: Interactive Leaflet + OpenStreetMap map renders custom place pins, Support Local pins, and red safety warning markers

### Local Economy & Offline Pocket Card

- [x] **LOCL-01**: Location page `/place/[id]` displays a "Support Local" section tagging food vendors, artisans, homestays, and cultural practitioners (name, specialty, map pin, contact)
- [x] **OFFL-01**: "Save for Offline" button caches the location's commute, food, and safety cards in `localStorage` for zero-network access and provides a clean print/PDF view

### Vouch & Trailblazer Trust System

- [x] **TRST-01**: User can Vouch for a place (+10 pts standard, +25 pts Verified Visit Vouch after check-in), triggering a Postgres RPC to increment author `profiles.trailblazer_score`
- [x] **TRST-02**: Trailblazer tiers auto-unlock (`0–99` Wanderer, `100–299` Pathfinder, `300+` Local Legend) and grant `Local Legend` priority visibility

### Check-ins, Badges & Volunteer Guides

- [x] **CHKN-01**: User can check in via browser Geolocation API or a "Demo Check-in" toggle for live judging, unlocking Verified Visit Vouch and incrementing `verified_checkins`
- [x] **CHKN-02**: `user_badges` table auto-awards milestone badges (*First Discovery*, *Foodie Scout*, *Local Legend*) and displays them on the user's profile trophy shelf
- [x] **GUID-01**: Only `Pathfinder` (`100+` pts), `Local Legend` (`300+` pts), or seeded verified locals can toggle `is_guide` and configure `guide_region` and `languages`
- [x] **GUID-02**: `/place/[id]` lists matching local guides (with languages spoken) and a "Request Guide" modal writing `Pending` / `Accepted` records to `guide_requests`

### Architecture & Scale Readiness

- [x] **SCAL-01**: 5-table schema (`profiles`, `places`, `vouches`, `user_badges`, `guide_requests`), CDN media URLs, coordinates ready for PostGIS/H3, and stateless Next.js API routes

## v1.1 Phase 6 Requirements (Planned — Pending Authorization)

### Anti-Overtourism Upgrades (`f2.md`)

- [ ] **DETR-01**: User can enter an overcrowded destination (e.g., Ooty, Goa, Hampi) in the top-of-feed Detour Bar to reveal top 3 lower-crowd alternatives with vibe & commute comparisons
- [ ] **DETR-02**: Detour matching works via Gemini API with deterministic local tag/crowd fallback when rate-limited or unconfigured
- [ ] **GEMX-01**: Clicking any feed card's `Gem Score` badge opens a live math breakdown popover (`Community Vouches`, `Verified Check-ins`, `Crowd Penalty`) without navigating away
- [ ] **SHRT-01**: Video clips play muted on hover (capped at `<8 MB` on upload) and YouTube Shorts embed URLs render cleanly
- [ ] **MULT-01**: Multilingual write-time Gemini extraction supports English, Hindi, Telugu, Tamil, and Hinglish notes and adds a 4th **Living Heritage & Etiquette** card
- [ ] **VEND-01**: Zero-commission Support Local cards expose **Navigate to Pin**, **WhatsApp / Call**, and **Direct UPI QR** preview actions
- [ ] **SAFE-01**: Safety advisories support 1-click **Verify / Flag** votes inside `places.safety_alerts` JSONB and stay hidden publicly unless posted by `Pathfinder+` or verified by `2+` users (with seeded alerts backfilled)
- [ ] **DEMO-01**: Seed dataset includes *Pandavula Gutta* & *Ziro Valley* (18 places total), toggle reads **"Simulate GPS Check-In"**, and Navbar offers an **Impact & Stack** drawer (67.4% stat + Swadesh Darshan 2.0 / CBDD + 4-box stack)

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
| AUTH-02 | Phase 1 | Complete |
| SCAL-01 | Phase 1 | Complete |
| AUTH-01 | Phase 2 | Complete |
| FEED-01 | Phase 2 | Complete |
| FEED-02 | Phase 2 | Complete |
| FEED-03 | Phase 2 | Complete |
| SPOT-01 | Phase 2 | Complete |
| TRST-01 | Phase 2 | Complete |
| TRST-02 | Phase 2 | Complete |
| SPOT-02 | Phase 3 | Complete |
| SPOT-03 | Phase 3 | Complete |
| SPOT-04 | Phase 3 | Complete |
| LOCL-01 | Phase 3 | Complete |
| OFFL-01 | Phase 3 | Complete |
| CHKN-01 | Phase 4 | Complete |
| CHKN-02 | Phase 4 | Complete |
| GUID-01 | Phase 4 | Complete |
| GUID-02 | Phase 4 | Complete |
| DETR-01 | Phase 6 | Planned |
| DETR-02 | Phase 6 | Planned |
| GEMX-01 | Phase 6 | Planned |
| SHRT-01 | Phase 6 | Planned |
| MULT-01 | Phase 6 | Planned |
| VEND-01 | Phase 6 | Planned |
| SAFE-01 | Phase 6 | Planned |
| DEMO-01 | Phase 6 | Planned |

**Coverage:**
- v1 requirements: 18/18 complete
- v1.1 (Phase 6) requirements: 8 mapped, 0 unmapped ✓

---
*Requirements defined: 2026-11-27*
*Last updated: 2026-11-27 after planning Phase 6 (`f2.md` upgrades)*
