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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../firebase/firebase.service");
let NewsService = class NewsService {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
    }
    async create(authorId, authorName, data) {
        const db = this.firebaseService.getFirestore();
        if (!data.title || !data.content || !data.category) {
            throw new common_1.BadRequestException('Title, content, and category are required');
        }
        if (data.category === 'tutorial' && !data.youtubeUrl) {
            throw new common_1.BadRequestException('Tutorial posts must include a YouTube URL');
        }
        if (data.youtubeUrl && !this.isValidYouTubeUrl(data.youtubeUrl)) {
            throw new common_1.BadRequestException('Invalid YouTube URL format');
        }
        const slug = this.generateSlug(data.title);
        const newsRef = db.collection('news').doc();
        const newsData = {
            title: data.title,
            slug,
            content: data.content,
            excerpt: data.excerpt || data.content.substring(0, 160) + '...',
            category: data.category,
            tutorialCategory: data.tutorialCategory || null,
            youtubeUrl: data.youtubeUrl || null,
            youtubeEmbedId: data.youtubeUrl ? this.extractYouTubeId(data.youtubeUrl) : null,
            thumbnail: data.thumbnail || null,
            tags: data.tags || [],
            status: data.status || 'draft',
            featured: data.featured || false,
            priority: data.priority || 0,
            eventDate: data.eventDate ? new Date(data.eventDate) : null,
            author: authorId,
            authorName,
            views: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            publishedAt: data.status === 'published' ? new Date() : null,
        };
        await newsRef.set(newsData);
        return { id: newsRef.id, slug, ...newsData };
    }
    async update(newsId, data) {
        const db = this.firebaseService.getFirestore();
        const ref = db.collection('news').doc(newsId);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Post not found');
        }
        const updateData = { ...data, updatedAt: new Date() };
        if (data.title) {
            updateData.slug = this.generateSlug(data.title);
        }
        if (data.youtubeUrl) {
            if (!this.isValidYouTubeUrl(data.youtubeUrl)) {
                throw new common_1.BadRequestException('Invalid YouTube URL');
            }
            updateData.youtubeEmbedId = this.extractYouTubeId(data.youtubeUrl);
        }
        if (data.status === 'published' && doc.data()?.status !== 'published') {
            updateData.publishedAt = new Date();
        }
        await ref.update(updateData);
        return { id: newsId, ...updateData };
    }
    async getPublished(filters) {
        const db = this.firebaseService.getFirestore();
        let ref = db.collection('news')
            .where('status', '==', 'published');
        if (filters?.category) {
            ref = ref.where('category', '==', filters.category);
        }
        if (filters?.tutorialCategory) {
            ref = ref.where('tutorialCategory', '==', filters.tutorialCategory);
        }
        if (filters?.featured) {
            ref = ref.where('featured', '==', true);
        }
        ref = ref.orderBy('publishedAt', 'desc').limit(filters?.limit || 20);
        if (filters?.offset) {
            ref = ref.offset(filters.offset);
        }
        const snap = await ref.get();
        let results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (filters?.search) {
            const searchLower = filters.search.toLowerCase();
            results = results.filter((r) => r.title?.toLowerCase().includes(searchLower) ||
                r.content?.toLowerCase().includes(searchLower) ||
                r.excerpt?.toLowerCase().includes(searchLower));
        }
        if (filters?.tag) {
            results = results.filter((r) => r.tags?.includes(filters.tag));
        }
        return results;
    }
    async getAll(filters) {
        const db = this.firebaseService.getFirestore();
        let ref = db.collection('news');
        if (filters?.status) {
            ref = ref.where('status', '==', filters.status);
        }
        if (filters?.category) {
            ref = ref.where('category', '==', filters.category);
        }
        ref = ref.orderBy('createdAt', 'desc').limit(filters?.limit || 50);
        const snap = await ref.get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    async getOne(idOrSlug) {
        const db = this.firebaseService.getFirestore();
        const byId = await db.collection('news').doc(idOrSlug).get();
        if (byId.exists) {
            await db.collection('news').doc(idOrSlug).update({
                views: (byId.data()?.views || 0) + 1,
            });
            return { id: byId.id, ...byId.data() };
        }
        const bySlug = await db.collection('news')
            .where('slug', '==', idOrSlug)
            .limit(1)
            .get();
        if (bySlug.empty) {
            throw new common_1.NotFoundException('Post not found');
        }
        const doc = bySlug.docs[0];
        await doc.ref.update({ views: (doc.data().views || 0) + 1 });
        return { id: doc.id, ...doc.data() };
    }
    async getTutorials() {
        const db = this.firebaseService.getFirestore();
        const snap = await db.collection('news')
            .where('status', '==', 'published')
            .where('category', '==', 'tutorial')
            .orderBy('priority', 'desc')
            .orderBy('publishedAt', 'desc')
            .get();
        const grouped = {
            'game-logic': [],
            'game-design': [],
            'game-sound': [],
        };
        snap.docs.forEach(d => {
            const data = { id: d.id, ...d.data() };
            const cat = data.tutorialCategory;
            if (cat && grouped[cat]) {
                grouped[cat].push(data);
            }
        });
        return grouped;
    }
    async delete(newsId) {
        const db = this.firebaseService.getFirestore();
        const ref = db.collection('news').doc(newsId);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Post not found');
        }
        await ref.delete();
        return { message: 'Post deleted' };
    }
    async archive(newsId) {
        const db = this.firebaseService.getFirestore();
        const ref = db.collection('news').doc(newsId);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Post not found');
        }
        await ref.update({
            status: 'archived',
            archivedAt: new Date(),
            updatedAt: new Date(),
        });
        return { message: 'Post archived' };
    }
    async restore(newsId) {
        const db = this.firebaseService.getFirestore();
        const ref = db.collection('news').doc(newsId);
        const doc = await ref.get();
        if (!doc.exists) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (doc.data()?.status !== 'archived') {
            throw new common_1.BadRequestException('Post is not archived');
        }
        await ref.update({
            status: 'draft',
            archivedAt: null,
            updatedAt: new Date(),
        });
        return { message: 'Post restored to draft' };
    }
    async getSliderPosts() {
        const db = this.firebaseService.getFirestore();
        const snap = await db.collection('news')
            .where('status', '==', 'published')
            .where('featured', '==', true)
            .orderBy('priority', 'desc')
            .orderBy('publishedAt', 'desc')
            .limit(10)
            .get();
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    }
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            + '-' + Date.now().toString(36);
    }
    isValidYouTubeUrl(url) {
        const patterns = [
            /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
            /^https?:\/\/youtu\.be\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
            /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
        ];
        return patterns.some(p => p.test(url));
    }
    extractYouTubeId(url) {
        const regexes = [
            /(?:youtube\.com\/watch\?v=)([\w-]+)/,
            /(?:youtu\.be\/)([\w-]+)/,
            /(?:youtube\.com\/embed\/)([\w-]+)/,
            /(?:youtube\.com\/shorts\/)([\w-]+)/,
        ];
        for (const r of regexes) {
            const match = url.match(r);
            if (match)
                return match[1];
        }
        return null;
    }
};
exports.NewsService = NewsService;
exports.NewsService = NewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], NewsService);
//# sourceMappingURL=news.service.js.map