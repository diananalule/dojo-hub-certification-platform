import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit key that survives being behind a proxy.
 *
 * The browser talks to the Next.js app, which forwards /api/* to this service — so
 * every request arrives from the web service's IP. Keying on the socket address
 * would put all users in one bucket and lock everyone out at once.
 *
 * Preference order:
 *   1. the authenticated user  — the fairest unit to limit
 *   2. the original client IP from X-Forwarded-For
 *   3. the socket IP           — last resort
 */
@Injectable()
export class ProxyAwareThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    if (user?.id) return `user:${user.id}`;

    const forwarded = req.headers?.['x-forwarded-for'] as string | string[] | undefined;
    const header = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    // X-Forwarded-For is a chain; the left-most entry is the original client.
    const clientIp = header?.split(',')[0]?.trim();

    return `ip:${clientIp || req.ip || 'unknown'}`;
  }
}
