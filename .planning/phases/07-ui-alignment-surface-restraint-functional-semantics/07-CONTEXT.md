# Phase 7: UI Alignment, Surface Restraint & Functional Semantics - Context

**Gathered:** 2026-11-27
**Status:** Ready for UI-SPEC & planning

<domain>
## Phase Boundary

Deliver a disciplined visual/UI refinement pass across all user-facing pages (`/` Discover, `/place/[id]` Detail, `/submit`, `/offline`, `/profile`) and shared UI shell (`Navbar`, `MediaCardPlayer`, `LeafletMap`, `AuthModal`) without altering database schema, API contracts, domain logic, or existing interactive features.

</domain>

<decisions>
## Implementation Decisions

### 1. Card Grid & Spacing Consistency (`UI-01`)
- **D-01 (Aligned CSS Grid instead of Jagged Masonry):** Replace `columns-1 gap-4 space-y-4 sm:columns-2 md:columns-4` (and matching skeleton container) in `src/app/page.tsx` with a responsive aligned CSS Grid (`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4`), normalize compact card media height in `src/components/MediaCardPlayer.tsx` (`aspect-[4/3]` when `compact` is true), make `<article>` cards `flex h-full flex-col`, and pin the bottom row (`author` / `vendors` / `vouch`) via `mt-auto` so every card row aligns across baselines and gutters.
- **D-02 (Even Vertical & Card Grid Rhythm):** Standardize main section vertical gaps to `space-y-6` (`space-y-8` on `/profile` -> `space-y-6`), standardize card inner padding (`p-5` for major cards/modules, `p-4` for feed cards & compact sub-cards), and align equal-height columns on Detour Bar (`md:grid-cols-3`), `/place/[id]` 4-module cards (`md:grid-cols-2 lg:grid-cols-4`), `/place/[id]` vendor cards, and `/offline` 2-col grid.

### 2. Surface Restraint — Strip Gradients, Glows & Blur (`UI-02`)
- **D-03 (Ground-truth Baseline & Exact Targets):** Zero `purple-*`, `violet-*`, or `indigo-*` Tailwind classes exist in `src/`. To eliminate "AI-generated" gradient/glow finishes present in the codebase:
  - Replace hero gradient `bg-gradient-to-br from-[#1B3B36] via-[#224741] to-[#2F5951]` (`src/app/page.tsx`) with flat solid `#FAF7F2` / `#FFFFFF` bordered surface or crisp solid `#1B3B36` header band without gradient stops.
  - Replace progress bar gradient `bg-gradient-to-r from-[#C85A32] to-amber-500` (`src/app/profile/page.tsx`) with solid functional tier/accent fill.
  - Remove `backdrop-blur-md` (`src/components/Navbar.tsx`) and `backdrop-blur-xs` (`AuthModal.tsx`, `Navbar.tsx`, `MediaCardPlayer.tsx`, `src/app/page.tsx`, `src/app/place/[id]/page.tsx`).
  - Flatten heavy modal/card glow & float effects: replace `shadow-2xl` -> crisp `border border-[#D6CEC0] shadow-none`, remove `hover:-translate-y-0.5 hover:shadow-md` in favor of border contrast (`hover:border-[#1B3B36]`), and remove rgba halo `box-shadow` glow from `LeafletMap.tsx` pin markers (`rgba(220,38,38,0.45)`, `rgba(0,0,0,0.3)` -> crisp 2px border contrast).

### 3. Clean Vector Icons Replacing Raw Symbols & Sparkles (`UI-03`)
- **D-04 (Ground-truth Baseline & Exact Targets):** Zero UTF-8 picture emojis exist in `src/`. Replace raw Unicode glyphs & decorative sparkle icons:
  - Replace `"Checked In ✓"` (`src/app/place/[id]/page.tsx`) and `"Unlocked ✓"` (`src/app/profile/page.tsx`) with `<Check className="h-3.5 w-3.5" />`.
  - Replace `<li>• {item}</li>` bullet character (`src/app/offline/page.tsx`) with a clean `lucide-react` item marker / structured list spacing (`ChevronRight` or `Compass`).
  - Replace raw HTML symbols in `src/components/LeafletMap.tsx` (`★` pin, `!` warning text, `Open Guide →`) with crisp inline SVG vector icons (pin dot/triangle/compass geometry).
  - Replace decorative `<Sparkles>` (`src/app/page.tsx` hero pill, `src/app/submit/page.tsx` Gemini action button) with purposeful icons (`Compass` / `SlidersHorizontal` or `Wand2` / `FileCheck2`).

