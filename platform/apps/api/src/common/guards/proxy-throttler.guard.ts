import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * Rate-limit key that survives being behind a proxy.
 *
 * The browser talks to the Next.js app, which forwards /api/* to this service, so the
 * socket address is always the web service. The original client has to come from the
 * X-Forwarded-For chain instead.
 *
 * That chain is only trustworthy from the RIGHT. Each proxy appends the address it saw,
 * so the right-most entries are written by infrastructure we control and the left-most is
 * whatever the client sent — which may be forged, or injected by a transparent ISP proxy.
 * Reading the left-most entry (as this guard used to) had two consequences, both observed
 * against production: anyone could hand themselves a fresh budget with a made-up header,
 * and every user behind a network that injects X-Forwarded-For collapsed into a single
 * shared budget and throttled each other out.
 *
 * Express resolves this correctly from the right when `trust proxy` is set to the number
 * of proxies in front of us, so `req.ip` is the value to use — never the raw header.
 *
 * Preference order:
 *   1. the authenticated user — the fairest unit, and taken from a verified token
 *      rather than a header, so it cannot be forged
 *   2. the client address Express resolved from the trusted end of the chain
 */
@Injectable()
export class ProxyAwareThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const user = req.user as { id?: string } | undefined;
    if (user?.id) return `user:${user.id}`;

    return `ip:${req.ip || 'unknown'}`;
  }
}
