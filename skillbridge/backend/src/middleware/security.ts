import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise Production Security Headers:
 * Equivalent to Helmet core protections without third-party dependency bloat.
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // Prevent clickjacking via frame embedding
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  // Disable legacy buggy XSS filters, rely on CSP
  res.setHeader('X-XSS-Protection', '0');
  // Strict Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Enforce HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  // Remove Express footprint
  res.removeHeader('X-Powered-By');

  next();
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface ClientRecord {
  count: number;
  resetTime: number;
}

/**
 * In-Memory Sliding-Window Rate Limiter
 * Tracks client IP across reverse proxies and Cloudflare tunnels.
 */
export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, max, message = 'Too many requests from this IP, please try again later.' } = options;
  const clients = new Map<string, ClientRecord>();

  // Cleanup expired client records every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of clients.entries()) {
      if (now > record.resetTime) {
        clients.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction) => {
    const forwarded = req.headers['x-forwarded-for'];
    const clientIp = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.socket.remoteAddress || 'unknown-client';

    const now = Date.now();
    let record = clients.get(clientIp);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      clients.set(clientIp, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, max - record.count);
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count > max) {
      res.setHeader('Retry-After', retryAfter);
      return res.status(429).json({
        error: message,
        retryAfterSeconds: retryAfter
      });
    }

    next();
  };
}

// ── Standard Production Limiters ─────────────────────────────
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 40,
  message: 'Too many authentication attempts. Please try again after 15 minutes.'
});

export const aiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 30,
  message: 'AI generation quota reached for this window. Please wait a few moments before generating again.'
});

export const generalApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 600,
  message: 'API rate limit exceeded. Please slow down your requests.'
});
