# UI Components: ProfileCard & ToggleDarkMode

This folder contains two small, modular React components implemented with Tailwind CSS:

- `ProfileCard` — a compact user profile card (avatar left, text right) designed to be modern, clean, and responsive.
- `ToggleDarkMode` — a small toggle that switches the site theme by adding/removing the `dark` class on `document.documentElement` and persists the preference in `localStorage`.

## Files changed / added

- `ProfileCard.tsx` — main UI component. Key behaviors:
  - Props: `name: string`, `role?: string`, `avatarUrl?: string`, `leading?: ReactNode`, `className?: string`.
  - Layout: `flex` with `gap-1.5` (≈6px) spacing, avatar size `w-10 h-10`.
  - Accessibility: avatar `alt`, container uses semantic HTML.
  - Overflow: text containers use `min-w-0` + `truncate` so long usernames/roles do not break layout.
  - Dark mode: text colors adapt using `dark:` variants; background uses `bg-background` / `dark:bg-midnight/90`.

- `ToggleDarkMode.tsx` — toggle button. Key behaviors:
  - Reads saved preference from `localStorage` in `useEffect` (SSR-safe).
  - Falls back to `prefers-color-scheme` if no saved preference.
  - Adds/removes `dark` class on `document.documentElement` and stores `theme` = `dark|light`.

## Notes & reasoning

- The Tailwind config was updated to `darkMode: 'class'` so toggling works by class. See `apps/web/tailwind.config.js`.
- To avoid SSR errors (Next.js), `ToggleDarkMode` no longer reads `localStorage` or `window.matchMedia` during render — both are accessed inside `useEffect`.
- `ProfileCard` now supports an optional `leading` node so callers can render contextual icons (e.g., bell) outside the avatar area, matching the screenshot layout where an icon appears to the far left.

## How to use

Import components from `apps/web/src/components/ui`:

```tsx
import ProfileCard from './components/ui/ProfileCard';
import ToggleDarkMode from './components/ui/ToggleDarkMode';

<div className="p-4 max-w-sm">
  <div className="flex items-center justify-between mb-3">
    <div />
    <ToggleDarkMode />
  </div>

  <ProfileCard name="ahmadadzanigibran22" role="Superadmin" />
</div>
```

To add a leading icon (bell) similar to the screenshot:

```tsx
import { BellIcon } from 'some-icon-library';

<ProfileCard
  leading={<BellIcon className="h-5 w-5 text-neutral-300" />}
  name="ahmadadzanigibran22"
  role="Superadmin"
/>
```

## Testing & manual verification

- No runtime changes required here; the components are self-contained. You can drop `ProfileCardDemo.tsx` into any page to preview.

## Changelog (new)

- 2026-05-25: Added `ProfileCard` and `ToggleDarkMode`, enabled `darkMode: 'class'` in Tailwind, added truncation and SSR-safe theme handling, and created this README.
