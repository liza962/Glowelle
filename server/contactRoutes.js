import { Router } from "express";
import { requireAuth, requireRole } from "./auth.js";
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

export function contactRouter() {
  const r = Router();

  const selectPublic = `SELECT brand_title AS brandTitle,
                subtitle,
                address_line1 AS addressLine1,
                address_line2 AS addressLine2,
                region,
                map_embed_url AS mapEmbedUrl,
                updated_at AS updatedAt`;

  r.get("/contact", async (_req, res) => {
    try {
      const pool = getPool();
      const [rows] = await pool.query(
        `${selectPublic}
         FROM contact_settings
         WHERE id = 1
         LIMIT 1`
      );
      if (!rows.length) {
        return res.status(404).json({
          ok: false,
          error: "Contact settings not initialized. Run npm run db:init.",
        });
      }
      res.json({ ok: true, contact: rows[0] });
    } catch (err) {
      console.error("Get contact failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  r.put("/admin/contact", requireAuth, requireRole("admin"), async (req, res) => {
    const body = req.body ?? {};
    const brandTitle =
      typeof body.brandTitle === "string" ? body.brandTitle.trim() : "";
    const subtitle =
      typeof body.subtitle === "string" ? body.subtitle.trim() : "";
    const addressLine1 =
      typeof body.addressLine1 === "string" ? body.addressLine1.trim() : "";
    const addressLine2 =
      typeof body.addressLine2 === "string" ? body.addressLine2.trim() : "";
    const region = typeof body.region === "string" ? body.region.trim() : "";
    const mapEmbedUrl =
      typeof body.mapEmbedUrl === "string" ? body.mapEmbedUrl.trim() : "";

    if (
      !isNonEmptyString(brandTitle) ||
      !isNonEmptyString(subtitle) ||
      !isNonEmptyString(addressLine1) ||
      !isNonEmptyString(addressLine2) ||
      !isNonEmptyString(region)
    ) {
      return res.status(400).json({
        ok: false,
        error:
          "brandTitle, subtitle, addressLine1, addressLine2, and region are required.",
      });
    }
    if (!isHttpUrl(mapEmbedUrl)) {
      return res.status(400).json({
        ok: false,
        error: "mapEmbedUrl must be a valid http(s) URL (Google Maps embed).",
      });
    }

    try {
      const pool = getPool();
      await pool.execute(
        `INSERT INTO contact_settings
           (id, brand_title, subtitle, address_line1, address_line2, region, map_embed_url)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           brand_title = VALUES(brand_title),
           subtitle = VALUES(subtitle),
           address_line1 = VALUES(address_line1),
           address_line2 = VALUES(address_line2),
           region = VALUES(region),
           map_embed_url = VALUES(map_embed_url)`,
        [
          brandTitle,
          subtitle,
          addressLine1,
          addressLine2,
          region,
          mapEmbedUrl,
        ]
      );
      const [rows] = await pool.query(
        `${selectPublic}
         FROM contact_settings
         WHERE id = 1
         LIMIT 1`
      );
      res.json({ ok: true, contact: rows[0] });
    } catch (err) {
      console.error("Save contact failed:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  return r;
}
