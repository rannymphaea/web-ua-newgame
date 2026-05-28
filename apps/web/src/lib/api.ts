// DO NOT EDIT - HTTP client inti. Dipakai oleh semua halaman untuk komunikasi ke backend.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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
        let errorMessage = `API Error ${res.status}`;
        try {
          const text = await res.text();
          if (text) {
            const err = JSON.parse(text);
            errorMessage = err.message || err.error || errorMessage;
          } else {
            errorMessage = res.statusText || errorMessage;
          }
        } catch {
          errorMessage = res.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error('Request timeout — server tidak merespons');
      }
      throw err;
    }
  }

  get(path: string) { return this.request(path); }
  post(path: string, body: any) { return this.request(path, { method: 'POST', body: JSON.stringify(body) }); }
  patch(path: string, body: any) { return this.request(path, { method: 'PATCH', body: JSON.stringify(body) }); }
  delete(path: string) { return this.request(path, { method: 'DELETE' }); }

  async upload(path: string, formData: FormData) {
    const headers: Record<string, string> = {};
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
    if (!res.ok) {
      let errorMessage = 'Upload failed';
      try {
        const text = await res.text();
        if (text) {
          const err = JSON.parse(text);
          errorMessage = err.message || err.error || errorMessage;
        }
      } catch {}
      throw new Error(errorMessage);
    }
    return res.json();
  }
}

export const api = new ApiClient();
