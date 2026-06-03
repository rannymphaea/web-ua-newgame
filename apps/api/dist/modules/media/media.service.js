"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MediaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = exports.AVATAR_LIST = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
exports.AVATAR_LIST = ['default', 'neko', 'chibi', 'yua'];
let MediaService = MediaService_1 = class MediaService {
    constructor(firebase) {
        this.firebase = firebase;
        this.ALLOWED_TYPES = [
            'image/png', 'image/jpeg', 'image/jpg',
            'image/gif', 'image/webp', 'image/svg+xml',
        ];
        this.MAX_SIZE = 10 * 1024 * 1024;
        this.PROFILE_MAX_SIZE = 2 * 1024 * 1024;
        this.logger = new common_1.Logger(MediaService_1.name);
        cloudinary_1.v2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    uploadToCloudinary(buffer, folder) {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({ folder }, (err, result) => err ? reject(err) : resolve(result.secure_url));
            stream_1.Readable.from(buffer).pipe(stream);
        });
    }
    async deleteFromCloudinary(url) {
        const parts = url.split('/');
        const versionIdx = parts.findIndex(p => /^v\d+$/.test(p));
        if (versionIdx === -1)
            return;
        const withExt = parts.slice(versionIdx + 1).join('/');
        const publicId = withExt.substring(0, withExt.lastIndexOf('.'));
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    async upload(uploaderId, dto) {
        if (!uploaderId)
            throw new common_1.BadRequestException('User ID required');
        if (!this.ALLOWED_TYPES.includes(dto.mimeType)) {
            throw new common_1.BadRequestException(`Tipe file tidak didukung: ${dto.mimeType}`);
        }
        const buffer = Buffer.from(dto.data, 'base64');
        if (buffer.length > this.MAX_SIZE) {
            throw new common_1.BadRequestException('Ukuran file melebihi batas 10MB');
        }
        try {
            const url = await this.uploadToCloudinary(buffer, `media/${dto.usage}`);
            const db = this.firebase.getFirestore();
            const ref = db.collection('media').doc();
            const doc = {
                url,
                filename: dto.filename,
                mimeType: dto.mimeType,
                size: buffer.length,
                usage: dto.usage,
                altText: dto.altText || '',
                tags: dto.tags || [],
                uploadedBy: uploaderId,
                createdAt: new Date(),
            };
            await ref.set(doc);
            return { id: ref.id, ...doc };
        }
        catch (err) {
            this.logger.error('Upload gagal:', err);
            throw new common_1.BadRequestException(`Upload gagal: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    async uploadProfile(userId, file, usage = 'avatar') {
        if (!userId)
            throw new common_1.BadRequestException('User ID required');
        if (!file)
            throw new common_1.BadRequestException('File wajib ada');
        if (!this.ALLOWED_TYPES.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Tipe file tidak didukung: ${file.mimetype}`);
        }
        if (file.size > this.PROFILE_MAX_SIZE) {
            throw new common_1.BadRequestException('Ukuran foto melebihi batas 2MB');
        }
        const doUpload = async () => {
            const url = await this.uploadToCloudinary(file.buffer, `media/avatar/${userId}`);
            const db = this.firebase.getFirestore();
            const ref = db.collection('media').doc();
            await ref.set({
                url,
                filename: file.originalname,
                mimeType: file.mimetype,
                size: file.size,
                usage,
                uploadedBy: userId,
                createdAt: new Date(),
            });
            return url;
        };
        try {
            const url = await doUpload();
            return { url, profile_upload: 'ok' };
        }
        catch (err) {
            this.logger.warn(`Upload profil gagal (percobaan 1) uid=${userId}: ${err}`);
        }
        this.logger.log(`upload_retry uid=${userId}`);
        try {
            const url = await doUpload();
            return { url, profile_upload: 'ok' };
        }
        catch (err) {
            this.logger.error(`Upload profil gagal (percobaan 2) uid=${userId}:`, err);
            return {
                profile_upload: 'failed',
                error: err instanceof Error ? err.message : String(err),
            };
        }
    }
    getAvatarList() {
        return { avatar_list: [...exports.AVATAR_LIST] };
    }
    async selectAvatar(userId, avatar) {
        if (!exports.AVATAR_LIST.includes(avatar)) {
            throw new common_1.BadRequestException(`Avatar tidak valid. Pilihan: ${exports.AVATAR_LIST.join(', ')}`);
        }
        const db = this.firebase.getFirestore();
        await db.collection('users').doc(userId).update({
            activeAvatar: avatar,
            avatarUpdatedAt: new Date().toISOString(),
        });
        return {
            status: 'ok',
            avatar,
            animation: avatar === 'yua' ? 'avatar_pulse' : null,
            sfx: avatar === 'yua' ? '/assets/sfx/yua-select.mp3' : null,
            profile_upload: 'ok',
        };
    }
    async getAll(filters) {
        const db = this.firebase.getFirestore();
        let ref = db.collection('media');
        if (filters?.usage)
            ref = ref.where('usage', '==', filters.usage);
        ref = ref.orderBy('createdAt', 'desc').limit(filters?.limit || 50);
        const snap = await ref.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async delete(mediaId) {
        const db = this.firebase.getFirestore();
        const ref = db.collection('media').doc(mediaId);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Media tidak ditemukan');
        const data = doc.data();
        try {
            if (data.url?.includes('cloudinary.com')) {
                await this.deleteFromCloudinary(data.url);
            }
        }
        catch (e) {
            this.logger.warn('Gagal hapus file dari Cloudinary:', e);
        }
        await ref.delete();
        return { message: 'Media berhasil dihapus' };
    }
    async updateMeta(mediaId, data) {
        const db = this.firebase.getFirestore();
        const ref = db.collection('media').doc(mediaId);
        const doc = await ref.get();
        if (!doc.exists)
            throw new common_1.NotFoundException('Media tidak ditemukan');
        await ref.update({ ...data, updatedAt: new Date() });
        return { id: mediaId, ...data };
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = MediaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], MediaService);
//# sourceMappingURL=media.service.js.map