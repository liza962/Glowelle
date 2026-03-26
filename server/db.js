import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

let pool = null;

/**
 * Shared MySQL pool. Configure via .env (see .env.example).
 */
export function getPool() {
  if (!pool) {
    const MYSQL_HOST = (process.env.MYSQL_HOST ?? "127.0.0.1").trim();
    const MYSQL_PORT = (process.env.MYSQL_PORT ?? "3306").trim();
    const MYSQL_USER = process.env.MYSQL_USER?.trim();
    const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD?.trim() ?? "";
    const MYSQL_DATABASE = process.env.MYSQL_DATABASE?.trim();

    if (!MYSQL_USER || !MYSQL_DATABASE) {
      throw new Error(
        "Missing MYSQL_USER or MYSQL_DATABASE. Copy .env.example to .env and set MySQL variables."
      );
    }

    pool = mysql.createPool({
      host: MYSQL_HOST,
      port: Number(MYSQL_PORT),
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      waitForConnections: true,
      connectionLimit: 10,
      enableKeepAlive: true,
    });
  }
  return pool;
}