### 4. Purposeful Semantic Color Encoding (`UI-04`)
- **D-05 (Color With a Job):** Export shared style lookup maps in `src/lib/domain.ts` (single source of truth reused across `Navbar`, `Discover`, `PlaceDetail`, `Profile`, `AuthModal`, `Offline`):
  - **Categories** (`Hidden Village`, `Regional Cuisine`, `Living Heritage`, `Sacred & Craft`, `Nature & Trail`) each get a distinct high-contrast tint/border pill class across filter pills, feed cards, and `/place/[id]` tags so users scan card types at a glance.
  - **Trailblazer Tiers** (`Wanderer`, `Pathfinder`, `Local Legend`) keep single-meaning role coding across `Navbar`, `AuthModal` persona cards, and `/profile` tier bar (`Wanderer` neutral stone, `Pathfinder` teal-emerald, `Local Legend` deep forest ink `#1B3B36` with amber ring/badge).
  - **4 Guide Modules** (`Commute`, `Food`, `Activities`, `Living Heritage`) on `/place/[id]` and `/offline` use distinct subtle top/left accent bars (`border-l-4`) matching module domain (route slate, culinary terracotta, trail emerald, heritage ochre) instead of repeating terracotta on every icon.
  - **Strict Reserve:** Red exclusively for Safety Alerts (`Verified` / `Pending`); Emerald exclusively for Verified Check-In / Vouched / 0% Commission actions.

### 5. High-Signal Header Telemetry Without Filler (`UI-05`)
- **D-06 (Utilitarian Navbar & Header Strips):**
  - `src/components/Navbar.tsx`: Remove promotional tagline `"OFFBEAT HERITAGE & TRUST"`; display Brand link (`Avishkaar`) + operational links + live runtime badge (`Demo` vs `Supabase Live`) + active user identity/tier/points button (`Sign In` when signed out). Keep `Impact & Stack` trigger compact and secondary.
  - `src/app/page.tsx`: Replace the large gradient Hero banner (`"Ranked by Hidden Gem Score — Never Paid Ads or Tourist Traps"` + headline + 2-line marketing pitch) with a compact **Discovery Summary Header** containing live telemetry readouts (`{places.length} Verified Gems`, `{regions.length - 1} Regions`, active filter/Detour count, total local vendors) alongside `Post a Hidden Gem` and `Map View / Grid View` controls.
  - `src/app/submit/page.tsx` & `src/app/offline/page.tsx`: Condense conversational lead paragraphs into crisp operational specs (`Image / <8 MB MP4 / YouTube Short · Auto-extracts Commute, Food, Activity, Heritage & Safety`, `Cached locally in browser storage · Print-ready`).

</decisions>

<canonical_refs>
## Canonical References

- `.planning/REQUIREMENTS.md` — `UI-01`..`UI-05`
- `src/lib/domain.ts` — canonical `REGIONS`, `PLACE_CATEGORIES`, `TrailblazerTier`, `SafetyAlert` logic
- `src/app/page.tsx`, `src/app/place/[id]/page.tsx`, `src/app/submit/page.tsx`, `src/app/offline/page.tsx`, `src/app/profile/page.tsx`
- `src/components/Navbar.tsx`, `src/components/MediaCardPlayer.tsx`, `src/components/LeafletMap.tsx`, `src/components/AuthModal.tsx`

</canonical_refs>

<code_context>
## Collision & Feature Preservation Guardrails
- Keep `Detour Bar` ("Instead of X, Go Here"), clickable `Gem Score` formula popover (outside `<Link>` via `stopPropagation`), `<8 MB` hover/tap clips + YouTube Shorts embed, 4 structured cards + offline/`window.print()`, Safety Verify/Flag, Guide Request, and Honest Direct UPI Pay/Copy modal 100% intact.
- Preserve existing `npm test` (11 unit tests) and zero Postgres/store/API breaking changes.
</code_context>

---
*Phase: 07-ui-alignment-surface-restraint-functional-semantics*
*Context gathered: 2026-11-27*
