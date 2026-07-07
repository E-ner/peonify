import { Router } from "express";
import { pool } from "../db.js";
import { notifyAdmins } from "../notify.js";
import { paymentsProvider } from "../payments/gateway.js";

const router = Router();

router.get("/categories", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM categories ORDER BY id");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/collections", async (_req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM collections ORDER BY id");
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Tells the checkout page whether real payments (Paystack) are configured.
router.get("/payments/config", (_req, res) => {
  res.json({ provider: paymentsProvider() });
});

// Recent high ratings for the landing-page testimonials.
router.get("/reviews/recent", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS author, u.avatar_url, p.name AS product_name, p.slug
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN products p ON p.id = r.product_id
      WHERE r.rating >= 4 AND r.comment <> ''
      ORDER BY r.created_at DESC
      LIMIT 3
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Contact form — messages land in the admin inbox.
router.post("/contact", async (req, res, next) => {
  try {
    const { name, email, subject = "", body } = req.body as Record<string, string>;
    if (!name?.trim() || !email?.trim() || !body?.trim()) {
      return res.status(400).json({ error: "Name, email and message are required" });
    }
    await pool.query(
      "INSERT INTO messages (name, email, subject, body) VALUES ($1,$2,$3,$4)",
      [name.trim(), email.trim(), subject.trim(), body.trim()]
    );
    await notifyAdmins(
      "New message in the inbox",
      `${name.trim()}${subject ? ` — ${subject.trim()}` : ""}`
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
