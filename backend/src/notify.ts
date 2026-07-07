import { pool } from "./db.js";

export async function notifyUser(
  userId: number | null,
  title: string,
  body: string,
  link = ""
): Promise<void> {
  if (!userId) return;
  await pool.query(
    "INSERT INTO notifications (user_id, title, body, link) VALUES ($1,$2,$3,$4)",
    [userId, title, body, link]
  );
}

export async function notifyAdmins(
  title: string,
  body: string,
  link = ""
): Promise<void> {
  await pool.query(
    `INSERT INTO notifications (user_id, title, body, link)
     SELECT id, $1, $2, $3 FROM users WHERE role = 'admin'`,
    [title, body, link]
  );
}
