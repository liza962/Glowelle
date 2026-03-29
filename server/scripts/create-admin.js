/**
 * Creates or updates an admin row in `users` (bcrypt hash, role = admin).
 *
 * Uses ADMIN_EMAIL and ADMIN_PASSWORD from .env, or:
 *   node server/scripts/create-admin.js you@email.com your-password
 *
 * Requires: database and `users` table (run npm run db:init once if needed).
 */
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const BCRYPT_ROUNDS = 10;

function assertSafeIdent(name) {
  if (!name || !/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `Invalid MYSQL_DATABASE "${name}". Use letters, numbers, underscore only.`
    );
  }
  return name;
}

async function main() {
  const argEmail = process.argv[2]?.trim().toLowerCase();
  const argPassword = process.argv[3];
  const email = (argEmail || process.env.ADMIN_EMAIL?.trim().toLowerCase()) ?? "";
  const password = (argPassword ?? process.env.ADMIN_PASSWORD)?.trim() ?? "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(
      "Set ADMIN_EMAIL in .env or pass: node server/scripts/create-admin.js <email> <password>"
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters (same rule as the API).");
    process.exit(1);
  }

  const host = (process.env.MYSQL_HOST ?? "127.0.0.1").trim();
  const port = Number((process.env.MYSQL_PORT ?? "3306").trim());
  const user = process.env.MYSQL_USER?.trim();
  const mysqlPassword = process.env.MYSQL_PASSWORD?.trim() ?? "";
  const database = assertSafeIdent(process.env.MYSQL_DATABASE?.trim());

  if (!user) {
    console.error("Set MYSQL_USER in .env");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password: mysqlPassword,
    database,
  });

  try {
    const [existing] = await conn.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existing.length) {
      await conn.execute(
        `UPDATE users SET password_hash = ?, role = 'admin' WHERE email = ?`,
        [passwordHash, email]
      );
      console.log(`Updated existing user to admin: ${email}`);
    } else {
      await conn.execute(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES (?, ?, 'Administrator', 'admin')`,
        [email, passwordHash]
      );
      console.log(`Created admin user: ${email}`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
