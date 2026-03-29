import { Router } from "express";
import { requireAuth, requireRole } from "./auth.js";
import { getPool } from "./db.js";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export function newsRouter() {
  const r = Router();

  r.get("/news", async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id,
                title,
                created_at AS createdAt
         FROM news
         ORDER BY created_at DESC`
      );
      res.json({ ok: true, news: rows });
    } catch (err) {
      console.error("List news failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.get("/news/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    try {
      const pool = getPool();
      const [rows] = await pool.execute(
        `SELECT id,
                title,
                body,
                created_at AS createdAt,
                updated_at AS updatedAt
         FROM news
         WHERE id = ?
         LIMIT 1`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ ok: false, error: "News not found." });
      }
      res.json({ ok: true, item: rows[0] });
    } catch (err) {
      console.error("Get news failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/news", requireAuth, requireRole("admin"), async (req, res) => {
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const body =
      typeof req.body?.body === "string" ? req.body.body.trim() : "";
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ ok: false, error: "Title is required." });
    }
    if (!isNonEmptyString(body)) {
      return res.status(400).json({ ok: false, error: "Body is required." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `INSERT INTO news (title, body) VALUES (?, ?)`,
        [title, body]
      );
      res.status(201).json({ ok: true, id: Number(result.insertId) });
    } catch (err) {
      console.error("Create news failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/news/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const body =
      typeof req.body?.body === "string" ? req.body.body.trim() : "";
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ ok: false, error: "Title is required." });
    }
    if (!isNonEmptyString(body)) {
      return res.status(400).json({ ok: false, error: "Body is required." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `UPDATE news SET title = ?, body = ? WHERE id = ?`,
        [title, body, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "News not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Update news failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.delete("/news/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(`DELETE FROM news WHERE id = ?`, [
        id,
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "News not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Delete news failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return r;
}
