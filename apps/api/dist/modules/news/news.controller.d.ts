import { NewsService, CreateNewsDto, UpdateNewsDto } from './news.service';
export declare class NewsController {
    private newsService;
    constructor(newsService: NewsService);
    getPublished(category?: string, tutorialCategory?: string, tag?: string, featured?: string, search?: string, limit?: string, offset?: string): Promise<{
        id: string;
    }[]>;
    getSliderPosts(): Promise<{
        id: string;
    }[]>;
    getTutorials(): Promise<{
        'game-logic': any[];
        'game-design': any[];
        'game-sound': any[];
    }>;
    getOne(idOrSlug: string): Promise<{
        id: string;
    }>;
    getAll(status?: string, category?: string, limit?: string): Promise<{
        id: string;
    }[]>;
    create(user: any, body: CreateNewsDto): Promise<{
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
        status: "published" | "draft" | "archived";
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
    update(id: string, body: UpdateNewsDto): Promise<any>;
    archive(id: string): Promise<{
        message: string;
    }>;
    restore(id: string): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
