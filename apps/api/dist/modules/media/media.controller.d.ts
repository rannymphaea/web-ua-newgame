import { MediaService, UploadMediaDto, AvatarKey } from './media.service';
export declare class MediaController {
    private mediaService;
    constructor(mediaService: MediaService);
    upload(user: any, body: UploadMediaDto): Promise<{
        url: string;
        filename: string;
        mimeType: string;
        size: number;
        usage: "other" | "logo" | "thumbnail" | "banner" | "avatar" | "content";
        altText: string;
        tags: string[];
        uploadedBy: string;
        createdAt: Date;
        id: string;
    }>;
    uploadProfile(user: any, file: Express.Multer.File): Promise<{
        url: string;
        profile_upload: "ok";
    } | {
        profile_upload: "failed";
        error: string;
    }>;
    getAvatarList(): {
        avatar_list: string[];
    };
    selectAvatar(user: any, avatar: AvatarKey): Promise<{
        status: "ok";
        avatar: "default" | "neko" | "chibi" | "yua";
        animation: string;
        sfx: string;
        profile_upload: "ok";
    }>;
    getAll(usage?: string, mimeType?: string, limit?: string): Promise<{
        id: string;
    }[]>;
    updateMeta(id: string, body: {
        altText?: string;
        tags?: string[];
        usage?: string;
    }): Promise<{
        altText?: string;
        tags?: string[];
        usage?: string;
        id: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
