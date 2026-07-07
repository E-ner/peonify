import bcrypt from "bcryptjs";
import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { upload } from "../upload.js";

const router = Router();
router.use(requireAuth);

// The signed-in customer's orders, newest first, with items and the full
// shipment timeline so the account page can show progress.
router.get("/orders", async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*,
              COALESCE((SELECT json_agg(json_build_object(
                'name', oi.name, 'quantity', oi.quantity,
                'unit_price_cents', oi.unit_price_cents) ORDER BY oi.id)
                FROM order_items oi WHERE oi.order_id = o.id), '[]') AS items,
              COALESCE((SELECT json_agg(json_build_object(
                'status', oe.status, 'note', oe.note, 'created_at', oe.created_at)
                ORDER BY oe.created_at)
                FROM order_events oe WHERE oe.order_id = o.id), '[]') AS events
       FROM orders o
       WHERE o.user_id = $1
       ORDER BY o.created_at DESC`,
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/notifications", async (req: AuthedRequest, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.user!.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/notifications/read", async (req: AuthedRequest, res, next) => {
  try {
    await pool.query("UPDATE notifications SET read = TRUE WHERE user_id = $1", [
      req.user!.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.post("/notifications/:id/read", async (req: AuthedRequest, res, next) => {
  try {
    const { rowCount } = await pool.query(
      "UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user!.id]
    );
    if (!rowCount) return res.status(404).json({ error: "Notification not found" });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// --- Profile ----------------------------------------------------------------

router.put("/profile", async (req: AuthedRequest, res, next) => {
  try {
    const { name, phone = "", address = "", city = "" } = req.body as Record<string, string>;
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
    const { rows } = await pool.query(
      `UPDATE users SET name = $1, phone = $2, address = $3, city = $4
       WHERE id = $5
       RETURNING id, name, email, role, avatar_url, phone, address, city`,
      [name.trim(), phone.trim(), address.trim(), city.trim(), req.user!.id]
    );
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post("/avatar", upload.single("image"), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image received (jpeg/png/webp, max 5MB)" });
    }
    const url = `/uploads/${req.file.filename}`;
    await pool.query("UPDATE users SET avatar_url = $1 WHERE id = $2", [
      url,
      req.user!.id,
    ]);
    res.status(201).json({ url });
  } catch (err) {
    next(err);
  }
});

router.post("/password", async (req: AuthedRequest, res, next) => {
  try {
    const { current_password, new_password } = req.body as Record<string, string>;
    if (!new_password || new_password.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }
    const { rows } = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user!.id]
    );
    const ok = await bcrypt.compare(String(current_password ?? ""), rows[0].password_hash);
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    const hash = await bcrypt.hash(new_password, 12);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hash,
      req.user!.id,
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
