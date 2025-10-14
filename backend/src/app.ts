import express from 'express';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

// Routes
import apiRoutes from './routes/api';

// Security middleware
import {
  corsMiddleware,
  helmetConfig,
  securityHeaders,
  mongoSanitizer,
  sanitizeKnownTextFields,
  hppMiddleware,
  generalLimiter,
  authLimiter,
  _404ErrorHandler,
  errorHandler,
} from './middleware/securityMiddleware';

const app = express();
app.set('trust proxy', 1);
app.disable('etag');

/* ============================
   🛡️ SECURITY MIDDLEWARE
============================ */
app.use(securityHeaders);
app.use(helmetConfig);
app.use(corsMiddleware);
app.use(hppMiddleware);

/* ============================
   📝 PARSERS
============================ */
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* ============================
   🧹 SANITIZATION
============================ */
app.use(mongoSanitizer);
app.use(
  sanitizeKnownTextFields([
    'name',
    'email',
    'title',
    'description',
    'message',
    'comment',
    'bio',
    'notes',
  ])
);

/* ============================
   🚦 RATE LIMITING
============================ */
app.use(generalLimiter);

/* ============================
   🏠 BASE + HEALTH
============================ */
app.get('/', (_req: Request, res: Response) => {
  res.send('LVL.AI Backend is running!');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development',
  });
});

app.get('/healthz', (_req: Request, res: Response) => res.sendStatus(204));

/* ============================
   🔐 AUTH-SENSITIVE LIMITS
============================ */
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/verify', authLimiter);
app.use('/api/auth/resend-code', authLimiter);

/* ============================
   🔀 ROUTES
============================ */
app.use('/api', apiRoutes);

/* ============================
   🚫 404 + ERROR HANDLING
============================ */
app.use('*', _404ErrorHandler);
app.use(errorHandler);

export default app;
