import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { pool } from "./db.js";

/**
 * Unified authentication for customers and admins.
 * - Credentials live in the `users` table (bcrypt-hashed), role is
 *   'customer' or 'admin'.
 * - Sessions are JWTs delivered in an httpOnly cookie (also accepted as an
 *   Authorization: Bearer header for API clients).
 * - The first admin account is seeded from ADMIN_EMAIL / ADMIN_PASSWORD.
 */

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (() => {
    console.warn("JWT_SECRET not set — using an insecure development default");
    return "peonify-dev-secret-change-me";
  })();

export const COOKIE_NAME = "peonify_token";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type Role = "customer" | "admin";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export function signToken(user: AuthUser): string {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_TTL_MS,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME);
}

export async function createUser(
  name: string,
  email: string,
  password: string,
  role: Role = "customer"
): Promise<AuthUser> {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING id, name, email, role`,
    [name.trim(), email.toLowerCase().trim(), hash, role]
  );
  return rows[0];
}

export async function verifyUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const { rows } = await pool.query(
    "SELECT id, name, email, role, password_hash FROM users WHERE email = $1",
    [email.toLowerCase().trim()]
  );
  if (!rows.length) return null;
  const ok = await bcrypt.compare(password, rows[0].password_hash);
  if (!ok) return null;
  const { id, name, role } = rows[0];
  return { id, name, email: rows[0].email, role };
}

function readToken(req: Request): string {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7);
  return (req as Request & { cookies?: Record<string, string> }).cookies?.[
    COOKIE_NAME
  ] ?? "";
}

/** Decodes the session if present; never rejects. */
export function attachUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = readToken(req);
  if (token) {
    try {
      const claims = jwt.verify(token, JWT_SECRET) as unknown as {
        sub: number;
        name: string;
        email: string;
        role: Role;
      };
      req.user = {
        id: Number(claims.sub),
        name: claims.name,
        email: claims.email,
        role: claims.role,
      };
    } catch {
      /* expired or invalid — treat as guest */
    }
  }
  next();
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Please sign in to continue" });
  }
  next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Please sign in to continue" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export async function seedAdmin(): Promise<void> {
  const email = (process.env.ADMIN_EMAIL || "admin@peonify.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "peonify-admin";

  const { rows } = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
  if (rows.length === 0) {
    await createUser("Atelier Admin", email, password, "admin");
    console.log(`Seeded admin account: ${email}`);
  }
}
