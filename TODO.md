NEWGAME v0.1.5 — Project Task List
UKM Game Development, Universitas Andalas
Last updated: 14 Juni 2026

Catatan: Item yang sudah selesai [x] diringkas di bagian "FITUR YANG SUDAH ADA" per modul.
Item yang masih pending tetap ditandai [-], [~], atau [!].

Status key:
  [x] = Done and deployed (lihat ringkasan per modul)
  [~] = In progress / partially implemented
  [-] = Planned but not started
  [!] = Blocked or needs review / action required

---

INFRASTRUKTUR & DEVOPS

Sudah diimplementasikan:
  Monorepo NestJS (port 3001) + Next.js (port 3000), GitHub repo rannymphaea/web-ua-newgame,
  CI/CD via GitHub Actions (type-check, audit, lint), Vercel deployment + vercel.json rewrites,
  .env structure documented, .gitignore lengkap, Docker Compose untuk local dev (API+Web+Redis),
  Dockerfile terpisah untuk API dan Web.

Belum selesai:
  [-] Staging environment terpisah dari production

---

BACKEND — NESTJS API

  Authentication (apps/api/src/modules/auth)
    Sudah ada: verify-member, register, /me, set-role, list users, register-admin,
    lookup-id (Member ID → email), Google OAuth, login via Member ID, password reset
    (Firebase sendPasswordResetEmail), 2FA TOTP RFC 6238 (setup/verify/validate/disable/status,
    pure Node.js crypto, QR URI untuk Google Authenticator).
    [~] Better Auth session fully replacing Firebase Auth (masih hybrid)

  Member Management (apps/api/src/modules/members)
    Sudah ada: CRUD lengkap (GET list/detail, POST create, PATCH update, DELETE soft-delete),
    bulk import via CSV atau JSON, seed-members.js (125 anggota), add-member.js CLI,
    search by name/pillar/generation, export member list to CSV, generation filter (NG1xxx/NG2xxx).

  XP & Leaderboard (apps/api/src/modules/xp)
    Sudah ada: XP hitung + increment, level computation, leaderboard dengan Redis cache (TTL 60s),
    XP season reset (configurable decay %), bonus XP streak (4 tier: 3/7/14/30 hari).
    [~] XP history per member (parsial)

  Attendance (apps/api/src/modules/attendance)
    Sudah ada: QR scan endpoint (idempotent), attendance record creation, attendance history,
    export CSV (/attendance/export/csv dengan filter event+tanggal),
    manual input oleh trainer (/attendance/manual, quest keeper+),
    late check-in penalty (-2 XP per 15 menit terlambat, max -10 XP).

  Events (apps/api/src/modules/events)
    Sudah ada: create + listing event, detail + attendance linking,
    recurring event (weekly/biweekly/monthly, auto-generate max 12 instance).
    [-] Event reminder notification (push/email)

  News (apps/api/src/modules/news)
    Sudah ada: CRUD artikel (create/update/delete), published/draft toggle, slug generation,
    kategori & tags (multi-kategori: blog/news/event/tutorial), search by keyword (client-side),
    tutorial grouping by sub-category (game-logic/game-design/game-sound), YouTube embed.
    [~] Image upload via Cloudinary untuk cover artikel (endpoint ada, butuh env Cloudinary valid)

  Notifications (apps/api/src/modules/notifications)
    Sudah ada: notification creation endpoint, polling-based delivery.
    [-] WebSocket push notifications
    [-] Email notification integration

  Media (apps/api/src/modules/media)
    Sudah ada: upload ke Cloudinary via upload_stream, delete media, paginated listing
    (?page=&limit=&usage=&mimeType=), avatar selection & upload profil.
    [-] Video upload support

  Badges (apps/api/src/modules/badges)
    Sudah ada: badge definition schema, badge assignment ke user.
    [-] Automatic badge trigger logic (attendance streaks, XP milestones)

  AI Module (apps/api/src/modules/ai)
    Sudah ada: koneksi Milvus/Zilliz Cloud vector DB, text embedding via OpenAI API.
    [-] Semantic news search via vector similarity
    [-] Member recommendation engine

  Security & Monitoring
    Sudah ada: ResponseInterceptor (unified response shape), AllExceptionsFilter (forensic logging),
    RateLimitGuard (Upstash Redis: 5 req/15min lookup-id, 100 req/min general), fallback in-memory
    rate limiter, RolesGuard + @Roles decorator (8-level hierarchy: npc → pixel presiden),
    CORS whitelist, Helmet security headers, anomaly detection engine (isolation forest, Merkle
    tree — parsial), SIEM adapters ELK + Grafana Loki (placeholder).
    [-] PQCrypto — post-quantum cryptography (interface placeholder saja)
    [-] Automated secret rotation via CI/CD
    [-] Alerting saat anomaly score melewati threshold

  Export & Import
    Sudah ada: import member dari JSON payload, Firestore → PostgreSQL migration script,
    export attendance report as CSV.
    [-] Export XP history sebagai spreadsheet

  Other Modules
    Sudah ada: Logs module (activity log), User Vault (sensitive data), User History (timeline),
    Pillar Levels (XP per pilar), Cyber Defense module, Leave request system (izin tidak hadir).

