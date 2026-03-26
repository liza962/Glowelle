import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { getPool } from "./db.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3001);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

/** Root — this server is API-only; the React UI runs on Vite (see `frontend`). */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    service: "glowelle-api",
    message:
      "API is running. The website runs separately (Vite dev server).",
    frontend: CLIENT_ORIGIN,
    try: {
      health: "/api/health",
      database: "/api/health/db",
    },
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "glowelle-api" });
});

/** Verifies MySQL is reachable (requires valid .env). */
app.get("/api/health/db", async (_req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({ ok: true, mysql: rows[0] });
  } catch (err) {
    console.error("MySQL health check failed:", err.message);
    const safeDetail = process.env.NODE_ENV !== "production";
    res.status(500).json({
      ok: false,
      error: "Database unavailable",
      ...(safeDetail && {
        detail: err.message,
        code: err.code,
        hint:
          err.code === "ER_BAD_DB_ERROR"
            ? `Create the database (e.g. run: npm run db:init) or create "${process.env.MYSQL_DATABASE}" in phpMyAdmin.`
            : err.code === "ECONNREFUSED"
              ? "MySQL is not running or MYSQL_HOST/MYSQL_PORT is wrong."
              : err.code === "ER_ACCESS_DENIED_ERROR"
                ? "Check MYSQL_USER and MYSQL_PASSWORD in .env."
                : undefined,
      }),
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Glowelle API  http://localhost:${PORT}`);
  console.log(`React app (UI) ${CLIENT_ORIGIN}  → run: npm run dev`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process (e.g. another "npm run server") or set PORT=3002 in .env`
    );
  } else {
    console.error(err);
  }
  process.exit(1);
});
