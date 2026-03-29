import { Router } from "express";
import { normalizeAdminStatus } from "./adminStatus.js";
import { parsePriceInput } from "./priceUtils.js";
import { getPool } from "./db.js";
import { requireAuth, requireRole } from "./auth.js";

function formatEuro(amount) {
  if (!Number.isFinite(amount)) return "—";
  return `€${amount.toFixed(2)}`;
}

export function shopRouter() {
  const r = Router();

  r.get("/cart", requireAuth, requireRole("user"), async (req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT c.product_id AS productId,
                c.quantity,
                p.name,
                p.description,
                p.price,
                p.image_url AS image,
                cat.name AS category
         FROM cart_items c
         INNER JOIN products p ON p.id = c.product_id
         INNER JOIN product_category cat ON cat.id = p.category_id
         WHERE c.user_id = ?
         ORDER BY c.updated_at DESC`,
        [req.user.id]
      );
      res.json({ ok: true, items: rows });
    } catch (err) {
      console.error("Cart list failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/cart", requireAuth, requireRole("user"), async (req, res) => {
    const productId = Number(req.body?.productId);
    const quantity = Math.max(1, Number(req.body?.quantity) || 1);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ ok: false, error: "productId is required." });
    }
    try {
      const pool = getPool();
      const [exists] = await pool.execute(
        `SELECT id FROM products WHERE id = ? LIMIT 1`,
        [productId]
      );
      if (!exists.length) {
        return res.status(404).json({ ok: false, error: "Product not found." });
      }
      await pool.execute(
        `INSERT INTO cart_items (user_id, product_id, quantity)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
        [req.user.id, productId, quantity]
      );
      res.status(201).json({ ok: true });
    } catch (err) {
      console.error("Cart add failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.patch("/cart/:productId", requireAuth, requireRole("user"), async (req, res) => {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body?.quantity);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ ok: false, error: "Invalid product id." });
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({ ok: false, error: "quantity must be at least 1." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [quantity, req.user.id, productId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Cart line not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Cart update failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.delete("/cart/:productId", requireAuth, requireRole("user"), async (req, res) => {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId < 1) {
      return res.status(400).json({ ok: false, error: "Invalid product id." });
    }
    try {
      const pool = getPool();
      await pool.execute(
        `DELETE FROM cart_items WHERE user_id = ? AND product_id = ?`,
        [req.user.id, productId]
      );
      res.json({ ok: true });
    } catch (err) {
      console.error("Cart delete failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.post("/orders/checkout", requireAuth, requireRole("user"), async (req, res) => {
    const body = req.body ?? {};
    const fullName =
      typeof body.fullName === "string" ? body.fullName.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";

    if (!fullName || !phone || !address) {
      return res.status(400).json({
        ok: false,
        error: "Full name, phone, and address are required.",
      });
    }

    const pool = getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [cartRows] = await conn.query(
        `SELECT c.product_id, c.quantity, p.name, p.price
         FROM cart_items c
         INNER JOIN products p ON p.id = c.product_id
         WHERE c.user_id = ?`,
        [req.user.id]
      );

      if (!cartRows.length) {
        await conn.rollback();
        return res.status(400).json({ ok: false, error: "Your cart is empty." });
      }

      const [userRows] = await conn.execute(
        `SELECT email FROM users WHERE id = ? LIMIT 1`,
        [req.user.id]
      );
      const email = userRows[0]?.email ?? "";

      const [orderResult] = await conn.execute(
        `INSERT INTO orders (user_id, full_name, email, phone, address, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [req.user.id, fullName, email, phone, address]
      );
      const orderId = Number(orderResult.insertId);

      for (const line of cartRows) {
        await conn.execute(
          `INSERT INTO order_items (order_id, product_id, quantity, product_name, price)
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            line.product_id,
            line.quantity,
            line.name,
            line.price,
          ]
        );
      }

      await conn.execute(`DELETE FROM cart_items WHERE user_id = ?`, [
        req.user.id,
      ]);

      await conn.commit();
      res.status(201).json({ ok: true, orderId });
    } catch (err) {
      await conn.rollback();
      console.error("Checkout failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    } finally {
      conn.release();
    }
  });

  r.get("/admin/bookings", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `SELECT id,
                package_name AS packageName,
                full_name AS fullName,
                email,
                phone,
                address,
                status,
                created_at AS createdAt
         FROM bookings
         ORDER BY id DESC`
      );
      res.json({ ok: true, bookings: rows });
    } catch (err) {
      console.error("Admin bookings list failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/admin/bookings/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    const status = normalizeAdminStatus(req.body?.status);
    if (!status) {
      return res
        .status(400)
        .json({ ok: false, error: "status must be pending, confirmed, or completed." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `UPDATE bookings SET status = ? WHERE id = ?`,
        [status, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Booking not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin booking status update failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.get("/admin/orders", requireAuth, requireRole("admin"), async (_req, res) => {
    try {
      const pool = getPool();
      const [orders] = await pool.query(
        `SELECT o.id,
                o.user_id AS userId,
                o.full_name AS fullName,
                o.email,
                o.phone,
                o.address,
                o.status,
                o.created_at AS createdAt
         FROM orders o
         ORDER BY o.id DESC`
      );

      if (!orders.length) {
        return res.json({ ok: true, orders: [] });
      }

      const ids = orders.map((o) => o.id);
      const placeholders = ids.map(() => "?").join(",");
      const [items] = await pool.query(
        `SELECT order_id AS orderId,
                product_id AS productId,
                quantity,
                product_name AS productName,
                price
         FROM order_items
         WHERE order_id IN (${placeholders})
         ORDER BY id ASC`,
        ids
      );

      const byOrder = new Map();
      for (const o of orders) {
        byOrder.set(o.id, { ...o, items: [] });
      }
      for (const it of items) {
        const bucket = byOrder.get(it.orderId);
        if (bucket) {
          const unit = parsePriceInput(it.price);
          const lineAmount = Number.isFinite(unit) ? unit * it.quantity : NaN;
          bucket.items.push({
            productId: it.productId,
            quantity: it.quantity,
            productName: it.productName,
            price: it.price,
            lineTotal: formatEuro(lineAmount),
          });
          bucket._sum = (bucket._sum ?? 0) + (Number.isFinite(lineAmount) ? lineAmount : 0);
        }
      }

      const out = [...byOrder.values()].map((o) => {
        const { _sum, ...rest } = o;
        return {
          ...rest,
          orderTotal: formatEuro(Number.isFinite(_sum) ? _sum : 0),
        };
      });

      res.json({ ok: true, orders: out });
    } catch (err) {
      console.error("Admin orders list failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/admin/orders/:id", requireAuth, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, error: "Invalid id." });
    }
    const status = normalizeAdminStatus(req.body?.status);
    if (!status) {
      return res
        .status(400)
        .json({ ok: false, error: "status must be pending, confirmed, or completed." });
    }
    try {
      const pool = getPool();
      const [result] = await pool.execute(
        `UPDATE orders SET status = ? WHERE id = ?`,
        [status, id]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ ok: false, error: "Order not found." });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin order status update failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return r;
}
