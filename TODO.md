NEWGAME v0.1.5 — Project Task List
UKM Game Development, Universitas Andalas
Last updated: 14 Juni 2026

This file tracks the development status of all features across the platform.
Update this file whenever a task is started, completed, or reprioritized.

Status key:
  [x] = Done and deployed
  [~] = In progress / partially implemented
  [-] = Planned but not started
  [!] = Blocked or needs review

---

INFRASTRUCTURE AND DEVOPS

  [x] Monorepo setup — NestJS API (Port 3001) + Next.js Web (Port 3000)
  [x] GitHub repository at rannymphaea/web-ua-newgame
  [x] GitHub Actions CI/CD pipeline (.github/workflows/ci.yml)
      [x] TypeScript type-check on push
      [x] Security audit (npm audit)
      [x] Lint check — ESLint config added (.eslintrc.json)
      [x] Fixed: npm ci → npm install --legacy-peer-deps (lock drift tolerant)
  [x] Vercel deployment with vercel.json rewrites
  [x] Environment variable structure documented (README.md)
  [x] .gitignore configured — .env, node_modules, .next, serviceAccountKey
  [x] Docker Compose setup for local full-stack development (NEW)
  [-] Staging environment separate from production

---

BACKEND — NESTJS API

  Authentication (apps/api/src/modules/auth)
    [x] POST /api/auth/verify-member — verify memberId + tempPassword against Firestore
    [x] POST /api/auth/register — create user profile in PostgreSQL after Firebase auth
    [x] GET /api/auth/me — fetch current authenticated user profile
    [x] POST /api/auth/set-role — change user role (admin and above)
    [x] GET /api/auth/users — list all users (code commander / pixel presiden only)
    [x] POST /api/auth/register-admin — create admin account (code commander / pixel presiden only)
    [x] POST /api/auth/lookup-id — resolve NEWGAME Member ID to email (NEW)
    [x] Better Auth integration with Prisma adapter
    [x] Google OAuth login support
    [x] Login via NEWGAME Member ID (tab 3 in login page) (NEW)
    [~] Better Auth session fully replacing Firebase Auth
    [x] Password reset via email flow (NEW — Firebase sendPasswordResetEmail)
    [x] Two-factor authentication (2FA) for admin accounts (NEW — TOTP RFC 6238)

  Member Management (apps/api/src/modules/members)
    [x] GET /api/members — paginated member list with filters
    [x] GET /api/members/:uid — member detail with activity history
    [x] POST /api/members — create single member record
    [x] POST /api/members/import — bulk import via CSV or JSON
    [x] PATCH /api/members/:uid — update member data
    [x] DELETE /api/members/:uid — soft delete (status → inactive)
    [x] seed-members.js — seeds all 125 members to Firestore with bcrypt hash
    [x] add-member.js — interactive/CLI script to add one member at a time
    [x] Member search by name, pillar, or generation (NEW)
    [x] Export member list to CSV from admin panel (NEW)

  XP and Leaderboard (apps/api/src/modules/xp)
    [x] XP calculation and increment endpoint
    [x] Level computation from XP total
    [x] Leaderboard query with Redis caching (TTL 60s)
    [~] XP history per member
    [x] XP decay / season reset logic (NEW — configurable %)
    [x] Bonus XP for event attendance streaks (NEW — 4 tiers)

  Attendance (apps/api/src/modules/attendance)
    [x] QR code scan endpoint (idempotent — safe for retry) (UPDATED)
    [x] Attendance record creation
    [x] Attendance history per member
    [x] Attendance report export (CSV) (NEW)
    [x] Manual attendance input by trainer (NEW)
    [x] Late check-in penalty logic (NEW — -2 XP per 15min late)

  Events (apps/api/src/modules/events)
    [x] Event creation and listing
    [x] Event detail and attendance linking
    [-] Event reminder notification (push/email)
    [x] Recurring event support (NEW — weekly/biweekly/monthly)

  News (apps/api/src/modules/news)
    [x] Article creation, update, delete
    [x] Published/draft toggle
    [x] Slug generation
    [~] Image upload via Cloudinary for article cover
    [x] Article categories and tags (ALREADY IMPLEMENTED)
    [x] Search articles by keyword (ALREADY IMPLEMENTED)

  Notifications (apps/api/src/modules/notifications)
    [x] Notification creation endpoint
    [~] Real-time delivery (polling-based)
    [-] WebSocket push notifications
    [-] Email notification integration

  Media (apps/api/src/modules/media)
    [x] Upload to Cloudinary via upload_stream
    [x] Delete media from Cloudinary
    [x] Media gallery paginated listing (NEW)
    [-] Video upload support

  Badges (apps/api/src/modules/badges)
    [x] Badge definition schema
    [x] Badge assignment to user
    [-] Automatic badge trigger logic (attendance streaks, XP milestones)

  AI Module (apps/api/src/modules/ai)
    [x] Milvus / Zilliz Cloud vector DB connection
    [x] Text embedding via OpenAI API
    [-] Semantic news search using vector similarity
    [-] Member recommendation engine

  Security and Monitoring
    [x] Global ResponseInterceptor — unified { success, data, meta, timestamp }
    [x] Global AllExceptionsFilter — forensic logging + safe error responses
    [x] RateLimitGuard — Upstash Redis, 5 req/15min lookup-id, 100 req/min general
    [x] In-memory rate limiter fallback in main.ts
    [x] RolesGuard + @Roles decorator — 8-level hierarchy (NEW)
    [x] Role constants — centralized in constants/roles.ts (NEW)
    [x] Role permission matrix — npc→pixel presiden (NEW)
    [x] CORS configured with frontend URL whitelist
    [x] Helmet security headers
    [~] Anomaly detection engine (isolation forest, evidence chain, Merkle tree)
    [~] SIEM integration — ELK Stack + Grafana Loki adapters (placeholder)
    [-] PQCrypto — post-quantum cryptography (placeholder interfaces exist)
    [-] Automated secret rotation via CI/CD
    [-] Alerting when anomaly score exceeds threshold

  Export and Import (apps/api/src/modules/export, import)
    [x] Import members from JSON payload
    [x] Firestore → PostgreSQL migration script (NEW)
    [-] Export attendance report as CSV
    [-] Export XP history as spreadsheet

  Other Modules
    [x] Logs module — activity log storage
    [x] User Vault — sensitive user data storage
    [x] User History — event and activity timeline
    [x] Pillar Levels — per-pillar XP level tracking
    [x] Cyber Defense module structure
    [x] Leave request system (izin tidak hadir) (ALREADY IMPLEMENTED)

