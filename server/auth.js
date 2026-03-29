import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const BCRYPT_ROUNDS = 10;

function getJwtSecret() {
  const s = process.env.JWT_SECRET?.trim();
  if (s) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production.");
  }
  return "dev-only-jwt-secret-change-in-.env";
}

export function signToken(userId, email, role) {
  return jwt.sign(
    { sub: userId, email, role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN?.trim() || "7d" }
  );
}

export function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}


export function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Authentication required." });
  }
  const token = h.slice(7).trim();
  if (!token) {
    return res.status(401).json({ ok: false, error: "Authentication required." });
  }
  try {
    const payload = jwt.verify(token, getJwtSecret());
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(401).json({ ok: false, error: "Invalid token." });
    }
    req.user = {
      id,
      email: String(payload.email ?? ""),
      role: payload.role === "admin" ? "admin" : "user",
    };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "Invalid or expired token." });
  }
}

export function requireRole(...allowed) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, error: "Authentication required." });
    }
    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: "Access denied." });
    }
    next();
  };
}
