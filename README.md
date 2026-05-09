````markdown id="jlwmmk"
# NEWGAME Attendance System

Modern organization attendance platform powered by Firebase, QR technology, and realtime validation.

<p align="center">
  <img src="./assets/logo.png" width="140" alt="NEWGAME Logo">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge">
  <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel">
  <img src="https://img.shields.io/badge/Firebase-Backend-orange?style=for-the-badge&logo=firebase">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge">
</p>

---

## ✨ Overview

NEWGAME Attendance System is a secure QR-based attendance web application designed for organizations and communities that require realtime attendance tracking, role-based management, and scalable Firebase infrastructure.

Built using lightweight modern web technologies without heavy frontend frameworks.

---

# 🚀 Features

## Authentication
- Email & Password Authentication
- Google Sign-In
- Email Verification
- Session Validation

## Attendance System
- Dynamic QR Attendance
- QR Auto Refresh Every 12 Seconds
- Firestore Transaction Validation
- Duplicate Attendance Prevention
- Realtime Attendance Logging

## Dashboard
- XP & Rank System
- Attendance History
- User Statistics
- Realtime Leaderboard

## Admin Panel
- Event Management
- Dynamic QR Generator
- Double Approval Event Closing
- CSV Export Logs
- Attendance Monitoring

## Security
- Firestore Security Rules
- Role-Based Access Control
- Secure Token Validation
- Anomaly Detection System
- Protected Admin Routes

---

# 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 + JavaScript ES Modules |
| Styling | Tailwind CSS CDN |
| Backend | Firebase Authentication + Firestore |
| Hosting | Vercel |
| QR Engine | QRCode.js |

---

# 📁 Project Structure

```txt
absensi-qr/
├── assets/
│   └── logo.png
│
├── firebase/
│   ├── config.js
│   └── service.js
│
├── utils/
│   ├── token.js
│   └── validator.js
│
├── public/
│   ├── pages/
│   │   ├── login.html
│   │   ├── dashboard.html
│   │   ├── admin.html
│   │   ├── leaderboard.html
│   │   └── logs.html
│   │
│   ├── app.js
│   └── style.css
│
├── index.html
├── .env
├── .gitignore
└── vercel.json
```

---

# 🔐 Role Hierarchy

```txt
member → pengurus → admin → superadmin
```

Each role has isolated permissions to ensure secure operational access.

---

# ⚙️ Environment Setup

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

---

# 🔥 Firebase Configuration

## Create Firebase Project

Open:

https://console.firebase.google.com

Enable:
- Authentication
- Firestore Database
- Google Authentication Provider

---

## Register Web Application

Navigate to:

```txt
Project Settings → General → Your Apps → Web App
```

Copy the Firebase configuration into your `.env` file.

---

# 📦 GitHub Setup

## Initialize Git

```bash
git init
```

---

## Commit Project

```bash
git add .
git commit -m "initial commit"
```

---

## Connect Repository

```bash
git branch -M main
git remote add origin https://github.com/USERNAME/absensi-qr.git
git push -u origin main
```

Replace:

```txt
USERNAME
```

with your GitHub username.

---

# 🚀 Deploy to Vercel

## Login to Vercel

https://vercel.com

Sign in using GitHub.

---

## Import Repository

- Click `Add New Project`
- Select `absensi-qr`
- Click `Deploy`

---

## Configure Environment Variables

Navigate to:

```txt
Settings → Environment Variables
```

Import your `.env` file or add variables manually.

---

## Redeploy Project

Navigate to:

```txt
Deployments → Redeploy
```

---

# 🔒 Firebase Authorized Domain

Open:

```txt
Firebase Console → Authentication → Settings → Authorized Domains
```

Add your Vercel domain:

```txt
absensi-qr-puce.vercel.app
```

---

# 🛡️ Security Headers

Create:

```txt
vercel.json
```

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "no-referrer" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

---

# 🧠 Firestore Collections

```txt
users
events
attendance
tokens
logs
anomalies
```

---

# 📊 Attendance Workflow

```txt
Admin Creates Event
        ↓
Dynamic QR Generated
        ↓
Member Scans QR
        ↓
Firestore Transaction Validation
        ↓
Attendance Recorded
        ↓
XP & Logs Updated
```

---

# 📈 Future Improvements

- Progressive Web App (PWA)
- Offline Attendance Sync
- Push Notifications
- Multi-Organization Support
- Advanced Analytics Dashboard
- AI-Based Anomaly Detection
- Device Fingerprinting

---

# 🌌 NEWGAME

Secure. Lightweight. Realtime.

Built for modern organizations that need fast and scalable attendance management infrastructure.
````
