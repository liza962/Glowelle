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
      createBooking: "POST /api/bookings",
      listBookingsDev: "GET /api/bookings (non-production only)",
      debugDb:
        "GET /api/debug/db-target — which MySQL instance Node uses (compare to phpMyAdmin)",
    },
  });
});

/**
 * Shows which database server Node actually connected to (vs phpMyAdmin).
 * If bookings exist here but not in phpMyAdmin, fix MYSQL_PORT in .env to match Docker’s published MariaDB port.
 */
app.get("/api/debug/db-target", async (_req, res) => {
  try {
    const pool = getPool();
    const [meta] = await pool.query(
      `SELECT DATABASE() AS current_database,
              @@hostname AS mysql_hostname,
              @@port AS mysql_server_port,
              VERSION() AS version`
    );
    const [cnt] = await pool.query(
      `SELECT COUNT(*) AS bookings_count FROM bookings`
    );
    res.json({
      ok: true,
      fromEnv: {
        MYSQL_HOST: process.env.MYSQL_HOST,
        MYSQL_PORT: process.env.MYSQL_PORT,
        MYSQL_DATABASE: process.env.MYSQL_DATABASE,
        MYSQL_USER: process.env.MYSQL_USER,
      },
      mysqlReports: meta[0],
      bookingsRowCount: Number(cnt[0]?.bookings_count ?? 0),
      hint:
        "If bookingsRowCount > 0 but phpMyAdmin shows 0 rows, Node and phpMyAdmin are not the same server. Set MYSQL_PORT in .env to the host port Docker maps for MariaDB (docker-compose: \"3307:3306\" → use 3307).",
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
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

/** Save an offer booking (from BookingModal). */
app.post("/api/bookings", async (req, res) => {
  const body = req.body ?? {};
  const packageName =
    typeof body.packageName === "string" ? body.packageName.trim() : "";
  const fullName =
    typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const address = typeof body.address === "string" ? body.address.trim() : "";

  if (!packageName || !fullName || !email || !phone || !address) {
    return res.status(400).json({
      ok: false,
      error: "All fields are required.",
    });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return res.status(400).json({ ok: false, error: "Invalid email address." });
  }

  try {
    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO bookings (package_name, full_name, email, phone, address)
       VALUES (?, ?, ?, ?, ?)`,
      [packageName, fullName, email, phone, address]
    );
    const id = Number(result.insertId);
    console.log(
      `[booking] inserted id=${id} database=${process.env.MYSQL_DATABASE} host=${process.env.MYSQL_HOST}`
    );
    res.status(201).json({ ok: true, id });
  } catch (err) {
    console.error("Booking insert failed:", err.message);
    const safeDetail = process.env.NODE_ENV !== "production";
    res.status(500).json({
      ok: false,
      error: "Could not save booking.",
      ...(safeDetail && { detail: err.message }),
    });
  }
});

/** Dev helper: list recent bookings (same DB as .env). Remove or protect in production. */
if (process.env.NODE_ENV !== "production") {
  app.get("/api/bookings", async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id, package_name, full_name, email, phone, created_at
         FROM bookings
         ORDER BY id DESC
         LIMIT 50`
      );
      res.json({
        ok: true,
        database: process.env.MYSQL_DATABASE,
        count: rows.length,
        rows,
      });
    } catch (err) {
      console.error("List bookings failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });
}

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
