# Phase 6: Anti-Overtourism Upgrades, Detour Bar, Multilingual AI & Verified Safety - Context

**Gathered:** 2026-11-27
**Status:** Ready for planning / awaiting execution authorization

<domain>
## Phase Boundary

Add all new and upgraded features from `f2.md` on top of existing Phases 1–5 without breaking the 5-table schema, existing seeded destinations, offline pocket cards, or dual-mode (Supabase + Demo) persistence.

</domain>

<decisions>
## Implementation Decisions

### Roadmap & Plan Organization
- **D-01:** Organize all `f2.md` upgrades into a single Phase 6 with 3 sequential waves/plans (`06-01` Detour+Feed+Shorts, `06-02` Multilingual AI+Living Heritage+Support Local Actions, `06-03` Safety Verify/Flag Gate+Seeds+Demo Polish).

### Short Video & YouTube Shorts Behavior
- **D-02:** Video clips cap at `<8 MB` upload in `/api/upload` and play muted on hover (with tap-to-toggle on mobile) instead of continuous autoplay; support YouTube Shorts embed URLs automatically in `MediaCardPlayer` and `/submit`.

### Community-Verified Safety Gate & 5-Table Preservation
- **D-03:** Store `verifiedBy`, `flaggedBy`, and `authorTier` inside `places.safety_alerts` JSONB — **Reversibility:** reversible — avoids adding a 6th table while keeping the 5-table schema (`profiles`, `places`, `vouches`, `user_badges`, `guide_requests`) intact.
- **D-04:** Backfill all existing 16 seeded places' safety alerts with `authorTier` (`Pathfinder` / `Local Legend`) and `verifiedBy` so existing banners remain publicly visible; newly submitted alerts from `Wanderer` (<100 pts) stay hidden from the public banner until verified by a `Pathfinder+` or 2+ users.

### Demo Script & Narrative Additions
- **D-05:** Add *Pandavula Gutta* and *Ziro Valley* to `SEED_PLACES` (18 total, within 15–20 target), rename the check-in toggle label to **"Simulate GPS Check-In"**, and add a concise **Impact & Architecture** modal/drawer in `Navbar` highlighting the 67.4% tourism concentration stat, Swadesh Darshan 2.0 / CBDD, and the 4-box stack.

### Collision Guardrails
- Keep Postgres column `places.structured_cards` unchanged (extend with optional `livingHeritage?: string[]` instead of renaming to `structured_guide`).
- Keep `Gem Score` badge clickable independently of card `<Link href="/place/[id]">` via `stopPropagation` / button placement outside `<Link>`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `/Users/mani/Downloads/f2.md` — Improved 48-hour hackathon blueprint defining Detour Bar, Explainable Gem Score, <8 MB hover clips & YouTube Shorts, Multilingual AI + Living Heritage, Zero-Commission Vendor Action Cards, Verified Safety Advisories, and Dual-Tab Demo Script.
- `.planning/PROJECT.md` & `.planning/REQUIREMENTS.md` — Core constraints (5-table schema, Next.js + Supabase + Gemini + Leaflet stack).
- `supabase/migrations/0001_init.sql` — Canonical 5-table schema and RPC signatures.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/MediaCardPlayer.tsx` — Existing photo/video renderer for feed & detail hero.
- `src/lib/gemini.ts` — Gemini strict JSON extractor + heuristic fallback.
- `src/lib/store.ts` — Dual-mode Supabase + `.data/demo-store.json` data layer.
- `src/app/page.tsx`, `src/app/place/[id]/page.tsx`, `src/app/submit/page.tsx` — Target UI pages.

### Integration Points
- `src/app/page.tsx` — Detour Bar mounts above category/region pills; `Gem Score` popover attaches to card footer/pill safely outside `<Link>`.
- `src/app/place/[id]/page.tsx` — 4th `Living Heritage & Etiquette` card, Support Local action buttons + UPI QR modal, Safety Verify/Flag controls, and `"Simulate GPS Check-In"` label.

</code_context>

<specifics>
## Specific Ideas

- Quick detour chips on feed: *"Ooty"*, *"Goa"*, *"Hampi"*.
- Support Local action buttons: **Navigate to Pin**, **WhatsApp / Call**, and **Direct UPI QR** preview (*0% platform commission*).

</specifics>

<deferred>
## Deferred Ideas

None — all `f2.md` upgrades fit cleanly into Phase 6 without touching PostGIS/Redis post-hackathon scope.

</deferred>

---

*Phase: 06-anti-overtourism-upgrades-detour-bar-multilingual-ai-verifie*
*Context gathered: 2026-11-27*
