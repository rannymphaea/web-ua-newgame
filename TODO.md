NEWGAME V1.1 — Project Task List
UKM Game Development, Universitas Andalas
Last updated: June 2026

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
      [x] Lint check
  [x] Vercel deployment with vercel.json rewrites
  [x] Environment variable structure documented (README.md)
  [x] .gitignore configured — .env, node_modules, .next, serviceAccountKey
  [-] Docker Compose setup for local full-stack development
  [-] Staging environment separate from production

---

BACKEND — NESTJS API

  Authentication (apps/api/src/modules/auth)
    [x] POST /api/auth/verify-member — verify memberId + tempPassword against Firestore
    [x] POST /api/auth/register — create user profile in PostgreSQL after Firebase auth
    [x] GET /api/auth/me — fetch current authenticated user profile
    [x] POST /api/auth/set-role — change user role (ADMIN/OWNER only)
    [x] GET /api/auth/users — list all users (OWNER only)
    [x] POST /api/auth/register-admin — create admin account (OWNER only)
    [x] Better Auth integration with Prisma adapter
    [x] Google OAuth login support
    [~] Better Auth session management fully replacing Firebase Auth
    [-] Password reset via email flow
    [-] Two-factor authentication (2FA) for admin accounts

  Member Management (apps/api/src/modules/members)
    [x] GET /api/members — paginated member list with filters
    [x] GET /api/members/:uid — member detail with activity history
    [x] POST /api/members — create single member record
    [x] POST /api/members/import — bulk import via CSV or JSON
    [x] PATCH /api/members/:uid — update member data
    [x] DELETE /api/members/:uid — soft delete (status → inactive)
    [x] seed-members.js — seeds all 125 members to Firestore with bcrypt hash
    [x] add-member.js — interactive/CLI script to add one member at a time
    [-] Member search by name, pillar, or generation
    [-] Export member list to CSV from admin panel

  XP and Leaderboard (apps/api/src/modules/xp)
    [x] XP calculation and increment endpoint
    [x] Level computation from XP total
    [x] Leaderboard query with Redis caching (TTL 60s)
    [~] XP history per member
    [-] XP decay / season reset logic
    [-] Bonus XP for event attendance streaks

  Attendance (apps/api/src/modules/attendance)
    [x] QR code scan endpoint
    [x] Attendance record creation
    [x] Attendance history per member
    [-] Attendance report export (PDF or CSV)
    [-] Manual attendance input by trainer
    [-] Late check-in penalty logic

  Events (apps/api/src/modules/events)
    [x] Event creation and listing
    [x] Event detail and attendance linking
    [-] Event reminder notification (push/email)
    [-] Recurring event support

  News (apps/api/src/modules/news)
    [x] Article creation, update, delete
    [x] Published/draft toggle
    [x] Slug generation
    [~] Image upload via Cloudinary for article cover
    [-] Article categories and tags
    [-] Search articles by keyword

  Notifications (apps/api/src/modules/notifications)
    [x] Notification creation endpoint
    [~] Real-time delivery (polling-based)
    [-] WebSocket push notifications
    [-] Email notification integration

  Media (apps/api/src/modules/media)
    [x] Upload to Cloudinary via upload_stream
    [x] Delete media from Cloudinary
    [-] Media gallery paginated listing
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
    [x] RateLimitGuard — Upstash Redis, 10 req/min auth, 100 req/min general
    [x] In-memory rate limiter fallback in main.ts
    [x] RolesGuard + @Roles decorator for role-based access
    [x] CORS configured with frontend URL whitelist
    [x] Helmet security headers
    [~] Anomaly detection engine (isolation forest, evidence chain, Merkle tree)
    [~] SIEM integration — ELK Stack + Grafana Loki adapters (placeholder)
    [-] PQCrypto — post-quantum cryptography (placeholder interfaces exist)
    [-] Automated secret rotation via CI/CD
    [-] Alerting when anomaly score exceeds threshold

  Export and Import (apps/api/src/modules/export, import)
    [x] Import members from JSON payload
    [-] Export attendance report as CSV
    [-] Export XP history as spreadsheet

  Other Modules
    [x] Logs module — activity log storage
    [x] User Vault — sensitive user data storage
    [x] User History — event and activity timeline
    [x] Pillar Levels — per-pillar XP level tracking
    [x] Cyber Defense module structure
    [-] Leave request system (izin tidak hadir)

---

FRONTEND — NEXT.JS WEB

  Landing Page (apps/web/src/app/landing)
    [x] Hero section with typewriter animation
    [x] Pirate Map — interactive SVG tree diagram for member journey
    [x] Vision and mission section
    [x] Pillar introduction cards
    [x] Guidebook section with banner and chips
    [x] Call-to-action section
    [x] Space Grotesk font integration (zero CLS)
    [-] Internationalization (English/Indonesian toggle)
    [-] SEO meta tags and Open Graph images

  Authentication (apps/web/src/app/login)
    [x] Login page with Firebase Auth
    [x] Registration tab with member verification flow
    [x] Google OAuth login button
    [x] Zustand auth store with IndexedDB cache (instant session restore)
    [~] Better Auth session fully replacing Firebase on frontend
    [-] Forgot password page
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
    [-] Offline scan with sync-on-reconnect

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
    [x] Flutter Desktop Simulator (tools/mobile-simulator)

  UI Components and System
    [x] Dark mode toggle with FOUC prevention (theme-engine.ts)
    [x] ErrorBoundary — crash handler with retry button + PostHog reporting
    [x] ProfileCard — avatar, name, role, leading slot
    [x] Toast notifications — ARIA live region
    [x] Sidebar — elastic hover, mobile responsive
    [x] TopBar — XP liquid bar, dark mode toggle, notification slot
    [x] NovelCursor — canvas trail cursor effect
    [x] PostHog Provider — pageview recording, event tracking
    [x] Design token system in globals.css — colors, spacing, animation
    [x] Skeleton shimmer loading states
    [-] Toast queue system (multiple stacked toasts)
    [-] Global search component (Cmd+K / Ctrl+K)
    [-] Keyboard shortcut system

---

DOCUMENTATION

  [x] README.md — platform overview, setup, structure
  [x] DEVELOPER_GUIDE.md — coding standards, Git workflow, dual-write pattern
  [x] DOCS.md — API endpoints, database schema, auth flow, caching diagram
  [x] SECURITY.md — layered security architecture, rate limits, Firestore rules
  [x] CHANGELOG.md — version history from session 1 to V1.1
  [x] ACCOUNT_GUIDE.md — member registration walkthrough
  [x] MEMBER_REGISTRATION.md — admin guide for adding and managing members
  [x] MEMBER_CREDENTIALS.md — all 125 members with Member IDs and access codes
  [x] ANNOUNCEMENT.md — V1.1 update announcement for distribution
  [x] TODO.md — this file
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

  [~] Flutter submodule was added as an embedded git repo (warning in git add)
      Consider: git rm --cached flutter
      Then add properly as a git submodule if needed

---

NEWGAME V1.1 — UKM Game Development, Universitas Andalas
