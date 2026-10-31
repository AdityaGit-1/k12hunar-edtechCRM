# HunarDesk API reference

Base URL (local): `http://localhost:5000`

## Authentication convention

The whole API uses **Bearer JWT authentication. No cookies are used anywhere.**

- `POST /api/auth/login` returns a signed JWT in `data.token`.
- The frontend must send it on **every** protected request:

  ```
  Authorization: Bearer <token>
  ```

- **Logout** is client-side: the frontend must delete its stored token (and any cached admin data).
  The server is stateless and keeps no session, so there is no logout endpoint.
- A missing, invalid or expired token returns `401`. On any `401` from a protected route the
  frontend must clear the stored token and send the admin to the login page.
- Tokens expire after `JWT_EXPIRES_IN` (default `8h`).

## Response format

Success: `{ "success": true, "message"?: string, "data": { ... } }`

Error: `{ "success": false, "message": string, "errors"?: [{ "field": string, "message": string }] }`

| Status | Meaning |
|---|---|
| 400 | Validation failed (`errors` lists each field) |
| 401 | Missing/invalid/expired token, or wrong login credentials |
| 404 | Route or inquiry not found |
| 429 | Rate limit hit (public form or login) |
| 500 | Unexpected server error |

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Service status |
| POST | `/api/inquiries` | none | Submit an inquiry |
| POST | `/api/auth/login` | none | Admin login |
| GET | `/api/auth/me` | Bearer | Current admin |
| GET | `/api/admin/inquiries` | Bearer | List with filters and pagination |
| GET | `/api/admin/inquiries/stats` | Bearer | Dashboard counts |
| GET | `/api/admin/inquiries/:id` | Bearer | One inquiry by UUID |
| PATCH | `/api/admin/inquiries/:id/status` | Bearer | Update status |

### POST /api/inquiries
Body: `{ userType: "parent|student|school", category: "scholarship|concert|admission|general_query", name, email, phone, message }`
Returns `201` with `data: { id, createdAt }`.

### POST /api/auth/login
Body: `{ email, password }`. Returns `data: { token, admin: { id, name, email } }`.

### GET /api/admin/inquiries
Query (all optional): `page` (default 1), `limit` (1-50, default 10), `category`, `userType`, `status`, `search` (name or phone).
Returns `data: { inquiries: [...], pagination: { page, limit, total, totalPages } }`.

### GET /api/admin/inquiries/stats
Returns `data: { stats: { total, last7Days, byStatus, byCategory, byUserType } }`.

### GET /api/admin/inquiries/:id
`:id` must be a UUID (`400` otherwise). Returns `data: { inquiry }`, or `404` with `"Inquiry not found"`.

### PATCH /api/admin/inquiries/:id/status
Body: `{ status: "new|in_progress|resolved" }`. Returns `data: { inquiry }`, or `404` if the id does not exist.

An inquiry object: `id, name, email, phone, userType, category, message, status, createdAt, updatedAt`.
