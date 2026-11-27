# Avishkaar

## What This Is

Avishkaar is a visual-first, community-verified discovery platform for offbeat tourism, regional cuisines, and local heritage. Built for travelers tired of overcrowded tourist traps, it pairs a Pinterest-style masonry feed of photos and short vertical video clips with AI-structured commute, food, activity, support-local, and safety guides backed by community trust.

## Core Value

Surface lesser-known destinations, regional cuisines, and local heritage through community-verified **Vouches** and **Hidden Gem Score** ranking instead of mainstream popularity clickbait.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **AUTH-01**: Email and Google authentication via Supabase Auth with persistent user sessions
- [ ] **AUTH-02**: User profiles tracking `trailblazer_score`, tier (`Wanderer` 0–99, `Pathfinder` 100–299, `Local Legend` 300+), `is_guide`, `guide_region`, and `languages`
- [ ] **FEED-01**: Responsive Tailwind CSS masonry grid (`columns-2 md:columns-4`) supporting photos and short vertical video clips/embeds
- [ ] **FEED-02**: Category and region filter pills on the discovery feed
- [ ] **FEED-03**: Feed ranked by Hidden Gem Score `((Vouches * 2) + (Verified Check-ins * 5)) / log10(Mainstream Popularity Index + 10)`
- [ ] **SPOT-01**: "Post a Hidden Gem" flow uploading photos/short clips to Supabase Storage with raw location notes
- [ ] **SPOT-02**: Gemini API strict JSON extraction into structured `JSONB` cards (Last-Mile Commute, Must-Try Food, Local Activity, Safety) with manual fallback on timeout/error
- [ ] **SPOT-03**: Dedicated `/place/[id]` page with Commute, Must-Try Food, Local Activity cards and high-contrast Safety & "Do Not Do" banners (`Cultural Etiquette`, `Avoid After Dark`, `Low Network`, `Scam Alert`)
- [ ] **SPOT-04**: Interactive Leaflet + OpenStreetMap map displaying custom place pins, Support Local pins, and red safety warning markers
- [ ] **LOCL-01**: "Support Local" section on `/place/[id]` tagging local food vendors, artisans, homestays, and cultural practitioners (name, specialty, map pin, contact)
- [ ] **OFFL-01**: "Save for Offline" button caching commute, food, and safety cards in `localStorage` with zero-network viewer and clean print/PDF view
- [ ] **TRST-01**: Vouch button (+10 Trailblazer pts, +25 for Verified Visit Vouch) invoking a Postgres RPC to increment `profiles.trailblazer_score`
- [ ] **TRST-02**: Auto-unlocking Trailblazer tiers (`Wanderer` / `Pathfinder` / `Local Legend`) with priority visibility for `Local Legend`
- [ ] **CHKN-01**: Browser Geolocation API check-ins plus a "Demo Check-in" toggle for live judging
- [ ] **CHKN-02**: `user_badges` table auto-awarding milestone badges (*First Discovery*, *Foodie Scout*, *Local Legend*) + profile trophy shelf
- [ ] **GUID-01**: Trust-gated `is_guide` toggle unlocked for `Pathfinder` (100+ pts) / `Local Legend` (300+ pts) or seeded verified locals
- [ ] **GUID-02**: Matching local guides displayed on `/place/[id]` with languages spoken and "Request Guide" modal writing `Pending`/`Accepted` rows to `guide_requests`
- [ ] **SCAL-01**: Clean 5-table Postgres schema (`profiles`, `places`, `vouches`, `user_badges`, `guide_requests`), CDN media URLs, and stateless Next.js API routes ready for PostGIS/H3 and Redis post-hackathon

### Out of Scope

- Custom PostGIS/H3 radius engine and Redis read-replica caching in v1 — deferred post-hackathon (schema coordinates stay PostGIS-ready)
- Native iOS/Android mobile apps — web-first responsive Next.js App Router + offline pocket card suffices for 48-hour hackathon
- Real-time WebSocket chat between travelers and guides — `guide_requests` (`Pending` / `Accepted`) status workflow handles coordination for v1

## Context

- Blueprint source: `/Users/mani/Downloads/final_approach.md` (48-Hour Hackathon Blueprint, 0 features cut, 50–100 demo users scale).
- **Important runtime/demo resilience:** Since live judging or local dev may run before external Supabase/Gemini keys are populated, the app should support full Supabase + Gemini production mode via environment variables AND a clean demo-backed local/in-memory adapter fallback (or zero-crash graceful mode) when env vars are missing, clearly surfacing configuration status without breaking the demo walkthrough.

## Constraints

- **Tech stack**: Next.js (App Router) + Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Gemini API (strict JSON mode), Leaflet + OpenStreetMap — locked by blueprint
- **Database schema**: Exactly 5 core tables (`profiles`, `places`, `vouches`, `user_badges`, `guide_requests`) — check-in state stored on `vouches` (`checked_in_at`, `vouched_at`, `is_verified_visit`) to stay within 5 tables
- **Timeline**: 48-hour hackathon structure with 15–20 seeded real offbeat destinations and a 3-minute live demo flow

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vertical MVP phases aligned to 48h schedule | Keeps every phase demoable end-to-end | — Pending |
| Store check-in state inside `vouches` + `places.verified_checkins_count` | Honors exact 5-table schema while tracking both Geolocation check-ins and Verified Visit Vouches (+25 pts) | — Pending |
| Gate `is_guide` at Pathfinder (100+ pts) / Local Legend (300+ pts) or seeded verified local | Matches Section 4 Trust-Gated Volunteer Guides upgrade while giving Local Legends priority visibility | — Pending |
| Dual-mode Supabase + Demo/Local fallback layer | Guarantees live judging & local verification never crash if env keys aren't configured yet, while full Supabase SQL/RPCs stay first-class | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-27 after initialization*
