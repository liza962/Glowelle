import { Router } from "express";
import { requireAuth, requireRole } from "./auth.js";
import { normalizeProductPriceForDb } from "./priceUtils.js";
import { getPool } from "./db.js";

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function isHttpUrl(v) {
  if (!isNonEmptyString(v)) return false;
  try {
    const u = new URL(v.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function catalogRouter() {
  const r = Router();

  /** Categories */
  r.get("/product-categories", async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id, name FROM product_category ORDER BY name ASC`
      );
      res.json({ ok: true, categories: rows });
    } catch (err) {
      console.error("List categories failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/product-categories", requireAuth, requireRole("admin"), async (req, res) => {
    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      return res.status(400).json({ ok: false, error: "Name is required." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `INSERT INTO product_category (name) VALUES (?)`,
        [name]
      );
      res.status(201).json({ ok: true, id: Number(result.insertId) });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ ok: false, error: "A category with this name already exists." });
      }
      console.error("Create category failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/product-categories/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    const name =
      typeof req.body?.name === "string" ? req.body.name.trim() : "";
    if (!name) {
      return res.status(400).json({ ok: false, error: "Name is required." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `UPDATE product_category SET name = ? WHERE id = ?`,
        [name, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Category not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(409)
          .json({ ok: false, error: "A category with this name already exists." });
      }
      console.error("Update category failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.delete("/product-categories/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `DELETE FROM product_category WHERE id = ?`,
        [id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Category not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      if (err.errno === 1451 || err.code === "ER_ROW_IS_REFERENCED_2") {
        return res.status(409).json({
          ok: false,
          error:
            "Cannot delete: products still use this category. Reassign or delete those products first.",
        });
      }
      console.error("Delete category failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  /** Products (image stored as URL string only) */
  r.get("/products", async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT p.id,
                p.category_id AS categoryId,
                c.name AS category,
                p.name,
                p.description,
                p.price,
                p.image_url AS image
         FROM products p
         INNER JOIN product_category c ON c.id = p.category_id
         ORDER BY p.id ASC`
      );
      res.json({ ok: true, products: rows });
    } catch (err) {
      console.error("List products failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.get("/products/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT p.id,
                p.category_id AS categoryId,
                c.name AS category,
                p.name,
                p.description,
                p.price,
                p.image_url AS image
         FROM products p
         INNER JOIN product_category c ON c.id = p.category_id
         WHERE p.id = ?
         LIMIT 1`,
        [id]
      );
      if (!rows.length) {
        return res.status(404).json({ ok: false, error: "Product not found." });
      }
      res.json({ ok: true, product: rows[0] });
    } catch (err) {
      console.error("Get product failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/products", requireAuth, requireRole("admin"), async (req, res) => {
    const body = req.body ?? {};
    const categoryId = Number(body.categoryId);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const priceRaw = body.price;
    const imageUrl =
      typeof body.image === "string"
        ? body.image.trim()
        : typeof body.imageUrl === "string"
          ? body.imageUrl.trim()
          : "";

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return res.status(400).json({ ok: false, error: "categoryId is required." });
    }
    if (!name || !description) {
      return res.status(400).json({
        ok: false,
        error: "name, description, and price are required.",
      });
    }
    const priceNorm = normalizeProductPriceForDb(priceRaw);
    if (priceNorm === null) {
      return res.status(400).json({
        ok: false,
        error: "price must be a non-negative number (e.g. 22 or 19.99).",
      });
    }
    if (!isHttpUrl(imageUrl)) {
      return res.status(400).json({
        ok: false,
        error: "image must be a valid http(s) URL.",
      });
    }

    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `INSERT INTO products (category_id, name, description, price, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [categoryId, name, description, priceNorm, imageUrl]
      );
      res.status(201).json({ ok: true, id: Number(result.insertId) });
    } catch (err) {
      if (err.errno === 1452 || err.code === "ER_NO_REFERENCED_ROW_2") {
        return res
          .status(400)
          .json({ ok: false, error: "Invalid categoryId (category does not exist)." });
      }
      console.error("Create product failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    const body = req.body ?? {};
    const categoryId = Number(body.categoryId);
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string" ? body.description.trim() : "";
    const priceRaw = body.price;
    const imageUrl =
      typeof body.image === "string"
        ? body.image.trim()
        : typeof body.imageUrl === "string"
          ? body.imageUrl.trim()
          : "";

    if (!Number.isInteger(categoryId) || categoryId < 1) {
      return res.status(400).json({ ok: false, error: "categoryId is required." });
    }
    if (!name || !description) {
      return res.status(400).json({
        ok: false,
        error: "name, description, and price are required.",
      });
    }
    const priceNorm = normalizeProductPriceForDb(priceRaw);
    if (priceNorm === null) {
      return res.status(400).json({
        ok: false,
        error: "price must be a non-negative number (e.g. 22 or 19.99).",
      });
    }
    if (!isHttpUrl(imageUrl)) {
      return res.status(400).json({
        ok: false,
        error: "image must be a valid http(s) URL.",
      });
    }

    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `UPDATE products
         SET category_id = ?, name = ?, description = ?, price = ?, image_url = ?
         WHERE id = ?`,
        [categoryId, name, description, priceNorm, imageUrl, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Product not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      if (err.errno === 1452 || err.code === "ER_NO_REFERENCED_ROW_2") {
        return res
          .status(400)
          .json({ ok: false, error: "Invalid categoryId (category does not exist)." });
      }
      console.error("Update product failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.delete("/products/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(`DELETE FROM products WHERE id = ?`, [
        id,
      ]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Product not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Delete product failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return r;
}
