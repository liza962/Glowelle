# Glowelle

Skincare storefront and admin tools: product catalog, cart, checkout, news, offer bookings, and contact page content. The UI is a **React (Vite)** SPA; the backend is a **Node.js (Express)** API backed by **MySQL** (or MariaDB-compatible).

---
Check DOCS folder for Documentation Word and PDF
---

Requirements

- **Node.js** 18+ (with npm)
- **MySQL** or **MariaDB** reachable from the machine running the API

Architecture

- **Frontend:** React 19 + React Router + React Bootstrap; `src/App.jsx` defines routes and layout.
- **Backend:** Express mounts routers under `/api` (`server/index.js`, `server/*Routes.js`).
- **Vite dev:** Requests to `/api/*` are proxied to `http://localhost:${PORT}` so the SPA uses same-origin URLs during development.

Authentication

- **JWT** in `Authorization: Bearer <token>` for protected routes.
- `server/auth.js` — `signToken`, `requireAuth`, `requireRole`.
- Passwords are hashed with **bcrypt**; registration and login live in `server/authRoutes.js`.
---

Quick start

1. Clone the repo and install dependencies:

   ```bash
   cd Glowelle
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and adjust values.

3. **Create the database** (tables, optional admin user, demo catalog, news, contact, etc.)

   ```bash
   npm run db:init
   ```

4. **Run the app** — two terminals, or one combined command:

   ```bash
   # Terminal 1 — API (default http://localhost:3001)
   npm run server

   # Terminal 2 — Vite dev server (default http://localhost:5173)
   npm run dev
   ```

5. Open **http://localhost:5173** in the browser. API calls from the UI go to `/api/*`, which Vite **proxies** to the Express server (see `vite.config.js`).

---

Environment variables

Create a `.env` file in the project root (see `.env.example`).

| Variable | Purpose |
| `PORT` | API port (default `3001`). |
| `CLIENT_ORIGIN` | Allowed CORS origin for the SPA (e.g. `http://localhost:5173`). |
| `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` | MySQL connection. |
| `JWT_SECRET` | Secret for signing JWTs. **Required in production.** |
| `JWT_EXPIRES_IN` | Optional, e.g. `7d` (default in code). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | If no admin user exists, `db:init` can create one. |

## Database

- **Schema:** `server/schema.sql` (can be run in phpMyAdmin or the MySQL client).
- **Init script:** `npm run db:init` creates the database (if needed), creates tables, and 

If you add new tables or columns later, run `db:init` again or apply the SQL from `schema.sql` manually.

---

**Health checks:** `GET http://localhost:3001/api/health` and `GET http://localhost:3001/api/health/db` (MySQL must be up and `.env` correct).

---

## What’s included

### Public site

- **Home** — product catalog with categories, search, and pagination (data from API).
- **About, Offers, Contact** — static content; **contact** address and map embed from **Contact settings** (`/api/contact`).
- **News** — list and article pages from DB.
- **Auth** — register and login; JWT stored in `localStorage` for the SPA.
- **Shop** — logged-in **customers** (`role: user`) get a cart, checkout, and order history on the client.

### Admin (`role: admin`)

- **Products & categories** — CRUD for catalog.
- **Orders** — shop orders with line items; **status** (pending / confirmed / completed).
- **Offer requests** — form submissions from the **Offers** page (consultation packages), with the same status workflow.
- **Users** — admin CRUD for accounts.
- **News** — CRUD for articles.
- **Contact** — edit the single **Contact us** block (address + map URL).

Admins signing in are sent to the admin area by default; **View site** in the admin header returns to the storefront.
