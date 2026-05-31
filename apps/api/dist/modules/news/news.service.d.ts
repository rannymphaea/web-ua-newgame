import { FirebaseService } from '../../firebase/firebase.service';
export interface CreateNewsDto {
    title: string;
    content: string;
    excerpt?: string;
    category: 'blog' | 'news' | 'event' | 'tutorial';
    tutorialCategory?: 'game-logic' | 'game-design' | 'game-sound';
    youtubeUrl?: string;
    thumbnail?: string;
    tags?: string[];
    status?: 'draft' | 'published' | 'archived';
    featured?: boolean;
    priority?: number;
    eventDate?: string;
}
export interface UpdateNewsDto extends Partial<CreateNewsDto> {
}
export declare class NewsService {
    private firebaseService;
    constructor(firebaseService: FirebaseService);
    create(authorId: string, authorName: string, data: CreateNewsDto): Promise<{
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        category: "event" | "news" | "blog" | "tutorial";
        tutorialCategory: "game-logic" | "game-design" | "game-sound";
        youtubeUrl: string;
        youtubeEmbedId: string;
        thumbnail: string;
        tags: string[];
        status: "draft" | "published" | "archived";
        featured: boolean;
        priority: number;
        eventDate: Date;
        author: string;
        authorName: string;
        views: number;
        createdAt: Date;
        updatedAt: Date;
        publishedAt: Date;
        id: string;
    }>;
    update(newsId: string, data: UpdateNewsDto): Promise<any>;
    getPublished(filters?: {
        category?: string;
        tutorialCategory?: string;
        tag?: string;
        featured?: boolean;
        limit?: number;
        offset?: number;
        search?: string;
    }): Promise<{
        id: string;
    }[]>;
    getAll(filters?: {
        status?: string;
        category?: string;
        limit?: number;
    }): Promise<{
        id: string;
    }[]>;
    getOne(idOrSlug: string): Promise<{
        id: string;
    }>;
    getTutorials(): Promise<{
        'game-logic': any[];
        'game-design': any[];
        'game-sound': any[];
    }>;
    delete(newsId: string): Promise<{
        message: string;
    }>;
    archive(newsId: string): Promise<{
        message: string;
    }>;
    restore(newsId: string): Promise<{
        message: string;
    }>;
    getSliderPosts(): Promise<{
        id: string;
    }[]>;
    private generateSlug;
    private isValidYouTubeUrl;
    private extractYouTubeId;
}
