import { Router } from "express";
import { pool } from "../db.js";
import { createPayment, verifyPayment } from "../payments/gateway.js";
import { requireAuth, type AuthedRequest } from "../auth.js";
import { notifyAdmins, notifyUser } from "../notify.js";

const router = Router();

// The flow is deliberately simple: an order is PAID the moment checkout
// succeeds, and DELIVERED when the admin presses Deliver. Nothing else.
interface OrderItemInput {
  product_id?: number | null;
  name: string;
  custom_config?: Record<string, string> | null;
  quantity?: number;
  unit_price_cents: number;
}

function makeReference(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "PNY-";
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return ref;
}

// POST /api/orders — create an order from the checkout form + cart items.
// Requires a signed-in customer account: no guest checkout.
router.post("/", requireAuth, async (req, res, next) => {
  const client = await pool.connect();
  try {
    if ((req as AuthedRequest).user?.role === "admin") {
      return res.status(403).json({ error: "Admin accounts can't place orders" });
    }
    const {
      customer_name, email, phone = "", address,
      delivery_date, delivery_window, order_type = "on_demand",
      gift_note = "", items,
    } = req.body as Record<string, unknown> & { items: OrderItemInput[] };

    if (!customer_name || !email || !address || !delivery_date || !delivery_window) {
      return res.status(400).json({ error: "Missing required checkout fields" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const total = items.reduce(
      (sum, it) => sum + it.unit_price_cents * (it.quantity || 1),
      0
    );

    // Paystack gateway: mock mode succeeds instantly; with a test key set,
    // the customer is redirected to Paystack's sandbox checkout page and the
    // order stays 'pending_payment' until the payment is verified.
    const origin = req.get("origin") || "http://localhost:5173";
    const payment = await createPayment(
      total,
      String(email),
      `${origin}/payment/callback`
    );
    const isPaid = payment.status === "succeeded";

    const userId = (req as AuthedRequest).user!.id;

    await client.query("BEGIN");
    const reference = makeReference();
    const orderResult = await client.query(
      `INSERT INTO orders
         (reference, customer_name, email, phone, address,
          delivery_date, delivery_window, order_type, gift_note, total_cents,
          payment_ref, user_id, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [reference, customer_name, email, phone, address,
       delivery_date, delivery_window, order_type, gift_note, total,
       payment.payment_ref, userId, isPaid ? "paid" : "pending_payment"]
    );
    const order = orderResult.rows[0];

    for (const it of items) {
      await client.query(
        `INSERT INTO order_items
           (order_id, product_id, name, custom_config, quantity, unit_price_cents)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id, it.product_id || null, it.name,
         it.custom_config ? JSON.stringify(it.custom_config) : null,
         it.quantity || 1, it.unit_price_cents]
      );
    }

    await client.query(
      `INSERT INTO order_events (order_id, status, note) VALUES ($1,$2,$3)`,
      isPaid
        ? [order.id, "paid", "Payment received — the order is with our atelier."]
        : [order.id, "pending_payment", "Awaiting payment on Paystack."]
    );

    await client.query("COMMIT");

    if (isPaid) {
      await notifyUser(
        userId,
        `Order ${reference} paid`,
        "Payment received. We'll prepare your flowers and deliver them in your chosen window."
      );
      await notifyAdmins(
        `New paid order ${reference}`,
        `${customer_name} — ${items.length} item(s), ${(total / 100).toFixed(2)} USD, delivery ${delivery_date} ${delivery_window}.`
      );
    }

    res.status(201).json({ ...order, authorization_url: payment.authorization_url });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// GET /api/orders/:reference — order details with items
router.get("/:reference", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM orders WHERE reference = $1",
      [req.params.reference.toUpperCase()]
    );
    if (!rows.length) return res.status(404).json({ error: "Order not found" });
    const order = rows[0];
    const items = await pool.query(
      "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id",
      [order.id]
    );
    res.json({ ...order, items: items.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/verify-payment — called when the customer returns from
// Paystack. Verifies the transaction server-side (the source of truth) and
// marks the order paid.
router.post("/verify-payment", requireAuth, async (req, res, next) => {
  try {
    const paymentRef = String(req.body?.reference ?? "");
    if (!paymentRef) return res.status(400).json({ error: "Missing payment reference" });

    const { rows } = await pool.query(
      "SELECT * FROM orders WHERE payment_ref = $1",
      [paymentRef]
    );
    if (!rows.length) return res.status(404).json({ error: "Order not found" });
    const order = rows[0];

    if (order.status !== "pending_payment") {
      return res.json({ status: order.status, reference: order.reference });
    }

    const paid = await verifyPayment(paymentRef);
    if (!paid) {
      return res
        .status(402)
        .json({ error: "Payment not completed yet — please try again." });
    }

    await pool.query("UPDATE orders SET status = 'paid' WHERE id = $1", [order.id]);
    await pool.query(
      "INSERT INTO order_events (order_id, status, note) VALUES ($1,'paid',$2)",
      [order.id, "Payment received — the order is with our atelier."]
    );
    await notifyUser(
      order.user_id,
      `Order ${order.reference} paid`,
      "Payment received. We'll prepare your flowers and deliver them in your chosen window."
    );
    await notifyAdmins(
      `New paid order ${order.reference}`,
      `${order.customer_name} — ${(order.total_cents / 100).toFixed(2)} USD, delivery ${order.delivery_date} ${order.delivery_window}.`
    );

    res.json({ status: "paid", reference: order.reference });
  } catch (err) {
    next(err);
  }
});

// POST /api/orders/:reference/deliver — completes a paid order. Allowed for
// the admin (dispatching the delivery) and for the order's own customer
// (confirming "I received my flowers").
router.post("/:reference/deliver", requireAuth, async (req, res, next) => {
  try {
    const user = (req as AuthedRequest).user!;
    const { rows } = await pool.query(
      "SELECT id, status, user_id, reference, customer_name FROM orders WHERE reference = $1",
      [req.params.reference.toUpperCase()]
    );
    if (!rows.length) return res.status(404).json({ error: "Order not found" });
    const order = rows[0];

    const isAdmin = user.role === "admin";
    const isOwner = order.user_id === user.id;
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "This isn't your order" });
    }
    if (order.status === "delivered") {
      return res.status(400).json({ error: "Order is already delivered" });
    }

    const note = isAdmin
      ? "Delivered. We hope it takes their breath away."
      : "Delivery confirmed by the customer.";

    await pool.query("UPDATE orders SET status = 'delivered' WHERE id = $1", [
      order.id,
    ]);
    await pool.query(
      "INSERT INTO order_events (order_id, status, note) VALUES ($1,'delivered',$2)",
      [order.id, note]
    );

    if (isAdmin) {
      await notifyUser(
        order.user_id,
        `Order ${order.reference} delivered`,
        "Your flowers have been delivered. We'd love your feedback on the product page!"
      );
    } else {
      await notifyAdmins(
        `${order.reference} confirmed received`,
        `${order.customer_name} confirmed their flowers arrived.`
      );
    }

    res.json({ status: "delivered" });
  } catch (err) {
    next(err);
  }
});

export default router;
