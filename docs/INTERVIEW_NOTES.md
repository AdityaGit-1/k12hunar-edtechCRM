# Interview notes: explaining HunarDesk

## 30-second pitch

HunarDesk is a small CRM for an education organisation. Visitors submit inquiries through a public
React form; an Express API validates them and stores them in Supabase PostgreSQL. Admins log in with
email and password (bcrypt + JWT, no Supabase Auth) and use a protected dashboard to search, filter,
and update the status of each inquiry.

## How a request flows

```text
Browser (React)  ->  Express route  ->  validate (Zod)  ->  [requireAuth]  ->  controller  ->  service (SQL via pg)  ->  Supabase PostgreSQL
```

- **Routes** only connect URLs to code. **Controllers** read the validated input and send the response.
  **Services** hold the SQL. This keeps each file small and easy to explain.
- The database uses `snake_case` (`user_type`); the API returns `camelCase` (`userType`). One file,
  `utils/formatters.js`, does the conversion.

## Login flow

1. Admin posts email + password to `/api/auth/login`.
2. Server finds the admin row, runs `bcrypt.compare(password, password_hash)`.
3. If it matches, the server signs a JWT (`sub` = admin id, expires in 8h) with `JWT_SECRET` and returns it.
4. The frontend stores it and sends `Authorization: Bearer <token>` on protected calls.
5. `requireAuth` verifies the signature and expiry and checks the admin still exists, else `401`.
6. Logout = delete the token on the client (the server is stateless).

## Questions you may get

**Why bcrypt instead of SHA-256 / MD5?**
Fast hashes can be brute-forced quickly. bcrypt is deliberately slow and adds a random salt per password,
and the cost factor (12) can be raised as computers get faster.

**Why JWT in a Bearer header instead of cookies?**
The frontend (Vercel) and API (Render) are on different domains, and Bearer tokens avoid cross-site cookie
settings and CSRF. The trade-off: a token in `localStorage` can be stolen if the site has an XSS bug.
React escapes output by default and the app renders no raw HTML, which lowers that risk. A production
upgrade would be short-lived access tokens plus an httpOnly refresh cookie.

**What stops SQL injection?**
Every value goes through `$1, $2...` placeholders in the `pg` driver; user input is never concatenated into SQL.
The search escapes `%` and `_` so they are matched literally.

**Why validate on both frontend and backend?**
The frontend gives instant feedback; the backend is the real protection because anyone can call the API directly.
The database `CHECK` constraints are a third safety net.

**Why does login give the same error for a wrong email and a wrong password?**
So an attacker cannot learn which emails belong to admins. bcrypt also runs against a dummy hash for unknown emails
so the response time is similar.

**Why a connection pool?**
Opening a database connection per request is slow. The pool keeps up to 10 connections open and reuses them.

**Why the Session pooler URL for Supabase?**
Direct connections use IPv6, which many networks and hosts do not support. The pooler works over IPv4.

**Why is Row Level Security enabled with no policies?**
Supabase exposes public-schema tables through a REST API using a public key. This app never uses that API, so RLS
with no policies blocks it completely, while the backend's direct Postgres connection is unaffected.

**How does the search work?**
Debounced in React (waits 400 ms after typing stops), then the API runs `ILIKE` on name and phone, plus a
digits-only comparison so `9876543210` finds `+91 98765-43210`.

**How is pagination done?**
`LIMIT` and `OFFSET` with a count query; the API returns `{ page, limit, total, totalPages }`.
Offset pagination is simple and fine at this scale; very large tables would use keyset pagination.

**What happens if two filters change quickly?**
Each fetch has a `cancelled` flag in its effect cleanup, so a slow old response can never overwrite a newer one.

## Honest limitations and what you would add next

- Automated tests (right now: one API smoke test and a manual checklist)
- Refresh tokens / httpOnly cookie sessions, and account lockout
- Multiple admin roles, and an audit log of who changed which status
- Email notification to the user when the status changes, CSV export, an archive/delete action
- Shared rate-limit storage (Redis) if the API ran on more than one instance

## 3-minute demo script

1. Open the live form, submit an inquiry (show validation errors first).
2. Show the new row in Supabase.
3. Try `/admin` logged out (redirect), then a wrong password, then log in.
4. Show stats, filter by category, search a phone number, change a status, open the detail view.
5. Show `schema.sql`, `requireAuth.js` and `inquiryService.js` briefly.
