// HTTP client inti — NEWGAME v0.1.4
// Dipakai oleh semua halaman untuk komunikasi ke backend.
// API calls go through Next.js rewrites proxy (/api/* → backend).
// Enhanced: throws ApiError with user-friendly Indonesian messages.
import { ApiError, getErrorMessage } from './errors';

const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        let rawMessage = `API Error ${res.status}`;
        let errorCode = '';
        try {
          const text = await res.text();
          if (text) {
            // Detect HTML response (API URL misconfigured or backend down)
            if (text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html')) {
              rawMessage = 'Server API tidak dapat dihubungi. Pastikan backend sudah berjalan.';
              errorCode = 'API_UNREACHABLE';
            } else {
              const err = JSON.parse(text);
              rawMessage = err.message || err.error || rawMessage;
              errorCode = err.code || err.error || '';
            }
          } else {
            rawMessage = res.statusText || rawMessage;
          }
        } catch {
          rawMessage = res.statusText || rawMessage;
        }
        throw new ApiError(res.status, rawMessage, errorCode);
      }

      const text = await res.text();
      if (!text) return null;
      // Detect HTML in success response (should never happen, but safety net)
      if (text.trimStart().startsWith('<!') || text.trimStart().startsWith('<html')) {
        throw new ApiError(502, 'Server mengembalikan respons yang tidak valid', 'INVALID_RESPONSE');
      }
      return JSON.parse(text);
    } catch (err: any) {
      clearTimeout(timeout);

      // Re-throw ApiError as-is
      if (err instanceof ApiError) {
        throw err;
      }

      // Network/timeout errors
      if (err.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout', 'TIMEOUT');
      }
      if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
        throw new ApiError(0, 'Network error', 'NETWORK_ERROR');
      }
      throw err;
    }
  }

  get<T = any>(path: string): Promise<T> { return this.request(path); }
  post<T = any>(path: string, body: any): Promise<T> { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); }
  patch<T = any>(path: string, body: any): Promise<T> { return this.request(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete<T = any>(path: string): Promise<T> { return this.request(path, { method: 'DELETE' }); }

  async upload(path: string, formData: FormData) {
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
    if (!res.ok) {
      let rawMessage = 'Upload gagal';
      let errorCode = '';
      try {
        const text = await res.text();
        if (text) {
          const err = JSON.parse(text);
          rawMessage = err.message || err.error || rawMessage;
          errorCode = err.code || '';
        }
      } catch {}
      throw new ApiError(res.status, rawMessage, errorCode);
    }
    return res.json();
  }
}

export const api = new ApiClient();
