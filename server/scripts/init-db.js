/**
 * Creates MYSQL_DATABASE and the bookings table (same as server/schema.sql).
 * Run once: npm run db:init
 *
 * Uses .env — connects without selecting a DB first, so "Unknown database" is fixed.
 */
import dotenv from "dotenv";
import mysql from "mysql2/promise";

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
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  console.log("Table ready: bookings");

  await conn.end();
  console.log("Done. Try again: http://localhost:3001/api/health/db");
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