---

FRONTEND — NEXT.JS WEB

  Landing Page (apps/web/src/app/landing)
    [x] Hero section — HeroTypewriter multi-phrase (NEWGAME/LEARN/PLAY/LEVEL UP)
        [x] Gradient color shift per phrase + glitch chromatic flash on transition
        [x] Radial particle burst (8 particles, CSS trig + fallback)
    [x] PirateMap — vertical flowchart dengan Framer Motion animations
        [x] Spring bounce per stage node (staggered)
        [x] Draw-stroke animated connector lines + arrowheads
        [x] Star burst terminal animation (Soldat)
        [x] Hover tooltip + pulsing glow ring
        [x] Mobile slide-in step cards
    [x] Vision and mission section
    [x] Pillar introduction cards
    [x] Guidebook section with banner and chips
    [x] Call-to-action section
    [x] Space Grotesk font integration (zero CLS)
    [-] Internationalization (English/Indonesian toggle)
    [-] SEO meta tags and Open Graph images

  Authentication (apps/web/src/app/login)
    [x] Login page with Firebase Auth
    [x] Login via NEWGAME Member ID (NEW)
    [x] 2-tab login: Login (Email+MemberID+Google) / Daftar (UPDATED v0.1.5)
    [x] Registration tab with member verification flow + duplicate detection (UPDATED)
    [x] Google OAuth login button
    [x] Zustand auth store with IndexedDB cache (instant session restore)
    [x] Fix post-login redirect (ng-just-logged-in sessionStorage flag)
    [x] Dashboard layout debounced redirect (1.2–2.5s) → /login not /landing
    [x] Root page Firebase timeout extended 600ms → 1500ms
    [~] Better Auth session fully replacing Firebase on frontend
    [x] Forgot password inline flow (NEW — in login tab)
    [-] Email verification resend button

  Dashboard (apps/web/src/app/(dashboard)/dashboard)
    [x] Welcome hero with Yua character (clickable with SFX)
    [x] XP liquid wave bar in TopBar
    [x] Stat cards — XP, level, attendance count, badge count
    [x] Quick action buttons
    [x] Upcoming events section
    [x] Guidebook shortcut cards
    [-] Weekly activity heatmap
    [-] Announcement banner (emergency broadcast from admin)

  Leaderboard (apps/web/src/app/(dashboard)/leaderboard)
    [x] Global XP leaderboard
    [x] Pillar filter tabs
    [-] Generation filter (GEN 1 / GEN 2)
    [-] Season / time-period filter
    [-] Export leaderboard as image

  Badges (apps/web/src/app/(dashboard)/badges)
    [x] Badge collection display grid
    [-] Badge detail modal with unlock conditions
    [-] Badge progress indicator

  Attendance (apps/web/src/app/(dashboard)/scan)
    [x] QR code scanner component
    [x] Attendance confirmation screen
    [x] Scan history list
    [x] Offline scan queue with sync-on-reconnect (NEW)
    [x] Pending sync indicator badge (NEW)
    [x] Indonesian error messages for scan failures (NEW)

  News (apps/web/src/app/(dashboard)/news)
    [x] Article list with cover image
    [x] Article detail reader
    [-] Article search
    [-] Related articles sidebar

  Profile (apps/web/src/app/(dashboard)/profile)
    [x] Profile card with avatar, role, and XP
    [x] Activity history timeline
    [x] Avatar selection (including Yua avatar)
    [x] Cloudinary photo upload
    [-] Profile edit form (bio, GitHub, LinkedIn, skills)
    [-] Download profile card as image

  Admin Panel (apps/web/src/app/(dashboard)/admin)
    [x] Member management table
    [x] Role change interface
    [x] News management (create, edit, delete, publish toggle)
    [x] Media gallery management
    [x] Analytics dashboard (PostHog-powered)
    [-] Attendance report view and export
    [-] Event creation form
    [-] Bulk member import UI
    [-] SIEM log viewer for anomaly events

  Members Directory (apps/web/src/app/(dashboard)/members)
    [x] Member list with pillar filter
    [-] Member search by name
    [-] Member profile click-through

  Calendar (apps/web/src/app/(dashboard)/calendar)
    [x] Calendar view structure
    [-] Event display on calendar dates
    [-] Add event from calendar (admin only)

  Logs (apps/web/src/app/(dashboard)/logs)
    [x] Activity logs page structure
    [-] Filter by log type and date range
    [-] Export logs to CSV

  Developer Tools
    [x] /dev-tools — Web Mobile Simulator (8 presets, orientation toggle, scale slider)
    [x] /dev-profile — Developer profile page
    [x] Flutter Mobile App (tools/mobile-simulator) — Android WebView + bottom nav + drawer (UPDATED)
        [x] WebView native Android (webview_flutter)
        [x] Bottom navigation bar (5 halaman utama)
        [x] Full drawer menu (11 halaman)
        [x] Server URL config dialog (emulator vs HP fisik)
        [x] Error state + retry saat server tidak berjalan
        [x] Loading progress bar
        [x] Dark theme matching web design system

  UI Components and System
    [x] Dark mode toggle with FOUC prevention (theme-engine.ts)
    [x] ErrorBoundary — crash handler with retry button + PostHog reporting
    [x] ProfileCard — avatar, name, role, leading slot
    [x] Toast notifications — ARIA live region + showError() auto-mapping (UPDATED)
    [x] ErrorBanner — persistent dismissible error component (NEW)
    [x] Sidebar — elastic hover, mobile responsive
    [x] TopBar — XP liquid bar, dark mode toggle, notification slot
    [x] NovelCursor — canvas trail cursor effect
    [x] PostHog Provider — pageview recording, event tracking
    [x] Design token system in globals.css — colors, spacing, animation
    [x] Skeleton shimmer loading states
    [x] IdleSessionManager — auto-logout 30min idle, 2min warning countdown dialog
        [x] SVG countdown ring (gold→red color shift)
        [x] AbortController cleanup, tab visibility handling
        [x] Framer Motion animated dialog
    [x] Toast queue system (multiple stacked toasts) (NEW)
    [x] Global search component (Cmd+K / Ctrl+K) (NEW)
    [-] Keyboard shortcut system

