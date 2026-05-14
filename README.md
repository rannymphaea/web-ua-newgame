# NEWGAME Attendance System

<p align="center">
  <img src="assets/logo unandnewgame.png" width="150" alt="NEWGAME Logo">
</p>

<h1 align="center">NEWGAME Attendance System</h1>

<p align="center">
  Modern QR-based attendance platform powered by Firebase
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Development-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Firebase-Backend-orange?style=for-the-badge&logo=firebase">
  <img src="https://img.shields.io/badge/Vercel-Hosting-black?style=for-the-badge&logo=vercel">
  <img src="https://img.shields.io/badge/TailwindCSS-UI-38bdf8?style=for-the-badge&logo=tailwindcss">
</p>

---

## Overview

NEWGAME Attendance System is a secure realtime attendance platform designed for organizations and communities that require:

- QR-based attendance validation
- Realtime monitoring
- Role-based management
- XP and leaderboard system
- Firebase cloud infrastructure

Built using lightweight modern web technologies without heavy frontend frameworks.

---

# Features

## Authentication

- Email & Password Authentication
- Google Sign-In
- Email Verification
- Password Reset
- Session Validation

---

## Attendance System

- Dynamic QR Attendance
- QR Auto Refresh Every 12 Seconds
- Realtime Attendance Validation
- Duplicate Attendance Prevention
- Secure Firestore Transactions
- Device Fingerprint Validation

---

## Dashboard

- XP & Ranking System
- Attendance History
- User Statistics
- Leaderboard
- Realtime Updates

---

## Admin Panel

- Event Management
- QR Generator
- Attendance Monitoring
- CSV Import & Export
- Leave Approval System
- Manual XP Management
- Logs & Audit Tracking

---

## Security

- Firestore Security Rules
- Firebase Custom Claims
- Role-Based Access Control
- Secure Token Validation
- Anomaly Detection
- Protected Admin Routes

---

# Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 + JavaScript ES Modules |
| Styling | TailwindCSS |
| Backend | Firebase |
| Database | Cloud Firestore |
| Authentication | Firebase Authentication |
| Server Logic | Firebase Cloud Functions |
| Hosting | Vercel |
| QR Engine | QRCode.js |

---

# Project Structure

```txt
absensi-qr/
│
├── assets/
│   └── logo.png
│
├── functions/
│   ├── index.js
│   ├── package.json
│   └── node_modules/
│
├── public/
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── admin.html
│   │   ├── members.html
│   │   ├── leaderboard.html
│   │   ├── logs.html
│   │   ├── change-password.html
│   │   └── scan.html
│   │
│   ├── js/
│   └── css/
│
├── firestore.rules
├── firebase.json
├── .firebaserc
├── .gitignore
├── vercel.json
└── README.md
```

---

# Role Hierarchy

```txt
member
   ↓
pengurus
   ↓
inventori
   ↓
admin
   ↓
superadmin
   ↓
presiden
```

Each role has isolated permissions enforced using Firebase Custom Claims and Firestore Security Rules.

---

# Firebase Setup

## 1. Create Firebase Project

Open Firebase Console:

```txt
https://console.firebase.google.com
```

Enable:

- Authentication
- Firestore Database
- Cloud Functions

---

## 2. Register Web App

Navigate to:

```txt
Project Settings
→ General
→ Your Apps
```

Copy the Firebase SDK configuration.

---

## 3. Insert Firebase Config

Replace this section inside your project:

```js
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

---

# Firestore Collections

```txt
users
events
attendance
tokens
logs
xpHistory
anomalies
notifications
leaveRequests
members
```

---

# Local Development

## Install Firebase CLI

```bash
npm install -g firebase-tools
```

---

## Login Firebase

```bash
firebase login
```

---

## Install Dependencies

```bash
cd functions
npm install
```

---

## Run Emulator

```bash
firebase emulators:start
```

Open Emulator UI:

```txt
http://127.0.0.1:4000
```

---

# Attendance Workflow

```txt
Admin creates event
        ↓
Generate secure QR token
        ↓
Member scans QR
        ↓
Cloud Function validates request
        ↓
Firestore transaction executes
        ↓
Attendance recorded
        ↓
XP updated
        ↓
Logs stored
```

---

# GitHub Setup

## Initialize Repository

```bash
git init
```

---

## Add Files

```bash
git add .
```

---

## Commit

```bash
git commit -m "initial commit"
```

---

## Connect Remote Repository

```bash
git remote add origin https://github.com/USERNAME/web-ua-newgame.git
```

---

## Push Project

```bash
git branch -M main
git push -u origin main
```

---

# Deploy to Vercel

## Install Vercel CLI

```bash
npm install -g vercel
```

---

## Login

```bash
vercel login
```

---

## Deploy

```bash
vercel
```

---

## Production Deploy

```bash
vercel --prod
```

---

# Recommended Security Headers

Create `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

---

# Cloud Functions

| Function | Purpose |
|---|---|
| `processAttendance` | Validate attendance transaction |
| `generateToken` | Generate secure QR token |
| `closeEvent` | Close event & distribute XP |
| `editXPManual` | Manual XP editing |
| `importMembers` | CSV member import |
| `approveLeaveRequest` | Approve/reject leave |
| `cleanupExpiredTokens` | Cleanup expired tokens |
| `onUserCreated` | Set initial custom claims |
| `onRoleUpdated` | Sync updated roles |

---

# Future Improvements

- Progressive Web App (PWA)
- Push Notifications
- Multi-organization support
- Advanced Analytics Dashboard
- Offline Attendance Sync
- Better Device Fingerprinting

---

# License

MIT License

---

# NEWGAME

Let's Create, Let's Play.