---

FRONTEND — NEXT.JS WEB

  Landing Page (apps/web/src/app/landing)
    Sudah ada: HeroTypewriter multi-phrase (gradient shift + glitch + particle burst),
    PirateMap vertical flowchart (Framer Motion: spring bounce, draw-stroke lines, star burst,
    tooltip, mobile cards), vision/mission section, pillar cards, guidebook section, CTA,
    Space Grotesk font (zero CLS).
    [-] Internationalization (English/Indonesian toggle)
    [-] SEO meta tags dan Open Graph images

  Authentication (apps/web/src/app/login)
    Sudah ada: Login page Firebase Auth, 2-tab UI (Login + Daftar) — tab Login berisi
    Email/MemberID toggle + Google OAuth + forgot password inline, tab Daftar berisi
    member verification flow + duplicate detection, Zustand auth store + IndexedDB cache,
    post-login redirect guard, idle timeout extended, 2FA TOTP flow.
    [~] Better Auth session fully replacing Firebase (masih hybrid)
    [-] Email verification resend button

  Dashboard (apps/web/src/app/(dashboard)/dashboard)
    Sudah ada: welcome hero (Yua, clickable SFX), XP liquid wave bar di TopBar,
    stat cards (XP/level/attendance/badge), quick actions, upcoming events, guidebook shortcuts.
    [-] Weekly activity heatmap
    [-] Announcement banner (emergency broadcast dari admin)

  Leaderboard (apps/web/src/app/(dashboard)/leaderboard)
    Sudah ada: global XP leaderboard, filter tab per pilar.
    [-] Generation filter (GEN 1 / GEN 2)
    [-] Season / time-period filter
    [-] Export leaderboard as image

  Badges (apps/web/src/app/(dashboard)/badges)
    Sudah ada: badge collection grid.
    [-] Badge detail modal dengan unlock conditions
    [-] Badge progress indicator

  Attendance / Scan (apps/web/src/app/(dashboard)/scan)
    Sudah ada: QR scanner, confirmation screen, scan history, offline scan queue
    (sync-on-reconnect), pending sync indicator badge, Indonesian error messages.

  News (apps/web/src/app/(dashboard)/news)
    Sudah ada: article list dengan cover image, article detail reader.
    [-] Article search UI (backend sudah ada, frontend belum)
    [-] Related articles sidebar

  Profile (apps/web/src/app/(dashboard)/profile)
    Sudah ada: profile card (avatar/role/XP), activity history timeline, avatar selection
    (termasuk Yua avatar), Cloudinary photo upload, profile edit form (bio/GitHub/LinkedIn/skills
    via ProfileEditModal.tsx), download profile card sebagai PNG (canvas-based, ProfileCardDownload.tsx).

  Admin Panel (apps/web/src/app/(dashboard)/admin)
    Sudah ada: member management table, role change interface, news management
    (create/edit/delete/publish toggle), media gallery management, analytics dashboard (PostHog),
    attendance report view + export CSV (/admin/attendance), event creation form (di admin page),
    bulk member import UI (/admin/import — CSV+JSON + error detail), SIEM log viewer
    (/admin/siem — severity badges NORMAL→CRITICAL, pagination, detail modal).

  Members Directory (apps/web/src/app/(dashboard)/members)
    Sudah ada: member list dengan pillar filter.
    [-] Member search by name (backend sudah ada)
    [-] Member profile click-through

  Calendar (apps/web/src/app/(dashboard)/calendar)
    Sudah ada: calendar view structure.
    [-] Event display on calendar dates
    [-] Add event dari calendar (admin only)

  Logs (apps/web/src/app/(dashboard)/logs)
    Sudah ada: activity logs page structure.
    [-] Filter by log type dan date range
    [-] Export logs to CSV

  Developer Tools
    Sudah ada: /dev-tools (Web Mobile Simulator — 8 presets, orientasi, scale),
    /dev-profile, Flutter Mobile App (tools/mobile-simulator — Android WebView, bottom nav 5
    halaman, drawer 11 halaman, server URL config, error/retry, loading bar, dark theme).

  UI Components & System
    Sudah ada: dark mode toggle (FOUC prevention), ErrorBoundary (PostHog reporting),
    ProfileCard, Toast (ARIA live region), ErrorBanner, Sidebar (elastic hover, mobile),
    TopBar (XP bar), NovelCursor, PostHog Provider, design token system (globals.css),
    skeleton shimmer, IdleSessionManager (30min auto-logout, 2min warning, SVG countdown ring),
    Toast queue system (stacked max 5, auto-dismiss, slide-in — ToastQueue.tsx),
    Global search Cmd+K (GlobalSearch.tsx — arrow key nav, semua halaman terindex),
    Keyboard shortcut system (KeyboardShortcuts.tsx — component + hook + ShortcutHelpOverlay).

