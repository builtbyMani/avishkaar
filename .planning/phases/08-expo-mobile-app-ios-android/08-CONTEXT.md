# Phase 8 Context: Expo Mobile App (iOS & Android)

**Phase:** 08 — Expo Mobile App (iOS & Android)
**Status:** Planned & Executing
**Created:** 2026-11-28

## Goal

Deliver a native iOS & Android mobile application in `mobile/` using Expo (SDK 58, Expo Router, React Native Reanimated, Gesture Handler, and Supabase) with complete feature parity to the live Next.js web application, platform-specific polish for both iOS and Android, and fluid 60/120fps physics-driven animations.

## Architectural Decisions

1. **Self-Contained `mobile/` Workspace (`Expo Router` + `New Architecture`)**
   - Lives at `mobile/` so the root Next.js app, tests, lint, and production build remain completely undisturbed.
   - Root `tsconfig.json` excludes `mobile` and root `eslint.config.mjs` ignores `mobile/**` so root CI stays isolated and green.

2. **60/30/10 Wine Red Visual & Typographic Fidelity**
   - Exact palette parity: `#F5F0E6` parchment canvas, `#FAF7F0` warm surface, `#EBE4D5` warm well, `#2B141A` ink, `#61454D` muted ink, `#6B1D2F` Wine Red primary, `#D9A12B` Turmeric accent, `#A63D2A` muted brick alerts, `#C85A32` terracotta accent.
   - Bundled custom fonts (`RozhaOne-Regular.ttf`, `Modak-Regular.ttf`, `InstrumentSerif`) plus platform SF / Roboto bold weights for card headings.
   - 100% custom `react-native-svg` vector icons (`Icons.tsx`, `AvishkaarLogo.tsx`, `MemojiAvatar.tsx`) — zero `lucide-react`, zero raw Unicode icons.

3. **Fluid Motion System (UI-Thread Reanimated + Haptics)**
   - Preloader (`AVISH[photo]KAAR` split-reveal curtain + live progress + brand handoff) with reduced-motion accessibility gating.
   - Landing hero (`Places off the beaten path.`, `Rozha One` statement + Hindi `आओ कभी हवेली पे`, `Explore Gems` CTA) backed by a 60fps native SVG + Reanimated sunset meadow horizon (replacing WebGL Three.js cleanly across iOS & Android).
   - Critically damped springs (`damping: 26, stiffness: 320`) for state/tab indicators, tactile `scale(0.965)` press feedback with `expo-haptics`, staggered masonry card entrances, interactive bottom-sheet gestures, and Reanimated scroll progress bar.

4. **Cross-Platform Native Hardware & Offline Resilience**
   - Bundled all 20 local place images + 6 preloader images statically so `/images/places/*.jpg` paths from Supabase or Seed data resolve offline instantaneously on iOS & Android.
   - Keyless Leaflet + OpenStreetMap interactive map via `react-native-webview` (avoiding Android Google Maps API key blank-grid failures while matching Wine Red / Amber / Red pin semantics + deep-linking to `/place/[id]`), plus native offline coordinate list fallback.
   - Native `expo-video` short clips, YouTube Shorts support, `expo-location` 25 km GPS check-in + Simulate GPS toggle, `expo-image-picker` with `<8 MB` video cap, `expo-print` + `expo-sharing` PDF pocket cards, `AsyncStorage` offline persistence, and Supabase Auth (`Google OAuth` via `expo-web-browser` + `expo-auth-session` + `avishkaar://` deep linking & Email Magic Link / OTP) with seamless Demo Mode fallback.
