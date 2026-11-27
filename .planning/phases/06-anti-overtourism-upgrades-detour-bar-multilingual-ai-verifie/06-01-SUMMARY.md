---
phase: 06-anti-overtourism-upgrades-detour-bar-multilingual-ai-verifie
plan: 01
status: complete
completed_at: 2026-11-27
requirements: [DETR-01, DETR-02, GEMX-01, SHRT-01]
files_modified:
  - src/lib/detour.ts
  - src/app/api/detour/route.ts
  - src/app/page.tsx
  - src/components/MediaCardPlayer.tsx
  - src/app/api/upload/route.ts
---

# Plan 06-01 Summary

Implemented Wave 1 of Phase 6:
- Added `src/lib/detour.ts` and `POST /api/detour` returning top 3 lower-crowd detour alternatives with vibe match reasons, crowd reduction percentages, and commute summaries (Gemini API with deterministic fallback).
- Added the **"Instead of X, Go Here" Detour Bar** (`Skip Ooty`, `Skip Goa`, `Skip Hampi`) and detached each card's clickable **`Gem Score` math popover** outside `<Link>` in `src/app/page.tsx`.
- Upgraded `MediaCardPlayer.tsx` for muted hover-to-play short clips + touch play toggle + YouTube Shorts iframe embeds (`extractYouTubeEmbedId`), and enforced `<8 MB` video upload limit in `src/app/api/upload/route.ts`.
