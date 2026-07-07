import { Router } from "express";
import { pool } from "../db.js";
import {
  clearAuthCookie,
  createUser,
  requireAuth,
  setAuthCookie,
  signToken,
  verifyUser,
  type AuthedRequest,
} from "../auth.js";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const user = await createUser(name, email, password);
    const token = signToken(user);
    setAuthCookie(res, token);
    res.status(201).json({ user, token });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return res.status(409).json({ error: "An account with that email already exists" });
    }
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as Record<string, string>;
    const user = await verifyUser(String(email ?? ""), String(password ?? ""));
    if (!user) return res.status(401).json({ error: "Invalid email or password" });
    const token = signToken(user);
    setAuthCookie(res, token);
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

// Returns the fresh profile from the database (JWT claims can lag behind
// profile edits like name or avatar changes).
router.get("/me", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, avatar_url, phone, address, city
       FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (!rows.length) return res.status(401).json({ error: "Account not found" });
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
