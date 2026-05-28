# Profile Update Errors - Fix Summary

## Root Causes Identified

1. **FormData vs Base64 Mismatch**: Client sent FormData, NestJS expected JSON with base64
2. **Admin Role Restriction**: Media controller required admin role, blocking regular users
3. **Content-Type Error**: API client set `application/json` for FormData uploads
4. **Poor Error Handling**: NestJS returned `{ ok: false }` instead of HTTP exceptions
5. **Missing Storage Rules**: No Firebase Storage security rules
6. **Missing Features**: No profile_history collection, no superadmin panel

## Fixes Applied

### 1. Next.js Client Photo Upload
**File**: `apps/web/src/app/(dashboard)/profile/page.tsx`

- Changed from FormData to base64 encoding using FileReader
- Removed FormData upload, now sends JSON with base64 data
- Added proper error handling for file reading

```typescript
// Before: FormData
const formData = new FormData();
formData.append('file', file);
const res = await api.upload('/media/upload', formData);

// After: Base64
const reader = new FileReader();
reader.onload = async () => {
  const base64 = reader.result as string;
  const data = base64.split(',')[1];
  const res = await api.post('/media/upload', {
    data, filename: file.name, mimeType: file.type, usage: 'avatar',
  });
};
reader.readAsDataURL(file);
```

### 2. NestJS Media Controller
**File**: `apps/api/src/modules/media/media.controller.ts`

- Removed `@Roles('admin')` from upload endpoint
- Kept admin guards for list/update/delete operations
- Allows all authenticated users to upload profile photos

```typescript
// Before: Admin only
@Controller('media')
@UseGuards(FirebaseAuthGuard, RolesGuard)
@Roles('admin')

// After: Authenticated users can upload
@Controller('media')
@UseGuards(FirebaseAuthGuard)
@Post('upload')
async upload(@CurrentUser() user: any, @Body() body: UploadMediaDto) {
  return this.mediaService.upload(user.uid, body);
}
```

### 3. NestJS Media Service
**File**: `apps/api/src/modules/media/media.service.ts`

- Added proper error handling with try-catch
- Added user ID validation
- Throws BadRequestException with clear error messages

```typescript
async upload(uploaderId: string, dto: UploadMediaDto) {
  if (!uploaderId) throw new BadRequestException('User ID required');
  try {
    // Upload logic
  } catch (err) {
    throw new BadRequestException(`Upload failed: ${err.message}`);
  }
}
```

### 4. NestJS Users Service
**File**: `apps/api/src/modules/users/users.service.ts`

- Changed `ref.set()` to `ref.update()` for Firestore
- Changed error handling from returning `{ ok: false }` to throwing exceptions
- Proper HTTP error responses

```typescript
// Before: Silent failure
catch (err) {
  return { ok: false, error: String(err) };
}

// After: Proper exception
catch (err) {
  if (err instanceof NotFoundException || err instanceof BadRequestException) throw err;
  throw new BadRequestException(`Profile update failed: ${err.message}`);
}
```

### 5. Firestore Rules
**File**: `FIRESTORE_RULES.md`

- Added `profile_history` collection rules
- Users can read own history, admins can read all
- Immutable (no update/delete)

```javascript
match /profile_history/{historyId} {
  allow read: if isAuthenticated() && (resource.data.userId == request.auth.uid || isAdmin());
  allow create: if isAuthenticated();
  allow update, delete: if false;
}
```

### 6. Firebase Storage Rules
**File**: `storage.rules` (new file)

- Created safe storage rules for profile photos
- Authenticated users can read media
- Users can write to their own avatar folder

```javascript
match /media/avatar/{userId}/{fileName} {
  allow read: if isAuthenticated();
  allow write: if isAuthenticated() && request.auth.uid == userId;
}
```

### 7. Superadmin Member Management
**Files**: 
- `apps/api/src/modules/members/members.controller.ts`
- `apps/api/src/modules/members/members.service.ts`
- `apps/web/src/app/(dashboard)/members/page.tsx`

**Backend Changes**:
- Added `POST /members/import` endpoint
- Supports CSV and JSON formats
- Bulk import with error tracking
- Before/after snapshot logging

```typescript
@Post('import')
import(@Body() body: { format: 'csv' | 'json'; data: string }, @CurrentUser() u: any) {
  return this.svc.import(body.format, body.data, u.uid);
}
```

**Frontend Changes**:
- Superadmin-only access control
- Import panel with CSV/JSON support
- File upload via drag-drop or click
- Real-time import results
- Enhanced member table with email, role columns

## Endpoint List

### Profile Management
- `PATCH /users/profile` - Update user profile (authenticated)
- `POST /media/upload` - Upload profile photo (authenticated, base64)

### Member Management (Superadmin)
- `GET /members` - List all members with pagination/filters
- `GET /members/:uid` - Get single member with history
- `POST /members` - Create new member
- `POST /members/import` - Bulk import CSV/JSON
- `PATCH /members/:uid` - Update member
- `DELETE /members/:uid` - Soft delete member

## Testing Steps

### 1. Test Profile Photo Upload
1. Login as any user (not just admin)
2. Navigate to Profile page
3. Click camera icon on avatar
4. Select JPG/PNG file under 2MB
5. Verify upload succeeds and photo updates
6. Check browser console for errors

### 2. Test Profile Data Save
1. Navigate to Profile page
2. Change display name or username
3. Click "Simpan Perubahan"
4. Verify success message appears
5. Refresh page and verify changes persist

### 3. Test Member Import (Superadmin)
1. Login as superadmin
2. Navigate to Members page
3. Click "Import Data"
4. Paste CSV or JSON data
5. Click "Import"
6. Verify created/failed counts
7. Refresh member list to see new members

### 4. Test Firebase Rules
1. Check Firebase Console > Firestore > Rules
2. Verify `profile_history` rules are present
3. Check Firebase Console > Storage > Rules
4. Apply `storage.rules` if not deployed

## CSV Import Format

```csv
name,email,username,division,role,memberId,status
John Doe,john@example.com,johndoe,IT,member,M001,active
Jane Smith,jane@example.com,janesmith,HR,admin,M002,active
```

## JSON Import Format

```json
[
  {
    "name": "John Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "division": "IT",
    "role": "member",
    "memberId": "M001",
    "status": "active"
  }
]
```

## Deployment Checklist

- [ ] Apply Firestore rules in Firebase Console
- [ ] Apply Storage rules in Firebase Console
- [ ] Restart NestJS API server
- [ ] Restart Next.js web server
- [ ] Test profile photo upload
- [ ] Test profile data save
- [ ] Test member import as superadmin
- [ ] Verify profile_history collection is created

## Notes

- Profile history is automatically logged on every profile update
- User vault stores versions for rollback capability
- Import validates email uniqueness
- Failed imports show specific error messages
- All write operations are tracked in logs collection
