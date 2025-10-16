import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import hpp from 'hpp';
import cors from 'cors';
import type { CorsOptions, CorsOptionsDelegate } from 'cors';
import type { Request, Response, RequestHandler } from 'express';
import type { ErrorRequestHandler } from 'express';
import { env } from '../config/env';
import logger from '../utils/logger';

const isProd = env.NODE_ENV === 'production';

/* -------------------------------- Utils ------------------------------- */
function parseList(envVar?: string): string[] {
  return (envVar ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// In production, set this via env to avoid hardcoding
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001', // Frontend port
  'http://localhost:5001', // Backend port
  'http://localhost:8000', // Default backend port
  ...parseList(process.env['CORS_ORIGINS']),
];

/* ------------------------------- CORS --------------------------------- */
/** Prefer delegate for strong typing and preflight correctness */
const corsOptionsDelegate: CorsOptionsDelegate = (req, cb) => {
  const origin = req.headers?.origin as string | undefined; 
  const allow = !origin || ALLOWED_ORIGINS.includes(origin);
  const options: CorsOptions = {
    origin: allow,
    credentials: true,
    optionsSuccessStatus: 204,
  };
  cb(null, options);
};

export const corsMiddleware = cors(corsOptionsDelegate);

/* ----------------------------- Rate limiting -------------------------- */
/** NOTE: MemoryStore resets on restart; use Redis for multi‑instance. */
const commonRateLimitOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.RATE_LIMIT_MAX_REQUESTS || 1000,
  message: { error: 'Too many requests from this IP, please try again later.' },
  ...commonRateLimitOptions,
  // Skip health checks
  skip: (req: Request) => req.path === '/healthz' || req.path === '/health',
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { error: 'Too many authentication attempts, please try again later.' },
  ...commonRateLimitOptions,
  keyGenerator: (req: Request) => {
    const ip = req.ip || 'unknown';
    const email = (req.body?.email ?? '').toLowerCase();
    return email ? `${ip}:${email}` : ip;
  },
});

/* ----------------------------- Sanitization --------------------------- */
export const mongoSanitizer = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    if (!isProd) console.debug(`Sanitized key "${key}" from ${req.ip}`);
  },
});

/**
 * Prefer schema validation (Zod/Joi). If you need a guardrail, limit to known fields.
 */
export function sanitizeKnownTextFields(fields: string[] = []): RequestHandler {
  const stripHtml = (v: string) =>
    v.replace(/<[^>]*>/g, '').replace(/javascript:/gi, '').trim();

  return (req, _res, next) => {
    (['body', 'query', 'params'] as const).forEach(container => {
      const obj = req[container] as Record<string, unknown> | undefined;
      if (!obj) return;
      fields.forEach(f => {
        const val = obj[f];
        if (typeof val === 'string') (obj as any)[f] = stripHtml(val);
      });
    });
    next();
  };
}

/* -------------------------- Security headers -------------------------- */
export const securityHeaders: RequestHandler = (_req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  next();
};

/**
 * If your frontend injects inline scripts (Next.js does), prefer a nonce:
 *   app.use((req,res,next)=>{ res.locals.nonce = crypto.randomBytes(16).toString('base64'); next(); })
 *   then include `'nonce-${res.locals.nonce}'` in scriptSrc below and add the nonce to your script tags.
 */
export const helmetConfig = helmet({
  // Helmet v7 already ships with sane defaults. We explicitly manage CSP below.
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        ...(isProd ? [] : ["'unsafe-inline'"]), // dev convenience only
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      connectSrc: [
        "'self'",
        ...ALLOWED_ORIGINS,
        ...(isProd ? ['wss:'] : ['ws:', 'wss:']),
      ],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      ...(isProd ? { upgradeInsecureRequests: [] } : {}),
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: isProd
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  hidePoweredBy: true,
  frameguard: { action: 'deny' },
  noSniff: true,
});

/* ---------------- HTTP Parameter Pollution defense -------------------- */
export const hppMiddleware = hpp();

/* ------------------------------- Errors -------------------------------- */

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err); // let Express' default error handler finish it
  }

  const status = Number(err?.status) || 500;
  const isDev = env.NODE_ENV === 'development';

  const message =
    isDev
      ? err?.message || 'Unhandled error'
      : status < 500
        ? (err?.publicMessage as string) || err?.message || 'Request failed'
        : 'Something went wrong';

  logger.error('Application Error', {
    status,
    code: err?.code,
    message: err?.message,
    stack: isDev ? err?.stack : undefined,
    ip: req.ip,
    ua: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    ts: new Date().toISOString(),
  });

  res.status(status).json({
    error: message,
    ...(isDev && err?.stack ? { stack: err.stack } : {}),
  });
};

export const _404ErrorHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
};
