import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { notifyAdmins } from "../notify.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { category, collection } = req.query;
    const conditions: string[] = [];
    const params: string[] = [];
    if (typeof category === "string" && category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (typeof collection === "string" && collection) {
      params.push(collection);
      conditions.push(`collection = $${params.length}`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const { rows } = await pool.query(
      `SELECT * FROM products ${where} ORDER BY id`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Best sellers — most units sold, for the landing page.
router.get("/best", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.*, COALESCE(SUM(oi.quantity), 0)::int AS sold
      FROM products p
      JOIN order_items oi ON oi.product_id = p.id
      WHERE p.in_stock
      GROUP BY p.id
      ORDER BY sold DESC
      LIMIT 4
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM products WHERE slug = $1",
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// --- Product feedback --------------------------------------------------------

router.get("/:slug/reviews", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS author, u.avatar_url
       FROM reviews r
       JOIN products p ON p.id = r.product_id
       JOIN users u ON u.id = r.user_id
       WHERE p.slug = $1
       ORDER BY r.created_at DESC`,
      [req.params.slug]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// One review per customer per product; posting again updates it.
router.post("/:slug/reviews", requireAuth, async (req: AuthedRequest, res, next) => {
  try {
    const rating = Math.round(Number(req.body?.rating));
    const comment = String(req.body?.comment ?? "").trim();
    if (!(rating >= 1 && rating <= 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    const product = await pool.query("SELECT id FROM products WHERE slug = $1", [
      req.params.slug,
    ]);
    if (!product.rows.length) return res.status(404).json({ error: "Product not found" });

    const { rows } = await pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET rating = $3, comment = $4, created_at = now()
       RETURNING *`,
      [req.user!.id, product.rows[0].id, rating, comment]
    );
    await notifyAdmins(
      "New product feedback",
      `${req.user!.name} rated a product ${rating}/5.`
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
