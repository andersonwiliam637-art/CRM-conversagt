// server/security.ts - Production Security, Cryptography, Sessions & RBAC
import crypto from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { db } from "./db.js";

// Session expiration: 24 hours
export const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

// ==========================================
// CRYPTOGRAPHY & PASSWORD HASHING (SCRYPT)
// ==========================================
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password.normalize(), salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 32 * 1024 * 1024
  });
  return {
    hash: derivedKey.toString("hex"),
    salt
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(password.normalize(), salt, 64, {
      N: 16384,
      r: 8,
      p: 1,
      maxmem: 32 * 1024 * 1024
    });
    const keyBuffer = Buffer.from(derivedKey.toString("hex"), "hex");
    const hashBuffer = Buffer.from(hash, "hex");
    if (keyBuffer.length !== hashBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch {
    return false;
  }
}

// ==========================================
// SESSION MANAGEMENT (CSPRNG TOKENS)
// ==========================================
export interface AuthUser {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "TENANT_ADMIN" | "AGENT" | "VIEWER";
}

export function createSession(
  userId: string,
  tenantId: string,
  ipAddress: string,
  userAgent: string
): { rawToken: string; expiresAt: number } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = Date.now() + SESSION_DURATION_MS;
  const sessionId = "sess-" + crypto.randomUUID();

  db.prepare(`
    INSERT INTO sessions (id, user_id, tenant_id, token_hash, expires_at, ip_address, user_agent, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(sessionId, userId, tenantId, tokenHash, expiresAt, ipAddress, userAgent, new Date().toISOString());

  return { rawToken, expiresAt };
}

export function validateSessionToken(rawToken: string): { user: AuthUser; tenantId: string } | null {
  if (!rawToken || typeof rawToken !== "string") return null;

  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const now = Date.now();

  const sessionRecord = db.prepare(`
    SELECT s.id as session_id, s.expires_at, s.tenant_id,
           u.id as user_id, u.email, u.name, u.role
    FROM sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token_hash = ? AND s.expires_at > ?
  `).get(tokenHash, now) as any;

  if (!sessionRecord) return null;

  return {
    user: {
      id: sessionRecord.user_id,
      tenantId: sessionRecord.tenant_id,
      email: sessionRecord.email,
      name: sessionRecord.name,
      role: sessionRecord.role
    },
    tenantId: sessionRecord.tenant_id
  };
}

export function destroySession(rawToken: string): void {
  if (!rawToken) return;
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

// ==========================================
// AUTHENTICATION & RBAC MIDDLEWARE
// ==========================================
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
    }
  }
}

export function extractAuthToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies.conversa_session) {
    return req.cookies.conversa_session;
  }
  // 2. Check Authorization Bearer header
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Acceso no autorizado. Se requiere autenticación válida.",
      code: "UNAUTHORIZED"
    });
  }

  const authData = validateSessionToken(token);
  if (!authData) {
    return res.status(401).json({
      success: false,
      error: "Sesión inválida o expirada. Por favor inicie sesión nuevamente.",
      code: "SESSION_EXPIRED"
    });
  }

  req.user = authData.user;
  req.tenantId = authData.tenantId;
  next();
}

export function requireRole(...allowedRoles: Array<"SUPER_ADMIN" | "TENANT_ADMIN" | "AGENT" | "VIEWER">) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Acceso no autenticado.",
        code: "UNAUTHORIZED"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logAudit({
        tenantId: req.tenantId,
        eventType: "forbidden_access_attempt",
        ipAddress: req.ip || req.socket.remoteAddress || "unknown",
        actor: req.user.email,
        details: `Intento de acceso denegado a recurso restringido por rol ${req.user.role}`,
        severity: "warning"
      });

      return res.status(403).json({
        success: false,
        error: "Acceso denegado. No posee los privilegios requeridos para esta operación.",
        code: "FORBIDDEN_ROLE"
      });
    }

    next();
  };
}

// ==========================================
// RATE LIMITING (SLIDING WINDOW WITH MEMORY LEAK PROTECTION)
// ==========================================
interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitBucket>();

// Evict expired rate limit buckets every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitMap.entries()) {
    if (bucket.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 2 * 60 * 1000).unref();

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
  keyPrefix?: string;
}) {
  const { windowMs, maxRequests, message = "Demasiadas peticiones. Intente más tarde.", keyPrefix = "rl" } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // With app.set('trust proxy', 1), req.ip uses the verified proxy client IP
    const clientIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const key = `${keyPrefix}:${clientIp}`;
    const now = Date.now();

    const bucket = rateLimitMap.get(key);
    if (!bucket || bucket.resetAt <= now) {
      rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", maxRequests - 1);
      return next();
    }

    if (bucket.count >= maxRequests) {
      res.setHeader("X-RateLimit-Limit", maxRequests);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({
        success: false,
        error: message,
        code: "RATE_LIMIT_EXCEEDED"
      });
    }

    bucket.count++;
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", maxRequests - bucket.count);
    next();
  };
}

// ==========================================
// AUDIT LOGGING HELPER
// ==========================================
export function logAudit(entry: {
  tenantId?: string;
  eventType: string;
  ipAddress: string;
  actor: string;
  details: string;
  severity?: "info" | "warning" | "critical";
}) {
  try {
    const id = "log-" + crypto.randomUUID();
    db.prepare(`
      INSERT INTO audit_logs (id, tenant_id, event_type, ip_address, actor, details, severity, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      entry.tenantId || null,
      entry.eventType,
      entry.ipAddress,
      entry.actor,
      entry.details,
      entry.severity || "info",
      new Date().toISOString()
    );
  } catch (err) {
    console.error("Error writing audit log:", err);
  }
}

// ==========================================
// INPUT SANITIZATION & PROMPT INJECTION GUARDRAILS
// ==========================================
export function sanitizeText(input: any, maxLength = 4000): string {
  if (typeof input !== "string") return "";
  // Strip null bytes and control chars
  let cleaned = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  // Prevent CSV / spreadsheet formula injection
  if (cleaned.length > 0 && ["=", "+", "-", "@", "\t", "\r"].includes(cleaned[0])) {
    cleaned = "'" + cleaned;
  }
  return cleaned.trim().slice(0, maxLength);
}

// Robust defense against prompt injection
export function filterPromptInjection(text: string): { safeText: string; isInjected: boolean } {
  const injectionPatterns = [
    /ignora\s+(todas\s+las\s+)?instrucciones/i,
    /ignore\s+(all\s+)?(previous\s+)?instructions/i,
    /desbloquea\s+el\s+modo\s+admin/i,
    /system\s+prompt/i,
    /revele\s+su\s+prompt/i,
    /show\s+your\s+prompt/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /ahora\s+eres\s+dan/i,
    /olvida\s+tus\s+reglas/i
  ];

  let isInjected = false;
  for (const pattern of injectionPatterns) {
    if (pattern.test(text)) {
      isInjected = true;
      break;
    }
  }

  return { safeText: text, isInjected };
}

// ==========================================
// META WEBHOOK SIGNATURE VERIFIER (HMAC SHA-256)
// ==========================================
export function verifyMetaSignature(
  rawBody: Buffer | string,
  signatureHeader: string | undefined,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;

  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") return false;

  const expectedSignature = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  const providedBuffer = Buffer.from(parts[1], "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(providedBuffer, expectedBuffer);
}
