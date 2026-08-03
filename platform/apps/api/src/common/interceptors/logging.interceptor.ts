import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, originalUrl } = request;
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logger.log(`${method} ${originalUrl} ${Date.now() - started}ms`);
        },
        error: (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Unknown error';
          this.logger.warn(
            `${method} ${originalUrl} ${Date.now() - started}ms - ${message}`,
          );
        },
      }),
    );
  }
}
