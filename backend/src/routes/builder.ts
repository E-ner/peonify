import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

interface BuilderOption {
  id: number;
  step: string;
  name: string;
  detail: string;
  price_cents: number;
}

router.get("/options", async (_req, res, next) => {
  try {
    const { rows } = await pool.query<BuilderOption>(
      "SELECT * FROM builder_options ORDER BY step, id"
    );
    const grouped: Record<string, BuilderOption[]> = {};
    for (const row of rows) {
      (grouped[row.step] ||= []).push(row);
    }
    res.json(grouped);
  } catch (err) {
    next(err);
  }
});

export default router;
