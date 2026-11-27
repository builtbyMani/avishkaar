<!-- GSD:project-start source:PROJECT.md -->

## Project

**Avishkaar**

Avishkaar is a visual-first, community-verified discovery platform for offbeat tourism, regional cuisines, and local heritage. Built for travelers tired of overcrowded tourist traps, it pairs a Pinterest-style masonry feed of photos and short vertical video clips with AI-structured commute, food, activity, support-local, and safety guides backed by community trust.

**Core Value:** Surface lesser-known destinations, regional cuisines, and local heritage through community-verified **Vouches** and **Hidden Gem Score** ranking instead of mainstream popularity clickbait.

### Constraints

- **Tech stack**: Next.js (App Router) + Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), Gemini API (strict JSON mode), Leaflet + OpenStreetMap — locked by blueprint
- **Database schema**: Exactly 5 core tables (`profiles`, `places`, `vouches`, `user_badges`, `guide_requests`) — check-in state stored on `vouches` (`checked_in_at`, `vouched_at`, `is_verified_visit`) to stay within 5 tables
- **Timeline**: 48-hour hackathon structure with 15–20 seeded real offbeat destinations and a 3-minute live demo flow

<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->

## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.agents/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
