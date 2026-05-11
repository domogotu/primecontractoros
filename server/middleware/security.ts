import { Request, Response, NextFunction } from "express";

/**
 * Security Middleware for PrimeContractorOS
 * - Secure HTTP headers
 * - Rate limiting on auth endpoints
 * - Input size validation
 */

// Secure HTTP headers middleware
export function secureHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // XSS protection (legacy browsers)
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()"
  );
  // HSTS (only in production)
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  next();
}

// Simple in-memory rate limiter
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function rateLimit(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    entry.count++;

    if (entry.count > options.maxRequests) {
      res.status(429).json({
        error: options.message || "Too many requests. Please try again later.",
      });
      return;
    }

    next();
  };
}

// Auth endpoint rate limiter: 10 requests per minute
export const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: "Too many authentication attempts. Please wait a minute before trying again.",
});

// API rate limiter: 100 requests per minute per IP
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: "Rate limit exceeded. Please slow down.",
});

// Input size validation middleware for tRPC
export function inputSizeLimit(maxSizeBytes: number = 1024 * 1024) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers["content-length"] || "0", 10);
    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        error: "Request payload too large. Maximum size is 1MB.",
      });
      return;
    }
    next();
  };
}