---

DOKUMENTASI

Sudah ada: README.md (updated v0.1.5 — login section 2-tab), DEVELOPER_GUIDE.md,
SECURITY.md, MEMBER_REGISTRATION.md, MEMBER_CREDENTIALS.md, CHANGELOG.md (v0.1.5 entry),
TODO.md (file ini), MIGRATION.md, DESIGN.md.

[-] API Postman / Insomnia collection export
[-] Deployment runbook untuk Vercel + Neon + Upstash

---

ACTION ITEMS — WAJIB DILAKUKAN MANUAL

  [!] Jalankan seed-members.js sekali di Firestore production sebelum anggota bisa registrasi
      Command: node apps/api/src/scripts/seed-members.js

  [!] Isi dan distribusikan MEMBER_CREDENTIALS.md ke semua anggota yang belum registrasi

  [!] Pastikan Cloudinary credentials di apps/api/.env valid sebelum upload/media berfungsi

  [!] Tambahkan Google OAuth redirect URIs di Google Cloud Console:
      - http://localhost:3000/api/auth/callback/google (development)
      - https://unandnewgame-tan.vercel.app/api/auth/callback/google (production)

  [!] Jalankan Prisma migration di production database
      Command: npx prisma migrate deploy

  [!] Tambahkan DATABASE_URL sebagai GitHub Repository Secret untuk backup otomatis

  [!] Update role names di Firestore: superadmin → code commander, presiden → pixel presiden
      Command: node scripts/migrate-firestore.mjs --collection users --dry-run

  [~] Flutter submodule masih embedded repo — pertimbangkan:
      git rm --cached flutter && tambahkan sebagai git submodule resmi

---

NEWGAME v0.1.5 — UKM Game Development, Universitas Andalas
