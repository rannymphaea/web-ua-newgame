import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

export interface UploadMediaDto {
  data: string;
  filename: string;
  mimeType: string;
  usage: 'logo' | 'thumbnail' | 'banner' | 'avatar' | 'content' | 'other';
  altText?: string;
  tags?: string[];
}

/** All supported avatar keys */
export const AVATAR_LIST = ['default', 'neko', 'chibi', 'yua'] as const;
export type AvatarKey = typeof AVATAR_LIST[number];

@Injectable()
export class MediaService {
  private readonly ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/jpg', 'image/gif',
    'image/webp', 'image/svg+xml',
  ];
  private readonly MAX_SIZE_BYTES = 10 * 1024 * 1024;
  private readonly logger = new Logger(MediaService.name);

  constructor(private firebaseService: FirebaseService) {}

  async upload(uploaderId: string, dto: UploadMediaDto) {
    if (!uploaderId) throw new BadRequestException('User ID required');

    if (!this.ALLOWED_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException(
        `Invalid file type: ${dto.mimeType}. Allowed: ${this.ALLOWED_TYPES.join(', ')}`
      );
    }

    const buffer = Buffer.from(dto.data, 'base64');
    if (buffer.length > this.MAX_SIZE_BYTES) {
      throw new BadRequestException(`File too large. Max size: ${this.MAX_SIZE_BYTES / 1024 / 1024}MB`);
    }

    const ext = dto.filename.split('.').pop() || 'png';
    const uniqueName = `${dto.usage}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    try {
      const storage = this.firebaseService.getStorage();
      const bucket = storage.bucket();
      console.log('Using bucket:', bucket.name);
      const file = bucket.file(`media/${uniqueName}`);

      await file.save(buffer, {
        metadata: {
          contentType: dto.mimeType,
          metadata: {
            uploadedBy: uploaderId,
            usage: dto.usage,
            originalName: dto.filename,
          },
        },
      });

      await file.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/media/${uniqueName}`;

      const db = this.firebaseService.getFirestore();
      const mediaRef = db.collection('media').doc();
      const mediaData = {
        url: publicUrl,
        filename: dto.filename,
        storagePath: `media/${uniqueName}`,
        mimeType: dto.mimeType,
        size: buffer.length,
        usage: dto.usage,
        altText: dto.altText || '',
        tags: dto.tags || [],
        uploadedBy: uploaderId,
        createdAt: new Date(),
      };

      await mediaRef.set(mediaData);
      return { id: mediaRef.id, ...mediaData };
    } catch (err) {
      this.logger.error('Upload error:', err);
      throw new BadRequestException(`Upload failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  /** Upload foto profil — retry sekali jika gagal, kembalikan JSON clean jika tetap gagal */
  async uploadProfile(
    userId: string,
    file: any,
    usage: string = 'avatar',
  ): Promise<{ url: string; profile_upload: 'ok' } | { profile_upload: 'failed'; error: string }> {
    if (!userId) throw new BadRequestException('User ID required');
    if (!file) throw new BadRequestException('File required');

    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type: ${file.mimetype}. Allowed: ${this.ALLOWED_TYPES.join(', ')}`,
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File too large. Max size: 2MB');
    }

    const ext = file.originalname.split('.').pop() || 'jpg';
    const uniqueName = `media/avatar/${userId}/profile.${ext}`;

    const doUpload = async () => {
      const storage = this.firebaseService.getStorage();
      const bucket = storage.bucket();
      const fileRef = bucket.file(uniqueName);

      await fileRef.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
          metadata: {
            uploadedBy: userId,
            usage,
            originalName: file.originalname,
          },
        },
      });

      await fileRef.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${uniqueName}`;

      const db = this.firebaseService.getFirestore();
      const mediaRef = db.collection('media').doc();
      await mediaRef.set({
        url: publicUrl,
        filename: file.originalname,
        storagePath: uniqueName,
        mimeType: file.mimetype,
        size: file.size,
        usage,
        uploadedBy: userId,
        createdAt: new Date(),
      });

      return publicUrl;
    };

    // First attempt
    try {
      const url = await doUpload();
      return { url, profile_upload: 'ok' };
    } catch (firstErr) {
      this.logger.warn(`Profile upload first attempt failed for uid=${userId}: ${firstErr}`);
    }

    // Retry once — send event marker before retry
    this.logger.log(`upload_retry uid=${userId}`);
    try {
      const url = await doUpload();
      return { url, profile_upload: 'ok' };
    } catch (retryErr) {
      this.logger.error(`Profile upload retry also failed for uid=${userId}:`, retryErr);
      // Never crash — return clean error JSON
      return { profile_upload: 'failed', error: 'unknown_system_error' };
    }
  }

  /** Kembalikan daftar avatar yang tersedia */
  getAvatarList(): { avatar_list: string[] } {
    return { avatar_list: [...AVATAR_LIST] };
  }

  /** Simpan pilihan avatar ke Firestore untuk user tertentu */
  async selectAvatar(
    userId: string,
    avatar: AvatarKey,
  ): Promise<{
    status: 'ok';
    avatar: AvatarKey;
    animation: string;
    sfx: string | null;
    profile_upload: 'ok' | 'failed';
  }> {
    if (!AVATAR_LIST.includes(avatar)) {
      throw new BadRequestException(`Avatar tidak valid. Pilihan: ${AVATAR_LIST.join(', ')}`);
    }

    const db = this.firebaseService.getFirestore();
    await db.collection('users').doc(userId).update({
      activeAvatar: avatar,
      avatarUpdatedAt: new Date().toISOString(),
    });

    const sfx = avatar === 'yua' ? '/assets/sfx/yua-select.mp3' : null;
    const animation = avatar === 'yua' ? 'avatar_pulse' : null;

    return {
      status: 'ok',
      avatar,
      animation,
      sfx,
      profile_upload: 'ok',
    };
  }

  async getAll(filters?: {
    usage?: string;
    mimeType?: string;
    limit?: number;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('media');

    if (filters?.usage) {
      ref = ref.where('usage', '==', filters.usage);
    }

    ref = ref.orderBy('createdAt', 'desc').limit(filters?.limit || 50);

    const snap = await ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async delete(mediaId: string) {
    const db = this.firebaseService.getFirestore();
    const mediaRef = db.collection('media').doc(mediaId);
    const doc = await mediaRef.get();

    if (!doc.exists) {
      throw new NotFoundException('Media not found');
    }

    const data = doc.data();

    try {
      const storage = this.firebaseService.getStorage();
      const bucket = storage.bucket();
      await bucket.file(data.storagePath).delete();
    } catch (e) {}

    await mediaRef.delete();
    return { message: 'Media deleted' };
  }

  async updateMeta(mediaId: string, data: { altText?: string; tags?: string[]; usage?: string }) {
    const db = this.firebaseService.getFirestore();
    const ref = db.collection('media').doc(mediaId);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException('Media not found');
    }
    await ref.update({ ...data, updatedAt: new Date() });
    return { id: mediaId, ...data };
  }
}
