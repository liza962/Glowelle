import { Router } from "express";
import { hashPassword } from "./auth.js";
import { requireAuth, requireRole } from "./auth.js";
import { getPool } from "./db.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function countAdmins(pool) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS n FROM users WHERE role = 'admin'`
  );
  return Number(rows[0]?.n ?? 0);
}

export function adminUsersRouter() {
  const r = Router();

  r.get("/admin/users", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id,
                email,
                full_name AS fullName,
                role,
                created_at AS createdAt
         FROM users
         ORDER BY id ASC`
      );
      res.json({ ok: true, users: rows });
    } catch (err) {
      console.error("List users failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.get("/admin/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT id, email, full_name AS fullName, role, created_at AS createdAt
         FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ ok: false, error: "User not found." });
      }
      res.json({ ok: true, user: rows[0] });
    } catch (err) {
      console.error("Get user failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/admin/users", requireAuth, requireRole("admin"), async (req, res) => {
    const body = req.body ?? {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const role = body.role === "admin" ? "admin" : "user";

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
         VALUES (?, ?, ?, ?)`,
        [email, passwordHash, fullName, role]
      );
      const newId = Number(result.insertId);
      res.status(201).json({
        ok: true,
        id: newId,
        user: {
          id: newId,
          email,
          fullName,
          role,
        },
      });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ ok: false, error: "An account with this email already exists." });
      }
      console.error("Create user failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/admin/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }

    const body = req.body ?? {};
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const role = body.role === "admin" ? "admin" : "user";

    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: "Valid email is required." });
    }
    if (!fullName) {
      return res.status(400).json({ ok: false, error: "Full name is required." });
    }
    if (password.length > 0 && password.length < 8) {
      return res
        .status(400)
        .json({ ok: false, error: "Password must be at least 8 characters." });
    }

    try {
      const pool = getPool();
      const [existing] = await pool.execute(
        `SELECT id, role FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!existing.length) {
        return res.status(404).json({ ok: false, error: "User not found." });
      }

      const wasAdmin = existing[0].role === "admin";
      const admins = await countAdmins(pool);
      if (wasAdmin && role === "user" && admins <= 1) {
        return res.status(409).json({
          ok: false,
          error: "Cannot demote the last administrator.",
        });
      }

      if (password.length > 0) {
        const passwordHash = await hashPassword(password);
        await pool.execute(
          `UPDATE users SET email = ?, password_hash = ?, full_name = ?, role = ?
           WHERE id = ?`,
          [email, passwordHash, fullName, role, id]
        );
      } else {
        await pool.execute(
          `UPDATE users SET email = ?, full_name = ?, role = ? WHERE id = ?`,
          [email, fullName, role, id]
        );
      }

      res.json({ ok: true });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ ok: false, error: "An account with this email already exists." });
      }
      console.error("Update user failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.delete("/admin/users/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }

    if (id === req.user.id) {
      return res
        .status(400)
        .json({ ok: false, error: "You cannot delete your own account." });
    }

    try {
      const pool = getPool();
      const [existing] = await pool.execute(
        `SELECT role FROM users WHERE id = ? LIMIT 1`,
        [id]
      );
      if (!existing.length) {
        return res.status(404).json({ ok: false, error: "User not found." });
      }

      if (existing[0].role === "admin") {
        const admins = await countAdmins(pool);
        if (admins <= 1) {
          return res.status(409).json({
            ok: false,
            error: "Cannot delete the last administrator.",
          });
        }
      }

      await pool.execute(`DELETE FROM users WHERE id = ?`, [id]);
      res.json({ ok: true });
    } catch (err) {
      if (err.errno === 1451 || err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          ok: false,
          error:
            "Cannot delete this user: they have orders or other linked records. Remove or reassign those first.",
        });
      }
      console.error("Delete user failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return r;
}