---

DOCUMENTATION

  [x] README.md — platform overview, setup, structure, role table (UPDATED)
  [x] DEVELOPER_GUIDE.md — coding standards, Git workflow, dual-write pattern
  [x] SECURITY.md — layered security architecture, rate limits, Firestore rules
  [x] MEMBER_REGISTRATION.md — admin guide for adding and managing members
  [x] MEMBER_CREDENTIALS.md — all 125 members with Member IDs and access codes
  [x] CHANGELOG.md — version history including v0.1.3 gap fixes (UPDATED)
  [x] TODO.md — this file
  [x] MIGRATION.md — Firestore → PostgreSQL cutover guide (NEW)
  [-] API Postman / Insomnia collection export
  [-] Deployment runbook for Vercel + Neon + Upstash

---

PENDING FROM PREVIOUS SESSIONS

  [!] seed-members.js needs to be run once against production Firestore
      to seed all 125 members before any member can register
      Command: node apps/api/src/scripts/seed-members.js

  [!] MEMBER_CREDENTIALS.md must be filled with data and distributed
      to all members who have not yet registered

  [!] Cloudinary credentials in apps/api/.env must be valid
      before upload features and media management will work

  [!] Google OAuth redirect URIs must be added in Google Cloud Console:
      - http://localhost:3000/api/auth/callback/google (development)
      - https://unandnewgame-tan.vercel.app/api/auth/callback/google (production)

  [!] Prisma migration must be run on production database (Neon or Supabase)
      Command: npx prisma migrate deploy

  [!] DATABASE_URL must be added as a GitHub Repository Secret to activate
      automated daily backup via .github/workflows/backup.yml

  [!] Role names in Firestore user documents must be updated to new names:
      superadmin → code commander, presiden → pixel presiden, pengurus → member
      Use: node scripts/migrate-firestore.mjs --collection users --dry-run first

  [~] Flutter submodule was added as an embedded git repo (warning in git add)
      Consider: git rm --cached flutter
      Then add properly as a git submodule if needed

---

NEWGAME v0.1.5 — UKM Game Development, Universitas Andalas
