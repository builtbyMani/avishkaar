# Avishkaar Mobile (Expo iOS & Android)

Native iOS & Android companion app for Avishkaar, built with Expo SDK 58, Expo Router, React Native Reanimated, Gesture Handler, and Supabase.

## Features

- **Cinematic Preloader & Landing Hero**: Animated `AVISH[photo]KAAR` curtain with brand mark handoff, `Places off the beaten path.` hero (`Instrument Serif` + `Rozha One`), Hindi tagline (`आओ कभी हवेली पे`), and 60fps UI-thread animated sunset meadow horizon.
- **60/30/10 Wine Red Field-Guide System**: `#F5F0E6` parchment neutral, `#6B1D2F` Wine Red primary, `#D9A12B` Turmeric accent, `#A63D2A` safety alerts, regional card tints, and 100% custom SVG icons + Memoji avatars.
- **Discovery Feed & Detour Bar**: 2-column (3-column tablet) staggered masonry feed across all 58 destinations, clickable Gem Score formula breakdown, Detour Bar crowd-alternative matching, and keyless Leaflet + OpenStreetMap interactive map.
- **Location Detail (`place/[id]`)**: Swipeable gallery with `expo-video` clips & YouTube Shorts, GPS check-in (25 km haversine radius) + Simulate GPS Check-In toggle, Vouch (+10 / +25 Verified Visit), Community Safety Verify/Flag gate, 4 structured field-guide cards, zero-commission Support Local actions (Navigate, WhatsApp, Call, Direct UPI QR), Volunteer Local Guides + Request Guide sheet, Offline Pocket saving, and Print/PDF export.
- **Post a Hidden Gem**: Camera/Library upload (`<8 MB` video limit), GPS coordinate autofill, multilingual field-note auto-structuring (English, Hindi, Telugu, Tamil, Hinglish), and Support Local spotlight tagging.

## Setup

1. Copy `.env.example` to `.env`:
   - Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` for live Supabase Postgres, Auth (Google OAuth + Email Magic Link / OTP), and Storage (`place-media`), OR leave blank for offline-first Demo Mode.
   - Optionally set `EXPO_PUBLIC_API_URL` (e.g. your deployed Next.js URL) for server-side Gemini extraction and Detour AI matching; deterministic multilingual/crowd fallbacks activate automatically when unset or offline.
2. In Supabase Auth **URL Configuration**, add `avishkaar://auth/callback` (and your `exp://...` URL during Expo Go testing) to **Redirect URLs** for Google OAuth and Email Magic Links.

## Commands

```bash
npm install
npm start          # Start Expo dev server (scan QR in Expo Go on iOS/Android)
npm run ios        # Open iOS simulator
npm run android    # Open Android emulator
npm run typecheck  # TypeScript strict check
npm test           # Run unit tests
```
