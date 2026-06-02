/**
 * API Response Types — NEWGAME shared type definitions
 * Dipakai di frontend (fetch calls) dan backend (interceptor shape)
 */

// ── Standard API Response ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta?: ApiMeta;
  timestamp: string;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  [key: string]: unknown;
}

// ── Paginated response helper ─────────────────────────────────
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: Required<Pick<ApiMeta, 'page' | 'limit' | 'total' | 'totalPages'>>;
}

// ── User & Auth types ─────────────────────────────────────────
export type UserRole = 'TRAINEE' | 'ASSOCIATE' | 'TRAINER' | 'SOLDAT' | 'ADMIN' | 'OWNER';
export type UserGender = 'MALE' | 'FEMALE' | 'UNSPECIFIED';

export interface UserPublic {
  id: string;
  email: string;
  displayName: string | null;
  photoUrl: string | null;
  role: UserRole;
  nim: string | null;
  angkatan: number | null;
}

export interface UserProfile extends UserPublic {
  bio: string | null;
  github: string | null;
  linkedin: string | null;
  skills: string[];
  pillar: string | null;
  currentExp: number;
  totalExp: number;
  level: number;
}

// ── News types ────────────────────────────────────────────────
export type NewsStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverUrl: string | null;
  authorId: string;
  author?: Pick<UserPublic, 'displayName' | 'photoUrl'>;
  status: NewsStatus;
  tags: string[];
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
}

export interface NewsArticleDetail extends NewsArticle {
  content: string;
}

// ── Event & Attendance types ──────────────────────────────────
export type EventType = 'WEEKLY_STUDY' | 'MANDATORY' | 'OPTIONAL' | 'COMPETITION' | 'INTERNAL';
export type AttendanceStatus = 'PRESENT' | 'LATE' | 'EXCUSED' | 'ABSENT';

export interface EventItem {
  id: string;
  title: string;
  type: EventType;
  location: string | null;
  startAt: string;
  endAt: string | null;
  isRequired: boolean;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  eventId: string;
  status: AttendanceStatus;
  checkedAt: string;
}

// ── XP & Leaderboard types ────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoUrl: string | null;
  pillar: string | null;
  totalExp: number;
  level: number;
  role: UserRole;
}

// ── Fetch helpers ─────────────────────────────────────────────
/** Unwrap data dari ApiResponse, throw jika tidak success */
export async function fetchApi<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error?.message ?? `HTTP ${res.status}`);
  }

  return json.data;
}
