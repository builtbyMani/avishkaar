---
phase: 06-anti-overtourism-upgrades-detour-bar-multilingual-ai-verifie
plan: 03
status: complete
completed_at: 2026-11-27
requirements: [SAFE-01, DEMO-01]
files_modified:
  - src/lib/domain.ts
  - src/lib/store.ts
  - src/app/api/places/[id]/safety-verify/route.ts
  - src/data/seed.ts
  - src/app/place/[id]/page.tsx
  - src/components/Navbar.tsx
  - tests/domain.test.ts
---

# Plan 06-03 Summary

Implemented Wave 3 of Phase 6:
- Added `isSafetyAlertPublic` and `applySafetyVote` in `src/lib/domain.ts`, `verifyOrFlagSafetyAlert` in `src/lib/store.ts`, and `POST /api/places/[id]/safety-verify` storing votes inside `places.safety_alerts` JSONB while preserving the 5-table schema.
- Backfilled all 16 existing places and added *Pandavula Gutta* and *Ziro Valley* in `src/data/seed.ts` (18 places total, all with `Living Heritage`, vendor `upiId` handles, and Pathfinder+ verified alerts).
- Added Safety Verify/Flag UI + pending safety review box and `"Simulate GPS Check-In"` label in `src/app/place/[id]/page.tsx`, plus the **Impact & Stack** modal in `src/components/Navbar.tsx`.
- Extended `tests/domain.test.ts` and verified tests, production build, and live HTTP E2E flow.
