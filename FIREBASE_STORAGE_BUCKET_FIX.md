# Firebase Storage Bucket Error - Action Required

## Error
```
Error: Upload failed: {
  "error": {
    "code": 404,
    "message": "The specified bucket does not exist.",
    ...
  }
}
```

## Root Cause
The Firebase Storage bucket `qr-absensi-unandnewgame.appspot.com` does not exist in your Firebase project.

## Solution

### Option 1: Create the Bucket in Firebase Console
1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: `qr-absensi-unandnewgame`
3. Navigate to Storage
4. Click "Get Started"
5. Choose a location (e.g., asia-southeast1 for Indonesia)
6. Set security rules to "Test mode" initially
7. Click "Done"

### Option 2: Use Existing Bucket Name
If a bucket already exists with a different name:
1. Go to Firebase Console > Storage
2. Note the actual bucket name
3. Update `.env` file:
   ```env
   FIREBASE_STORAGE_BUCKET=your-actual-bucket-name
   ```
4. Restart the API server

### Option 3: Use Firebase CLI
```bash
firebase projects:list
firebase init storage
firebase deploy --only storage
```

## Current Configuration
- Project ID: `qr-absensi-unandnewgame`
- Configured Bucket: `qr-absensi-unandnewgame.appspot.com`
- API Server: Running on `http://localhost:3001`

## After Creating the Bucket
1. Apply the storage rules from `storage.rules` file in Firebase Console
2. Restart the NestJS API server
3. Test profile photo upload again

## Storage Rules
The `storage.rules` file contains the security rules for profile photo uploads. Apply these rules in Firebase Console > Storage > Rules after creating the bucket.
