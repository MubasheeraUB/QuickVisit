# QuickVisit — How the Backend and Frontend Connect

**Project:** QuickVisit — Seamless Tourist Destination Ticketing System
**Stack:** Node.js + Express (backend) · EJS / vanilla JS (frontend) · PostgreSQL (database)

---

## 1. The big picture

QuickVisit runs as a **single Express server** that does two jobs at once:

1. **Serves the frontend** — it renders HTML pages (EJS templates) and serves static CSS/JS/images.
2. **Exposes a JSON API** — all data operations happen under `/api/*` endpoints.

The browser loads a page, the page's JavaScript calls the `/api/*` endpoints over HTTP using `fetch`, the API talks to PostgreSQL, and JSON flows back to the browser. There is no separate frontend server — the same Node process (`server.js`, port 5000) handles both the pages and the data.

```
Browser (EJS page + JS)
      │   fetch()  →  HTTP + JSON  (with JWT in header)
      ▼
Express server.js  ──►  Routes  ──►  Controllers  ──►  config/db.js (pg Pool)
      ▲                                                        │
      └────────────── JSON response ◄─────────── PostgreSQL ◄──┘
```

---

## 2. The server is the single connection point

Everything is wired in `backend/server.js`:

- **View engine:** `app.set('view engine', 'ejs')` — pages are rendered from `backend/views/`.
- **Static files:** `app.use(express.static('public'))` — serves `/css`, `/js`, `/images`.
- **Body parsing:** `express.json()` lets the server read JSON request bodies.
- **CORS:** `app.use(cors(...))` allows the browser to call the API.
- **Page routes:** `/`, `/login`, `/tourist`, `/admin` each `res.render(...)` an EJS template.
- **API routes:** mounted under `/api/auth`, `/api/destinations`, `/api/bookings`, `/api/payments`, `/api/admin`.

So a request to `/tourist` returns an HTML page, while a request to `/api/destinations` returns JSON. Same server, two response types — the 404 handler even branches on `req.accepts('html')` to decide whether to return an HTML page or a JSON error.

---

## 3. How the frontend reaches the backend (`public/js/api.js`)

The frontend never builds raw requests inline. It uses one helper object, `api`, defined in `public/js/api.js`:

- It sets `API_BASE_URL = 'http://localhost:5000/api'`.
- A core `request()` method wraps `fetch`, always sends `Content-Type: application/json`, and **attaches the JWT token** if one exists: `headers['Authorization'] = 'Bearer ' + token`.
- It exposes convenience methods (`get`, `post`, `put`, `delete`) and grouped namespaces like `api.auth.login()`, `api.destinations.list()`, `api.bookings.create()`, `api.admin.stats()`.

Each EJS page loads this file (`<script src="/js/api.js">`) plus a page-specific script (`tourist.js`, `admin.js`, `auth.js`). Those page scripts call `api.something()` and render the returned data into the DOM. This is the actual bridge: **page JS → `api` helper → `fetch` → `/api/*` endpoint.**

---

## 4. The request lifecycle, end to end

Take **logging in** as the concrete example:

1. **Browser:** user submits the login form on `/login`. `auth.js` calls `api.auth.login(email, password)`, which sends `POST /api/auth/login` with a JSON body.
2. **Route:** `routes/auth.js` maps that URL to `authController.login`.
3. **Controller:** `controllers/authController.js` queries PostgreSQL via `db.query(...)`, compares the password with `bcrypt.compare`, and on success calls `generateToken(user)`.
4. **Response:** the controller returns `{ message, token, user }` as JSON.
5. **Browser:** `api.setToken(token)` stores the JWT in `localStorage` (key `qv_token`). Every later request automatically includes it.

Booking, payments, and admin reads follow the same path: page JS → route → controller → `db.query` → JSON back.

---

## 5. Authentication — what ties the two sides together securely

The connection is stateless and secured with **JWT (JSON Web Tokens)**:

- On login/register the backend signs a token (`middleware/auth.js → generateToken`) containing the user's `id`, `email`, and `role`.
- The frontend stores it in `localStorage` and sends it on every request as `Authorization: Bearer <token>`.
- Protected endpoints run the `verifyToken` middleware, which decodes the token and attaches `req.user`. Admin-only routes additionally run `requireAdmin`, which checks `req.user.role === 'admin'`.

For example `routes/admin.js` applies `router.use(verifyToken, requireAdmin)` so **all** admin endpoints are locked. Some routes are intentionally open (e.g. `POST /api/bookings` allows guest bookings without a token).

---

## 6. The database layer (`config/db.js`)

The controllers don't open their own DB connections. `config/db.js` creates a single **`pg` connection pool** (configured from `.env`: `DB_HOST`, `DB_NAME`, `DB_USER`, etc.) and exports:

- `query(text, params)` — parameterized queries (`$1, $2 ...`) which prevent SQL injection.
- `getClient()` — used by `bookingController` to run a **transaction** (`BEGIN` / `COMMIT` / `ROLLBACK`) so a booking and its payment are saved atomically.

Tables: `users`, `destinations`, `bookings`, `payments`, `feedback` (see `database/schema.sql`).

---

## 7. Why there are two frontend copies

The repo has the frontend in two places:

- `backend/public/` + `backend/views/` — the **live** version the Express server actually serves (EJS templates rendered server-side, static JS/CSS from `public`).
- `quickvisit_detailed/frontend/` — a **standalone static copy** (plain `.html` files) kept for reference/documentation. It contains the same `api.js`, `tourist.js`, etc., but isn't what the running server uses.

When the app runs, the EJS versions under `backend/views` are what the user sees.

---

## 8. One-line summary

> A single Express server renders EJS pages and serves the JS bundle; that JS calls the server's own `/api/*` JSON endpoints via `fetch` (carrying a JWT for auth); Express routes hand off to controllers, which query PostgreSQL through a shared connection pool and return JSON the page renders into the DOM.
