import { pool } from "./db.js";
import { notifyUser } from "./notify.js";

/**
 * Delivery reminders: customers with a scheduled order get a notification
 * one day before delivery and again five hours before the delivery window
 * opens. Runs every 10 minutes; each reminder fires exactly once
 * (reminded_1d / reminded_5h flags on the order).
 */

const CHECK_INTERVAL_MS = 10 * 60 * 1000;

interface PendingOrder {
  id: number;
  reference: string;
  user_id: number;
  delivery_date: string;
  delivery_window: string;
  reminded_1d: boolean;
  reminded_5h: boolean;
}

function deliveryStart(order: PendingOrder): Date {
  // delivery_window looks like "09:00 - 12:00" — take the opening hour.
  const [startHour = "09", startMin = "00"] =
    order.delivery_window.split("-")[0]?.trim().split(":") ?? [];
  const date = new Date(order.delivery_date);
  date.setHours(Number(startHour) || 9, Number(startMin) || 0, 0, 0);
  return date;
}

async function checkReminders(): Promise<void> {
  const { rows } = await pool.query<PendingOrder>(
    `SELECT id, reference, user_id, delivery_date, delivery_window,
            reminded_1d, reminded_5h
     FROM orders
     WHERE status = 'paid'
       AND user_id IS NOT NULL
       AND (reminded_1d = FALSE OR reminded_5h = FALSE)
       AND delivery_date >= CURRENT_DATE`
  );

  const now = Date.now();
  for (const order of rows) {
    const start = deliveryStart(order).getTime();
    if (start < now) continue;

    const hoursLeft = (start - now) / 3_600_000;

    if (!order.reminded_1d && hoursLeft <= 24) {
      await notifyUser(
        order.user_id,
        `Delivery tomorrow — ${order.reference}`,
        `Your flowers arrive ${new Date(order.delivery_date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} between ${order.delivery_window}. Make sure someone is around!`
      );
      await pool.query("UPDATE orders SET reminded_1d = TRUE WHERE id = $1", [order.id]);
    }

    if (!order.reminded_5h && hoursLeft <= 5) {
      await notifyUser(
        order.user_id,
        `Delivery today — ${order.reference}`,
        `Your flowers arrive today between ${order.delivery_window}. They're being arranged right now.`
      );
      await pool.query("UPDATE orders SET reminded_5h = TRUE WHERE id = $1", [order.id]);
    }
  }
}

export function startReminderScheduler(): void {
  void checkReminders().catch((err) => console.error("Reminder check failed:", err));
  setInterval(() => {
    void checkReminders().catch((err) => console.error("Reminder check failed:", err));
  }, CHECK_INTERVAL_MS);
  console.log("Delivery reminder scheduler running (every 10 minutes)");
}
