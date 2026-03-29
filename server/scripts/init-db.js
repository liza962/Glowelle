import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mysql from "mysql2/promise";
import { DEFAULT_CONTACT } from "../../src/data/defaultContact.js";
import { NEWS_SEED } from "../../src/data/newsSeed.js";
import { PRODUCTS } from "../../src/data/products.js";

dotenv.config();

function assertSafeIdent(name) {
  if (!name || !/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `Invalid MYSQL_DATABASE "${name}". Use letters, numbers, underscore only.`
    );
  }
  return name;
}

async function main() {
  const host = (process.env.MYSQL_HOST ?? "127.0.0.1").trim();
  const port = Number((process.env.MYSQL_PORT ?? "3306").trim());
  const user = process.env.MYSQL_USER?.trim();
  const password = process.env.MYSQL_PASSWORD?.trim() ?? "";
  const database = assertSafeIdent(process.env.MYSQL_DATABASE?.trim());

  if (!user) {
    console.error("Set MYSQL_USER in .env");
    process.exit(1);
  }

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: false,
  });

  const dbId = mysql.escapeId(database);

  await conn.query(
    `CREATE DATABASE IF NOT EXISTS ${dbId} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  console.log(`Database ready: ${database}`);

  await conn.query(`USE ${dbId}`);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      package_name VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(64) NOT NULL,
      address TEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: bookings");

  try {
    await conn.query(
      `ALTER TABLE bookings ADD COLUMN status VARCHAR(32) NOT NULL DEFAULT 'pending' AFTER address`
    );
    console.log("Migration: bookings.status added");
  } catch (e) {
    if (e.code !== "ER_DUP_FIELDNAME" && e.errno !== 1060) throw e;
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS product_category (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      name VARCHAR(128) NOT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_product_category_name (name)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: product_category");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      category_id INT UNSIGNED NOT NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      price VARCHAR(32) NOT NULL,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES product_category (id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: products");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: users");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      user_id INT UNSIGNED NOT NULL,
      product_id INT UNSIGNED NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, product_id),
      CONSTRAINT fk_cart_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE,
      CONSTRAINT fk_cart_product FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: cart_items");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(64) NOT NULL,
      address TEXT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: orders");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      order_id INT UNSIGNED NOT NULL,
      product_id INT UNSIGNED NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      product_name VARCHAR(255) NOT NULL,
      price VARCHAR(32) NOT NULL,
      PRIMARY KEY (id),
      CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE,
      CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: order_items");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS news (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      title VARCHAR(512) NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: news");

  await conn.query(`
    CREATE TABLE IF NOT EXISTS contact_settings (
      id TINYINT UNSIGNED NOT NULL PRIMARY KEY DEFAULT 1,
      brand_title VARCHAR(120) NOT NULL,
      subtitle VARCHAR(255) NOT NULL,
      address_line1 VARCHAR(255) NOT NULL,
      address_line2 VARCHAR(255) NOT NULL,
      region VARCHAR(128) NOT NULL,
      map_embed_url TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: contact_settings");

  const [contactRows] = await conn.query(
    `SELECT COUNT(*) AS n FROM contact_settings WHERE id = 1`
  );
  if (Number(contactRows[0]?.n ?? 0) === 0) {
    await conn.execute(
      `INSERT INTO contact_settings
         (id, brand_title, subtitle, address_line1, address_line2, region, map_embed_url)
       VALUES (1, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_CONTACT.brandTitle,
        DEFAULT_CONTACT.subtitle,
        DEFAULT_CONTACT.addressLine1,
        DEFAULT_CONTACT.addressLine2,
        DEFAULT_CONTACT.region,
        DEFAULT_CONTACT.mapEmbedUrl,
      ]
    );
    console.log("Seeded contact_settings (id=1)");
  }

  const [adminCountRows] = await conn.query(
    `SELECT COUNT(*) AS n FROM users WHERE role = 'admin'`
  );
  const adminCount = Number(adminCountRows[0]?.n ?? 0);
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  if (adminCount === 0 && adminEmail && adminPassword) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await conn.execute(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES (?, ?, 'Administrator', 'admin')`,
      [adminEmail, passwordHash]
    );
    console.log(`Seeded admin user: ${adminEmail}`);
  } else if (adminCount === 0) {
    console.log(
      "No admin user: set ADMIN_EMAIL and ADMIN_PASSWORD in .env and run db:init again."
    );
  }

  const demoEmail = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();
  const demoPassword = process.env.DEMO_USER_PASSWORD?.trim();
  if (demoEmail && demoPassword) {
    const [dup] = await conn.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [demoEmail]
    );
    if (!dup.length) {
      const passwordHash = await bcrypt.hash(demoPassword, 10);
      await conn.execute(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES (?, ?, 'Demo User', 'user')`,
        [demoEmail, passwordHash]
      );
      console.log(`Seeded demo user: ${demoEmail}`);
    }
  }

  const [countRows] = await conn.query(`SELECT COUNT(*) AS n FROM products`);
  const productCount = Number(countRows[0]?.n ?? 0);
  if (productCount === 0) {
    const names = [...new Set(PRODUCTS.map((p) => p.category))].sort((a, b) =>
      a.localeCompare(b)
    );
    for (const name of names) {
      await conn.execute(`INSERT INTO product_category (name) VALUES (?)`, [
        name,
      ]);
    }
    const [catRows] = await conn.query(
      `SELECT id, name FROM product_category`
    );
    const byName = Object.fromEntries(catRows.map((r) => [r.name, r.id]));
    for (const p of PRODUCTS) {
      const categoryId = byName[p.category];
      await conn.execute(
        `INSERT INTO products (category_id, name, description, price, image_url)
         VALUES (?, ?, ?, ?, ?)`,
        [categoryId, p.name, p.description, p.price, p.image]
      );
    }
    console.log(`Seeded ${PRODUCTS.length} products and ${names.length} categories`);
  }

  const [newsCountRows] = await conn.query(`SELECT COUNT(*) AS n FROM news`);
  const newsCount = Number(newsCountRows[0]?.n ?? 0);
  if (newsCount === 0 && NEWS_SEED.length > 0) {
    for (const item of NEWS_SEED) {
      await conn.execute(`INSERT INTO news (title, body) VALUES (?, ?)`, [
        item.title,
        item.body,
      ]);
    }
    console.log(`Seeded ${NEWS_SEED.length} news articles`);
  }

  await conn.end();
  console.log("Done. Try again: http://localhost:3001/api/health/db");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
