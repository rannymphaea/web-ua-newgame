/**
 * API Response Interceptor — NEWGAME NestJS
 * Standarisasi semua response: { success, data, meta, timestamp }
 * Berlaku global — daftarkan di main.ts
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Jika data sudah berformat { data, meta } dari controller, preserve meta
        if (data && typeof data === 'object' && 'data' in (data as object) && 'meta' in (data as object)) {
          const { data: inner, meta, ...rest } = data as any;
          return {
            success: true,
            data: inner,
            meta,
            timestamp: new Date().toISOString(),
            ...rest,
          };
        }
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
