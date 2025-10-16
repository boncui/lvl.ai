import { NextFunction, Request, Response } from 'express';
import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import User from '../models/User';
import { env } from '../config/env';

// ---- Lazy env access (no import-time throw) ----
let ACCESS_SECRET_CACHE: Secret | null = null;
function accessSecret(): Secret {
  if (ACCESS_SECRET_CACHE) return ACCESS_SECRET_CACHE;
  const v = env.JWT_ACCESS_TOKEN_SECRET;
  if (!v || !v.trim()) throw new Error('JWT_ACCESS_TOKEN_SECRET is not set');
  ACCESS_SECRET_CACHE = v as Secret;
  return ACCESS_SECRET_CACHE;
}

// Centralize projection & options
const USER_PROJECTION = '_id name email isEmailVerified';

type AccessTokenPayload = JwtPayload & { userId: string; type: 'access' };

type LiteUser = {
  _id: string;
  name?: string;
  email?: string;
  isEmailVerified: boolean;
};

export interface AuthenticatedRequest extends Request {
  user?: LiteUser;
  // Task properties for route middleware
  task?: any;
  foodTask?: any;
  homeworkTask?: any;
  emailTask?: any;
  meetingTask?: any;
  projectTask?: any;
  personalTask?: any;
  workTask?: any;
  healthTask?: any;
  socialTask?: any;
  otherTask?: any;
}

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function readAccessToken(req: Request): string | null {
  // ✅ Primary: Authorization header (standard REST API pattern)
  const auth = req.headers.authorization;
  if (auth) {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) return m[1]?.trim() || null;
  }

  // ✅ Fallback: cookies (for cookie-based auth if needed)
  const cookieToken = req.cookies?.['accessToken'];
  if (cookieToken) return cookieToken;

  return null;
}

async function verifyAndLoadUser(
  req: Request,
  { required }: { required: boolean }
): Promise<LiteUser | null> {
  const token = readAccessToken(req);
  if (!token) {
    if (required) throw new HttpError(401, 'Access denied. No token provided.');
    return null;
  }

  let decoded: AccessTokenPayload;
  try {
    decoded = jwt.verify(token, accessSecret(), {
      algorithms: ['HS256'],
      clockTolerance: 5,
    }) as AccessTokenPayload;
  } catch (err: any) {
    const message = err?.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    if (required) throw new HttpError(401, message);
    return null;
  }

  if (decoded.type !== 'access') {
    if (required) throw new HttpError(401, 'Invalid token type');
    return null;
  }

  const dbUser = await User.findById(decoded.userId).select(USER_PROJECTION).lean();
  if (!dbUser) {
    if (required) throw new HttpError(404, 'User not found.');
    return null;
  }

  return {
    _id: String((dbUser as any)._id),
    name: (dbUser as any).name,
    email: (dbUser as any).email,
    isEmailVerified: (dbUser as any).isEmailVerified,
  };
}

/* ------------------------------------------------------------------ */
/* Strict middleware — rejects when token missing/invalid              */
/* ------------------------------------------------------------------ */
export default async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await verifyAndLoadUser(req, { required: true });
    req.user = user!;
    next();
  } catch (e: any) {
    res.status(e?.status ?? 401).json({ error: e?.message ?? 'Unauthorized' });
  }
}

/* ------------------------------------------------------------------ */
/* Optional middleware — attaches user if valid, else continues        */
/* ------------------------------------------------------------------ */
export async function authenticateOptional(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await verifyAndLoadUser(req, { required: false });
    if (user) req.user = user;
  } finally {
    next();
  }
}

// Legacy compatibility - keeping the old interface for existing code
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Simple authorize function for role-based access (keeping for compatibility)
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Access denied. User not authenticated.' });
      return;
    }

    // For now, we'll skip role checking since the current User model doesn't have roles
    // This can be extended later when roles are added to the User model
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void roles; // Suppress unused parameter warning
    next();
  };
};
