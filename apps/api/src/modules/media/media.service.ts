import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// ─── DTOs & Types ─────────────────────────────────────────────────────────────

export interface UploadMediaDto {
  data:      string;
  filename:  string;
  mimeType:  string;
  usage:     'logo' | 'thumbnail' | 'banner' | 'avatar' | 'content' | 'other';
  altText?:  string;
  tags?:     string[];
}

export const AVATAR_LIST = ['default', 'neko', 'chibi', 'yua'] as const;
export type AvatarKey = typeof AVATAR_LIST[number];

type UploadOk     = { url: string; profile_upload: 'ok' };
type UploadFailed = { profile_upload: 'failed'; error: string };

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class MediaService {
  private readonly ALLOWED_TYPES = [
    'image/png', 'image/jpeg', 'image/jpg',
    'image/gif', 'image/webp', 'image/svg+xml',
  ];

  private readonly MAX_SIZE = 10 * 1024 * 1024;  // 10 MB
  private readonly PROFILE_MAX_SIZE = 2 * 1024 * 1024;  // 2 MB

  private readonly logger = new Logger(MediaService.name);

  constructor(private firebase: FirebaseService) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key:    process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  /** Upload buffer ke Cloudinary, kembalikan secure_url. */
  private uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => err ? reject(err) : resolve(result.secure_url),
      );
      Readable.from(buffer).pipe(stream);
    });
  }

  /** Hapus file dari Cloudinary berdasarkan URL-nya. */
  private async deleteFromCloudinary(url: string): Promise<void> {
    const parts       = url.split('/');
    const versionIdx  = parts.findIndex(p => /^v\d+$/.test(p));
    if (versionIdx === -1) return;

    const withExt = parts.slice(versionIdx + 1).join('/');
    const publicId = withExt.substring(0, withExt.lastIndexOf('.'));
    await cloudinary.uploader.destroy(publicId);
  }

  // ── Public methods ───────────────────────────────────────────────────────────

  /** Upload media umum (base64 payload). */
  async upload(uploaderId: string, dto: UploadMediaDto) {
    if (!uploaderId) throw new BadRequestException('User ID required');

    if (!this.ALLOWED_TYPES.includes(dto.mimeType)) {
      throw new BadRequestException(
        `Tipe file tidak didukung: ${dto.mimeType}`,
      );
    }

    const buffer = Buffer.from(dto.data, 'base64');
    if (buffer.length > this.MAX_SIZE) {
      throw new BadRequestException('Ukuran file melebihi batas 10MB');
    }

    try {
      const url = await this.uploadToCloudinary(buffer, `media/${dto.usage}`);

      const db  = this.firebase.getFirestore();
      const ref = db.collection('media').doc();
      const doc = {
        url,
        filename:    dto.filename,
        mimeType:    dto.mimeType,
        size:        buffer.length,
        usage:       dto.usage,
        altText:     dto.altText || '',
        tags:        dto.tags    || [],
        uploadedBy:  uploaderId,
        createdAt:   new Date(),
      };

      await ref.set(doc);
      return { id: ref.id, ...doc };
    } catch (err) {
      this.logger.error('Upload gagal:', err);
      throw new BadRequestException(
        `Upload gagal: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  /**
   * Upload foto profil (multipart/form-data).
   * Dicoba 2 kali. Jika dua-duanya gagal, kembalikan JSON error tanpa crash.
   */
  async uploadProfile(
    userId: string,
    file: Express.Multer.File,
    usage = 'avatar',
  ): Promise<UploadOk | UploadFailed> {
    if (!userId) throw new BadRequestException('User ID required');
    if (!file)   throw new BadRequestException('File wajib ada');

    if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Tipe file tidak didukung: ${file.mimetype}`);
    }
    if (file.size > this.PROFILE_MAX_SIZE) {
      throw new BadRequestException('Ukuran foto melebihi batas 2MB');
    }

    const doUpload = async (): Promise<string> => {
      const url = await this.uploadToCloudinary(file.buffer, `media/avatar/${userId}`);

      const db  = this.firebase.getFirestore();
      const ref = db.collection('media').doc();
      await ref.set({
        url,
        filename:   file.originalname,
        mimeType:   file.mimetype,
        size:       file.size,
        usage,
        uploadedBy: userId,
        createdAt:  new Date(),
      });

      return url;
    };

    // Percobaan pertama
    try {
      const url = await doUpload();
      return { url, profile_upload: 'ok' };
    } catch (err) {
      this.logger.warn(`Upload profil gagal (percobaan 1) uid=${userId}: ${err}`);
    }

    // Percobaan kedua (retry)
    this.logger.log(`upload_retry uid=${userId}`);
    try {
      const url = await doUpload();
      return { url, profile_upload: 'ok' };
    } catch (err) {
      this.logger.error(`Upload profil gagal (percobaan 2) uid=${userId}:`, err);
      return {
        profile_upload: 'failed',
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /** Kembalikan daftar avatar yang tersedia. */
  getAvatarList(): { avatar_list: string[] } {
    return { avatar_list: [...AVATAR_LIST] };
  }

  /** Simpan pilihan avatar ke Firestore. */
  async selectAvatar(userId: string, avatar: AvatarKey) {
    if (!AVATAR_LIST.includes(avatar)) {
      throw new BadRequestException(`Avatar tidak valid. Pilihan: ${AVATAR_LIST.join(', ')}`);
    }

    const db = this.firebase.getFirestore();
    await db.collection('users').doc(userId).update({
      activeAvatar:    avatar,
      avatarUpdatedAt: new Date().toISOString(),
    });

    return {
      status:         'ok' as const,
      avatar,
      animation:      avatar === 'yua' ? 'avatar_pulse' : null,
      sfx:            avatar === 'yua' ? '/assets/sfx/yua-select.mp3' : null,
      profile_upload: 'ok' as const,
    };
  }

  /** Ambil semua media dengan filter opsional (admin). */
  async getAll(filters?: { usage?: string; mimeType?: string; limit?: number }) {
    const db  = this.firebase.getFirestore();
    let   ref: FirebaseFirestore.Query = db.collection('media');

    if (filters?.usage) ref = ref.where('usage', '==', filters.usage);

    ref = ref.orderBy('createdAt', 'desc').limit(filters?.limit || 50);

    const snap = await ref.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  /** Hapus media dari Cloudinary dan Firestore. */
  async delete(mediaId: string) {
    const db  = this.firebase.getFirestore();
    const ref = db.collection('media').doc(mediaId);
    const doc = await ref.get();

    if (!doc.exists) throw new NotFoundException('Media tidak ditemukan');

    const data = doc.data();
    try {
      if (data.url?.includes('cloudinary.com')) {
        await this.deleteFromCloudinary(data.url);
      }
    } catch (e) {
      this.logger.warn('Gagal hapus file dari Cloudinary:', e);
    }

    await ref.delete();
    return { message: 'Media berhasil dihapus' };
  }

  /** Update metadata media (admin). */
  async updateMeta(mediaId: string, data: { altText?: string; tags?: string[]; usage?: string }) {
    const db  = this.firebase.getFirestore();
    const ref = db.collection('media').doc(mediaId);
    const doc = await ref.get();

    if (!doc.exists) throw new NotFoundException('Media tidak ditemukan');

    await ref.update({ ...data, updatedAt: new Date() });
    return { id: mediaId, ...data };
  }
}
