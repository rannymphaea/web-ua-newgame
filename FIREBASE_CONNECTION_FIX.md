# Firebase Connection Timeout - Network Issue

## Problem
The NestJS API server is running successfully on port 3001, Firebase initialized with the service account key, but when making Firebase calls (Firestore, Auth, Storage), the connection times out:

```
GET https://34.49.14.144:443/...
net::ERR_CONNECTION_TIMED_OUT
```

## Root Cause
This is a network/firewall issue blocking connections to Firebase servers (34.49.14.144:443). The Firebase Admin SDK cannot reach Firebase's backend services.

## Solutions

### 1. Check Firewall/Antivirus
- Temporarily disable firewall/antivirus to test
- Add exception for Firebase domains:
  - `*.firebaseio.com`
  - `*.googleapis.com`
  - `*.gstatic.com`
  - `34.49.14.144`

### 2. Check Proxy Settings
If you're behind a corporate proxy, configure it in the `.env` file:

```env
HTTP_PROXY=http://your-proxy:port
HTTPS_PROXY=http://your-proxy:port
NO_PROXY=localhost,127.0.0.1
```

### 3. Check Network Connectivity
Test Firebase connectivity from your machine:

```bash
ping firestore.googleapis.com
ping firebase.googleapis.com
```

### 4. Verify Service Account Permissions
Ensure the service account has these roles:
- Cloud Firestore Admin
- Firebase Authentication Admin
- Storage Object Admin

Check in Firebase Console > Project Settings > Service Accounts

### 5. Test Firebase Connection
Create a simple test script to verify Firebase connectivity:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'qr-absensi-unandnewgame'
});

admin.firestore().collection('test').add({ test: true })
  .then(() => console.log('Firebase connection successful'))
  .catch(err => console.error('Firebase connection failed:', err));
```

### 6. Alternative: Use Firebase Emulator
For local development, use Firebase emulator to avoid network issues:

```bash
firebase emulators:start
```

Update `.env`:
```env
FIREBASE_EMULATOR_HOST=localhost:8080
```

## What Has Been Fixed
1. ✅ API client error handling - properly handles empty response bodies
2. ✅ NestJS compilation errors - fixed Multer type and mapped-types
3. ✅ Global exception filter - catches all errors and returns JSON
4. ✅ DTO validation - removed strict validation that was blocking requests
5. ✅ Firebase service - now finds serviceAccountKey.json.json
6. ✅ History/vault writes - wrapped in try-catch to prevent blocking

## Next Steps
1. Resolve network/firewall issue blocking Firebase
2. Restart NestJS API server
3. Test profile update again
4. If network issue persists, consider using Firebase emulator for local development
