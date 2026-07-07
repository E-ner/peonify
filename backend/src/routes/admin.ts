import { Router } from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../auth.js";
import { upload } from "../upload.js";

const router = Router();

// Everything below requires a signed-in admin (see /api/auth for login).
router.use(requireAdmin);

// --- Overview stats -------------------------------------------------------

router.get("/stats", async (_req, res, next) => {
  try {
    const [orders, revenue, active, products, customers] = await Promise.all([
      pool.query("SELECT COUNT(*)::int AS n FROM orders"),
      pool.query("SELECT COALESCE(SUM(total_cents),0)::bigint AS n FROM orders"),
      pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE status = 'paid'"),
      pool.query("SELECT COUNT(*)::int AS n FROM products"),
      pool.query("SELECT COUNT(*)::int AS n FROM users WHERE role = 'customer'"),
    ]);
    res.json({
      total_orders: orders.rows[0].n,
      revenue_cents: Number(revenue.rows[0].n),
      active_orders: active.rows[0].n,
      products: products.rows[0].n,
      customers: customers.rows[0].n,
    });
  } catch (err) {
    next(err);
  }
});

// --- Product management ---------------------------------------------------

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image received (jpeg/png/webp/avif/gif, max 5MB)" });
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

const PRODUCT_FIELDS = [
  "slug", "name", "description", "category", "collection",
  "price_cents", "hue", "image_url", "in_stock", "discount_percent",
] as const;

function productPayload(body: Record<string, unknown>) {
  const slugify = (s: string) =>
    s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    slug: body.slug ? slugify(String(body.slug)) : slugify(String(body.name ?? "")),
    name: String(body.name ?? "").trim(),
    description: String(body.description ?? "").trim(),
    category: String(body.category ?? "bouquet"),
    collection: String(body.collection ?? "signature"),
    price_cents: Math.max(0, Math.round(Number(body.price_cents) || 0)),
    hue: Math.min(360, Math.max(0, Math.round(Number(body.hue) || 340))),
    image_url: String(body.image_url ?? ""),
    in_stock: body.in_stock !== false && body.in_stock !== "false",
    discount_percent: Math.min(90, Math.max(0, Math.round(Number(body.discount_percent) || 0))),
  };
}

router.post("/products", async (req, res, next) => {
  try {
    const p = productPayload(req.body);
    if (!p.name || !p.description || !p.price_cents) {
      return res.status(400).json({ error: "Name, description and price are required" });
    }
    const { rows } = await pool.query(
      `INSERT INTO products (${PRODUCT_FIELDS.join(",")})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      PRODUCT_FIELDS.map((f) => p[f])
    );
    res.status(201).json(rows[0]);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return res.status(409).json({ error: "A product with that slug already exists" });
    }
    next(err);
  }
});

router.put("/products/:id", async (req, res, next) => {
  try {
    const p = productPayload(req.body);
    if (!p.name || !p.description || !p.price_cents) {
      return res.status(400).json({ error: "Name, description and price are required" });
    }
    const { rows } = await pool.query(
      `UPDATE products SET ${PRODUCT_FIELDS.map((f, i) => `${f} = $${i + 1}`).join(", ")}
       WHERE id = $${PRODUCT_FIELDS.length + 1} RETURNING *`,
      [...PRODUCT_FIELDS.map((f) => p[f]), req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Product not found" });
    res.json(rows[0]);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return res.status(409).json({ error: "A product with that slug already exists" });
    }
    next(err);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- Categories & collections ----------------------------------------------

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

for (const table of ["categories", "collections"] as const) {
  router.post(`/${table}`, async (req, res, next) => {
    try {
      const name = String(req.body?.name ?? "").trim();
      if (!name) return res.status(400).json({ error: "Name is required" });
      const description = String(req.body?.description ?? "").trim();
      const { rows } =
        table === "collections"
          ? await pool.query(
              "INSERT INTO collections (slug, name, description) VALUES ($1,$2,$3) RETURNING *",
              [slugify(name), name, description]
            )
          : await pool.query(
              "INSERT INTO categories (slug, name) VALUES ($1,$2) RETURNING *",
              [slugify(name), name]
            );
      res.status(201).json(rows[0]);
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "23505") {
        return res.status(409).json({ error: "That name already exists" });
      }
      next(err);
    }
  });

  router.delete(`/${table}/:id`, async (req, res, next) => {
    try {
      const { rowCount } = await pool.query(
        `DELETE FROM ${table} WHERE id = $1`,
        [req.params.id]
      );
      if (!rowCount) return res.status(404).json({ error: "Not found" });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  });
}

// --- Metrics for dashboard charts -------------------------------------------

router.get("/metrics", async (_req, res, next) => {
  try {
    const [revenueByDay, ordersByStatus, topProducts] = await Promise.all([
      pool.query(`
        SELECT to_char(d::date, 'YYYY-MM-DD') AS day,
               COALESCE(SUM(o.total_cents), 0)::bigint AS revenue_cents,
               COUNT(o.id)::int AS orders
        FROM generate_series(now() - interval '29 days', now(), '1 day') d
        LEFT JOIN orders o ON o.created_at::date = d::date
        GROUP BY d::date ORDER BY d::date
      `),
      pool.query(`
        SELECT status, COUNT(*)::int AS count
        FROM orders GROUP BY status
      `),
      pool.query(`
        SELECT oi.name, SUM(oi.quantity)::int AS sold,
               SUM(oi.quantity * oi.unit_price_cents)::bigint AS revenue_cents
        FROM order_items oi
        GROUP BY oi.name ORDER BY sold DESC LIMIT 5
      `),
    ]);
    res.json({
      revenue_by_day: revenueByDay.rows.map((r) => ({
        ...r,
        revenue_cents: Number(r.revenue_cents),
      })),
      orders_by_status: ordersByStatus.rows,
      top_products: topProducts.rows.map((r) => ({
        ...r,
        revenue_cents: Number(r.revenue_cents),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// --- Orders & subscriptions ------------------------------------------------

router.get("/orders", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*,
             COALESCE(json_agg(json_build_object(
               'name', oi.name, 'quantity', oi.quantity,
               'unit_price_cents', oi.unit_price_cents
             ) ORDER BY oi.id) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT 200
    `);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// --- Activity, reviews & inbox ----------------------------------------------

// Recent shipment activity across all orders — the admin's audit trail.
router.get("/activity", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT oe.id, oe.status, oe.note, oe.created_at,
              o.reference, o.customer_name
       FROM order_events oe
       JOIN orders o ON o.id = oe.order_id
       ORDER BY oe.created_at DESC
       LIMIT 40`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/reviews", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at,
              u.name AS author, u.email, p.name AS product_name, p.slug
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       JOIN products p ON p.id = r.product_id
       ORDER BY r.created_at DESC
       LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.delete("/reviews/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM reviews WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: "Review not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/messages", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM messages ORDER BY created_at DESC LIMIT 200"
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.delete("/messages/:id", async (req, res, next) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM messages WHERE id = $1", [
      req.params.id,
    ]);
    if (!rowCount) return res.status(404).json({ error: "Message not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
