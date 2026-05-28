import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../../firebase/firebase.service';

export interface CreateNewsDto {
  title: string;
  content: string;
  excerpt?: string;
  category: 'blog' | 'news' | 'event' | 'tutorial';
  /** Sub-category khusus tutorial: game-logic, game-design, game-sound */
  tutorialCategory?: 'game-logic' | 'game-design' | 'game-sound';
  /** YouTube URL untuk tutorial */
  youtubeUrl?: string;
  thumbnail?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  priority?: number;
  eventDate?: string;
}

export interface UpdateNewsDto extends Partial<CreateNewsDto> {}

@Injectable()
export class NewsService {
  constructor(private firebaseService: FirebaseService) {}

  /**
   * Create a news/blog/event/tutorial post
   */
  async create(authorId: string, authorName: string, data: CreateNewsDto) {
    const db = this.firebaseService.getFirestore();

    if (!data.title || !data.content || !data.category) {
      throw new BadRequestException('Title, content, and category are required');
    }

    // Validate tutorial must have youtubeUrl
    if (data.category === 'tutorial' && !data.youtubeUrl) {
      throw new BadRequestException('Tutorial posts must include a YouTube URL');
    }

    // Validate YouTube URL format
    if (data.youtubeUrl && !this.isValidYouTubeUrl(data.youtubeUrl)) {
      throw new BadRequestException('Invalid YouTube URL format');
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

  /**
   * Update a post
   */
  async update(newsId: string, data: UpdateNewsDto) {
    const db = this.firebaseService.getFirestore();
    const ref = db.collection('news').doc(newsId);
    const doc = await ref.get();

    if (!doc.exists) {
      throw new NotFoundException('Post not found');
    }

    const updateData: any = { ...data, updatedAt: new Date() };

    if (data.title) {
      updateData.slug = this.generateSlug(data.title);
    }

    if (data.youtubeUrl) {
      if (!this.isValidYouTubeUrl(data.youtubeUrl)) {
        throw new BadRequestException('Invalid YouTube URL');
      }
      updateData.youtubeEmbedId = this.extractYouTubeId(data.youtubeUrl);
    }

    // If changing to published and wasn't before
    if (data.status === 'published' && doc.data()?.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    await ref.update(updateData);
    return { id: newsId, ...updateData };
  }

  /**
   * Get published posts — public, with filters & pagination
   */
  async getPublished(filters?: {
    category?: string;
    tutorialCategory?: string;
    tag?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    search?: string;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('news')
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

    // Client-side search (Firestore doesn't support full-text search natively)
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter((r: any) =>
        r.title?.toLowerCase().includes(searchLower) ||
        r.content?.toLowerCase().includes(searchLower) ||
        r.excerpt?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by tag client-side
    if (filters?.tag) {
      results = results.filter((r: any) => r.tags?.includes(filters.tag));
    }

    return results;
  }

  /**
   * Get all posts — admin view (includes drafts, archived)
   */
  async getAll(filters?: {
    status?: string;
    category?: string;
    limit?: number;
  }) {
    const db = this.firebaseService.getFirestore();
    let ref: FirebaseFirestore.Query = db.collection('news');

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

  /**
   * Get single post by ID or slug
   */
  async getOne(idOrSlug: string) {
    const db = this.firebaseService.getFirestore();

    // Try by ID first
    const byId = await db.collection('news').doc(idOrSlug).get();
    if (byId.exists) {
      // Increment views
      await db.collection('news').doc(idOrSlug).update({
        views: (byId.data()?.views || 0) + 1,
      });
      return { id: byId.id, ...byId.data() };
    }

    // Try by slug
    const bySlug = await db.collection('news')
      .where('slug', '==', idOrSlug)
      .limit(1)
      .get();

    if (bySlug.empty) {
      throw new NotFoundException('Post not found');
    }

    const doc = bySlug.docs[0];
    await doc.ref.update({ views: (doc.data().views || 0) + 1 });
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Get tutorials grouped by category
   */
  async getTutorials() {
    const db = this.firebaseService.getFirestore();
    const snap = await db.collection('news')
      .where('status', '==', 'published')
      .where('category', '==', 'tutorial')
      .orderBy('priority', 'desc')
      .orderBy('publishedAt', 'desc')
      .get();

    const grouped = {
      'game-logic': [] as any[],
      'game-design': [] as any[],
      'game-sound': [] as any[],
    };

    snap.docs.forEach(d => {
      const data = { id: d.id, ...d.data() };
      const cat = (data as any).tutorialCategory;
      if (cat && grouped[cat]) {
        grouped[cat].push(data);
      }
    });

    return grouped;
  }

  /**
   * Delete a post
   */
  async delete(newsId: string) {
    const db = this.firebaseService.getFirestore();
    const ref = db.collection('news').doc(newsId);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException('Post not found');
    }
    await ref.delete();
    return { message: 'Post deleted' };
  }

  /**
   * Archive a post (soft-delete)
   */
  async archive(newsId: string) {
    const db = this.firebaseService.getFirestore();
    const ref = db.collection('news').doc(newsId);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException('Post not found');
    }
    await ref.update({
      status: 'archived',
      archivedAt: new Date(),
      updatedAt: new Date(),
    });
    return { message: 'Post archived' };
  }

  /**
   * Restore an archived post
   */
  async restore(newsId: string) {
    const db = this.firebaseService.getFirestore();
    const ref = db.collection('news').doc(newsId);
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException('Post not found');
    }
    if (doc.data()?.status !== 'archived') {
      throw new BadRequestException('Post is not archived');
    }
    await ref.update({
      status: 'draft',
      archivedAt: null,
      updatedAt: new Date(),
    });
    return { message: 'Post restored to draft' };
  }

  /**
   * Get featured posts for the slider (max 10)
   */
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

  // ── Helpers ──────────────────────────────────────────

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
      + '-' + Date.now().toString(36);
  }

  private isValidYouTubeUrl(url: string): boolean {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
      /^https?:\/\/youtu\.be\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/embed\/[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
    ];
    return patterns.some(p => p.test(url));
  }

  private extractYouTubeId(url: string): string | null {
    const regexes = [
      /(?:youtube\.com\/watch\?v=)([\w-]+)/,
      /(?:youtu\.be\/)([\w-]+)/,
      /(?:youtube\.com\/embed\/)([\w-]+)/,
      /(?:youtube\.com\/shorts\/)([\w-]+)/,
    ];
    for (const r of regexes) {
      const match = url.match(r);
      if (match) return match[1];
    }
    return null;
  }
}
