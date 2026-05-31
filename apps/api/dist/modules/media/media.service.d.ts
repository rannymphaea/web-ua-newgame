import { FirebaseService } from '../../firebase/firebase.service';
export interface UploadMediaDto {
    data: string;
    filename: string;
    mimeType: string;
    usage: 'logo' | 'thumbnail' | 'banner' | 'avatar' | 'content' | 'other';
    altText?: string;
    tags?: string[];
}
export declare const AVATAR_LIST: readonly ["default", "neko", "chibi", "yua"];
export type AvatarKey = typeof AVATAR_LIST[number];
type UploadOk = {
    url: string;
    profile_upload: 'ok';
};
type UploadFailed = {
    profile_upload: 'failed';
    error: string;
};
export declare class MediaService {
    private firebase;
    private readonly ALLOWED_TYPES;
    private readonly MAX_SIZE;
    private readonly PROFILE_MAX_SIZE;
    private readonly logger;
    constructor(firebase: FirebaseService);
    private uploadToCloudinary;
    private deleteFromCloudinary;
    upload(uploaderId: string, dto: UploadMediaDto): Promise<{
        url: string;
        filename: string;
        mimeType: string;
        size: any;
        usage: "logo" | "thumbnail" | "banner" | "avatar" | "content" | "other";
        altText: string;
        tags: string[];
        uploadedBy: string;
        createdAt: Date;
        id: string;
    }>;
    uploadProfile(userId: string, file: Express.Multer.File, usage?: string): Promise<UploadOk | UploadFailed>;
    getAvatarList(): {
        avatar_list: string[];
    };
    selectAvatar(userId: string, avatar: AvatarKey): Promise<{
        status: "ok";
        avatar: "default" | "neko" | "chibi" | "yua";
        animation: string;
        sfx: string;
        profile_upload: "ok";
    }>;
    getAll(filters?: {
        usage?: string;
        mimeType?: string;
        limit?: number;
    }): Promise<{
        id: string;
    }[]>;
    delete(mediaId: string): Promise<{
        message: string;
    }>;
    updateMeta(mediaId: string, data: {
        altText?: string;
        tags?: string[];
        usage?: string;
    }): Promise<{
        altText?: string;
        tags?: string[];
        usage?: string;
        id: string;
    }>;
}
export {};
