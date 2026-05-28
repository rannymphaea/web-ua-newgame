# NEWGAME — Frontend Codebase

> **Next.js 14 · TypeScript · Vanilla CSS · Firebase**

---

## Overview

NEWGAME is a community platform for game developers at Universitas Andalas. This monorepo contains the frontend application at `apps/web/`.

---

## Setup

```bash
# Install dependencies (from repo root)
npm install

# Start dev server
cd apps/web
npm run dev

# Build production bundle
npm run build
```

Default dev port: `http://localhost:3000`

---

## Dark Mode Spec

**Engine**: `src/lib/theme-engine.ts`
- `useTheme()` — React hook. Returns `{ isDark, toggleTheme, theme }`.
- `THEME_SCRIPT` — Anti-FOUC inline script injected into `<head>` before first paint.
- Reads `localStorage.theme` → falls back to `prefers-color-scheme`.
- Applies `.dark` class to `<html>`. All tokens respond automatically.

**Token Architecture**: `src/styles/globals.css`
- All colors are CSS custom properties under `:root` and `:root.dark`.
- Canonical prefix: `--clr-*`
- Legacy aliases preserved: `--novel-*` maps to `--clr-*` for landing page compatibility.
- **Zero hardcoded hex values in components.** All components use `var(--clr-*)`.

**Theme Morph**: `transition: background 350ms ease, color 350ms ease, border-color 350ms ease` applied globally via `*` selector. GPU composited. Zero layout shift.

---

## Sidebar Spec

**File**: `src/components/layout/Sidebar.tsx`

| Feature          | Implementation                                |
|------------------|-----------------------------------------------|
| Stagger entrance | `animation-delay: ${idx * 55}ms` per nav item |
| Elastic hover    | `transform: translateX(4px) scale(1.01)`       |
| Active indicator | `.nav-indicator` — neon bar, glow pulse        |
| Collapse         | `.collapsed` class — 64px width, icon-only     |
| Mobile           | `position:fixed`, blur backdrop overlay        |
| Roles            | Nav items filtered by `userData.role`          |

Mobile breakpoint: `≤768px`. Slide-in via `translateX(-100%)` → `translateX(0)`.

---

## Motion Spec

**System**: Defined in `globals.css` under `@keyframes`.

| Animation         | Class / Keyframe         | Duration | Easing                     |
|-------------------|--------------------------|----------|-----------------------------|
| Fade in           | `.animate-fade-in`       | 0.5s     | ease                        |
| Slide up          | `.animate-slide-up`      | 0.4s     | cubic-bezier(0.16,1,0.3,1) |
| Float (loop)      | `.animate-float`         | 4s       | ease-in-out infinite        |
| Card float        | `.card-hover:hover`      | 0.3s     | cubic-bezier(0.4,0,0.2,1)  |
| Spring modal      | `.animate-spring-modal`  | 0.45s    | cubic-bezier(0.16,1,0.3,1) |
| Button depth      | `.btn-depth:active`      | 0.1s     | ease                        |
| Reveal (scroll)   | `.reveal → .visible`     | 0.6s     | cubic-bezier(0.16,1,0.3,1) |
| Nav stagger       | `.nav-stagger`           | 0.4s     | staggered delay             |
| Skeleton shimmer  | `.skeleton`              | 1.5s     | ease-in-out infinite        |
| Orb float         | `@keyframes floatOrb`    | 18-22s   | ease-in-out infinite        |
| Heading shimmer   | `@keyframes shimmer`     | 3s       | ease-in-out infinite        |
| XP glow pulse     | `@keyframes glowPulse`   | 2s       | ease-in-out infinite        |

All animations use `will-change: transform, opacity` for GPU compositing.

---

## Code Standards

```
✅ All colors via CSS variables (var(--clr-*))
✅ No hardcoded hex/rgb in components
✅ No <style jsx> blocks (moved to globals.css or inline <style>)
✅ TypeScript: no `any` types — use unknown + type narrowing
✅ Error handling: catch (err: unknown) { err instanceof Error ? err.message : 'Error' }
✅ All interactive elements have aria-label or visible text
✅ All form inputs have htmlFor + id
✅ Import order: React → Next → External → Internal → Types
```

---

## Folder Map

```
apps/web/src/
├── app/
│   ├── layout.tsx              # Root layout — fonts, anti-FOUC script
│   ├── page.tsx                # Auth redirect gate
│   ├── login/page.tsx
│   ├── landing/                # Public landing page + components
│   └── (dashboard)/
│       ├── layout.tsx          # Auth guard + sidebar + topbar wrapper
│       ├── dashboard/page.tsx
│       ├── scan/page.tsx
│       ├── news/page.tsx
│       ├── leaderboard/page.tsx
│       ├── members/page.tsx
│       ├── logs/page.tsx
│       ├── profile/page.tsx
│       ├── badges/page.tsx
│       ├── calendar/page.tsx
│       ├── change-password/page.tsx
│       └── admin/
│           ├── page.tsx
│           ├── news/page.tsx
│           └── media/page.tsx
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx         # Full sidebar with stagger + mobile
│   │   └── TopBar.tsx          # Header with profile cluster + dark toggle
│   ├── news/
│   │   └── NewsSlider.tsx
│   └── ui/
│       ├── Toast.tsx           # Global toast system (ARIA live)
│       ├── NovelCursor.tsx
│       ├── AnnouncementBanner.tsx
│       ├── ErrorBoundary.tsx
│       ├── ProfileCard.tsx
│       └── ToggleDarkMode.tsx
├── lib/
│   ├── theme-engine.ts         # useTheme hook + THEME_SCRIPT
│   ├── auth-store.ts           # Zustand auth store
│   ├── api.ts
│   └── firebase.ts
└── styles/
    └── globals.css             # Single source of truth: tokens, components, animations
```

---

## Changelog

### 2026-05-27 — Major Refactor

**Dark Mode**
- Created `lib/theme-engine.ts`: `useTheme`, `THEME_SCRIPT` (anti-FOUC)
- Rebuilt `globals.css`: full dual token map (`:root` + `:root.dark`)
- 350ms morph transition on all elements

**Sidebar**
- Full rebuild from scratch
- Stagger entrance, elastic hover, neon active bar with glow pulse
- Mobile: fixed slide-in with blur backdrop overlay
- Role-based nav item filtering

**TopBar**
- Profile cluster surgical fix: flex alignment, no overflow, vertical center
- Dark mode toggle integrated (replaces standalone component usage)
- XP badge + level display

**Components**
- Toast: ARIA live region, Remix icons, CSS var colors
- AnnouncementBanner: CSS vars, Remix icons
- NewsSlider: canonical var names, TypeScript purged
- ToggleDarkMode: rewritten to use `useTheme()`

**Pages (all)**
- `<style jsx>` → inline `<style>` or globals.css
- All hardcoded colors → CSS variables
- `err: any` → `err: unknown` with `instanceof Error` narrowing
- Dead imports removed
- `any[]` → typed interfaces throughout
- `htmlFor` + `id` on all form elements
- `aria-label` on all icon-only buttons

**Auth Store**
- Fixed `setInterval` memory leak: stored in `globalThis` and cleared on every auth state change + logout

**Calendar**
- Fixed hardcoded `MEI / 14` → dynamic date derivation from event data
