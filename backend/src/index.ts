import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDb } from "./db.js";
import productsRouter from "./routes/products.js";
import builderRouter from "./routes/builder.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";
import { UPLOADS_DIR } from "./upload.js";
import authRouter from "./routes/auth.js";
import meRouter from "./routes/me.js";
import metaRouter from "./routes/meta.js";
import { attachUser, seedAdmin } from "./auth.js";
import { startReminderScheduler } from "./reminders.js";

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(attachUser);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRouter);
app.use("/api/me", meRouter);
app.use("/api", metaRouter);
app.use("/api/products", productsRouter);
app.use("/api/builder", builderRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);
app.use("/uploads", express.static(UPLOADS_DIR));

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = Number(process.env.PORT) || 5000;

initDb()
  .then(() => seedAdmin())
  .then(() => {
    startReminderScheduler();
    app.listen(PORT, () => console.log(`Peonify API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialise database:", err);
    process.exit(1);
  });
