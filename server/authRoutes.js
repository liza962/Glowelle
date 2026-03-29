import { Router } from "express";
import { getPool } from "./db.js";
import {
  comparePassword,
  hashPassword,
  requireAuth,
  signToken,
} from "./auth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function authRouter() {
  const r = Router();

  r.post("/auth/register", async (req, res) => {
    const body = req.body ?? {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ ok: false, error: "Password must be at least 8 characters." });
    }
    if (!fullName) {
      return res.status(400).json({ ok: false, error: "Full name is required." });
    }

    try {
      const pool = getPool();
      const passwordHash = await hashPassword(password);
      const [result] = await pool.execute(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES (?, ?, ?, 'user')`,
        [email, passwordHash, fullName]
      );
      const id = Number(result.insertId);
      const token = signToken(id, email, "user");
      res.status(201).json({
        ok: true,
        token,
        user: { id, email, fullName, role: "user" },
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ ok: false, error: "An account with this email already exists." });
      }
      console.error("Register failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/auth/login", async (req, res) => {
    const body = req.body ?? {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "Email and password required." });
    }

    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT id, email, password_hash, full_name, role FROM users WHERE email = ? LIMIT 1`,
        [email]
      );
      if (!rows.length) {
        return res
          .status(401)
          .json({ ok: false, error: "Invalid email or password." });
      }
      const row = rows[0];
      const ok = await comparePassword(password, row.password_hash);
      if (!ok) {
        return res
          .status(401)
          .json({ ok: false, error: "Invalid email or password." });
      }
      const role = row.role === "admin" ? "admin" : "user";
      const token = signToken(row.id, row.email, role);
      res.json({
        ok: true,
        token,
        user: {
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          role,
        },
      });
    } catch (err) {
      console.error("Login failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.get("/auth/me", requireAuth, async (req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT id, email, full_name, role FROM users WHERE id = ? LIMIT 1`,
        [req.user.id]
      );
      if (!rows.length) {
        return res.status(401).json({ ok: false, error: "User not found." });
      }
      const row = rows[0];
      res.json({
        ok: true,
        user: {
          id: row.id,
          email: row.email,
          fullName: row.full_name,
          role: row.role === "admin" ? "admin" : "user",
        },
      });
    } catch (err) {
      console.error("Auth me failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return r;
}
