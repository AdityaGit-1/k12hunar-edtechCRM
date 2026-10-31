# HunarDesk - EdTech CRM & Inquiry Management System

HunarDesk lets parents, students and schools send inquiries to an education organisation
(K12 Hunar), and lets an admin log in to review, search, filter and manage them.

- **Public inquiry form**: User Type, Category, Name, Email, Phone and Message, saved in Supabase PostgreSQL through the Express API.
- **Secure admin login**: passwords hashed with **bcrypt**, sessions with **JWT** (no Supabase Auth).
- **Protected dashboard**: statistics, filters (category, user type, status), search by name or phone, pagination, and status updates.

**Live demo:** `https://YOUR-APP.vercel.app` &nbsp;|&nbsp; **API:** `https://YOUR-API.onrender.com/api/health`
*(replace with your real links after deployment, see `docs/DEPLOYMENT.md`)*

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4, React Router |
| Backend | Node.js (ES modules), Express 5 |
| Database | PostgreSQL hosted on Supabase, accessed with the `pg` package |
| Auth | bcrypt (password hashing) + JSON Web Tokens (Bearer token) |
| Validation | Zod on the backend, matching rules on the frontend |
| Security extras | Helmet, CORS allow-list, rate limiting, parameterised SQL |

## Project structure

```text
hunardesk/
├── backend/
│   ├── schema.sql              Database tables, constraints, indexes
│   ├── .env.example            Template for backend/.env
│   ├── API.md                  Endpoint reference
│   ├── scripts/
│   │   ├── seedAdmin.js        Creates the first admin account
│   │   └── smokeTest.js        End-to-end API test (npm run test:api)
│   └── src/
│       ├── config/             env validation (Zod) and the pg connection pool
│       ├── constants/          Allowed user types, categories, statuses
│       ├── controllers/        Thin request handlers
│       ├── middleware/         requireAuth (JWT), validate, rate limiters, error handler
│       ├── routes/             URL to controller wiring
│       ├── services/           SQL queries and business logic
│       ├── validators/         Zod schemas
│       ├── utils/              AppError, snake_case to camelCase formatters
│       ├── app.js              Express app
│       └── server.js           Startup (checks the database first)
├── frontend/
│   ├── .env.example            Template for frontend/.env
│   ├── vercel.json             Single-page-app routing for Vercel
│   └── src/
│       ├── api/                fetch wrapper + endpoint functions
│       ├── context/            AuthContext (login state)
│       ├── components/         ui/, inquiry/, admin/, auth/, layout/
│       ├── hooks/              useDebounce
│       ├── lib/                constants, validators, formatters, token storage
│       └── pages/              InquiryPage, LoginPage, DashboardPage, NotFoundPage
├── docs/
│   ├── TESTING.md              Manual test checklist
│   ├── DEPLOYMENT.md           Render + Vercel steps
│   └── INTERVIEW_NOTES.md      Design decisions and likely questions
└── render.yaml                 Render blueprint for the backend
```

## Setup (local)

You need **Node.js 20 or newer** and a free **Supabase** project.

### 1. Create the database tables

1. Supabase Dashboard -> **SQL Editor** -> **New query**.
2. Paste the contents of `backend/schema.sql` and click **Run**. It is safe to run twice.

This creates the `admins` and `inquiries` tables. Row Level Security is enabled with no policies,
so the tables cannot be read through Supabase's public REST API; only the Express backend can reach them.

### 2. Configure the backend

```powershell
cd backend
copy .env.example .env
```

Open `backend/.env` and fill in:

| Variable | What to put |
|---|---|
| `DATABASE_URL` | Supabase -> **Connect** -> **Session pooler** URI. The username looks like `postgres.<project-ref>`. Replace `[YOUR-PASSWORD]` with your database password (URL-encode special characters such as `@` as `%40`). |
| `JWT_SECRET` | A random string of 32+ characters. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Credentials for the first admin (password 8-72 characters). |
| `CLIENT_URL` | `http://localhost:5173` locally. Comma-separate several origins if needed. |

`.env` is listed in `.gitignore` and must never be committed.

### 3. Install, create the admin, start the API

```powershell
npm install
npm run seed:admin
npm run dev
```

You should see `Connected to PostgreSQL` and `HunarDesk API running on port 5000`.
Check it: open <http://localhost:5000/api/health>.

### 4. Start the frontend (second terminal)

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev
```

Open <http://localhost:5173>. The admin dashboard is at <http://localhost:5173/admin>.

## Authentication

- `POST /api/auth/login` checks the email and password (bcrypt compare) and returns a signed JWT (HS256, default expiry 8h).
- The frontend stores the token in `localStorage` and sends `Authorization: Bearer <token>` on every protected request.
- `requireAuth` middleware verifies the signature and expiry, and checks that the admin still exists. Missing, invalid or expired tokens get `401`.
- On page load the frontend calls `GET /api/auth/me`; a bad token sends the admin back to the login page. Logging out deletes the token.
- Wrong email and wrong password return the same message (`Invalid email or password`), and bcrypt runs in both cases so response time does not reveal which emails are admins.
- There is no public sign-up route. Admins are created with `npm run seed:admin`.

### Testing authentication

**Automated** (backend must be running):

```powershell
cd backend
npm run test:api
```

It submits an inquiry, then checks wrong passwords, missing tokens, invalid tokens, login, filters, search, stats and status updates against the real database.

**By hand in PowerShell** (replace the email and password with your admin's):

```powershell
# 1. Protected route without a token -> 401
Invoke-RestMethod http://localhost:5000/api/admin/inquiries

# 2. Wrong password -> 401 "Invalid email or password"
Invoke-RestMethod -Method Post http://localhost:5000/api/auth/login -ContentType "application/json" -Body '{"email":"admin@example.com","password":"wrong-password"}'

# 3. Correct login -> returns a token
$login = Invoke-RestMethod -Method Post http://localhost:5000/api/auth/login -ContentType "application/json" -Body '{"email":"admin@example.com","password":"YOUR-ADMIN-PASSWORD"}'
$token = $login.data.token

# 4. Protected route with the token -> inquiries
Invoke-RestMethod http://localhost:5000/api/admin/inquiries -Headers @{ Authorization = "Bearer $token" }
```

`Invoke-RestMethod` throws an error for 401 responses; that error is the expected result for steps 1 and 2.

**In the browser:** open `/admin` while logged out (you are redirected to `/admin/login`), try a wrong password (error shown), then log in (dashboard opens), then click **Log out** and press the browser's Back button (you are sent to login again).

## API summary

Full details are in [`backend/API.md`](backend/API.md).

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | no | Service status |
| POST | `/api/inquiries` | no | Submit an inquiry |
| POST | `/api/auth/login` | no | Admin login |
| GET | `/api/auth/me` | Bearer | Current admin |
| GET | `/api/admin/inquiries` | Bearer | List with `page`, `limit`, `category`, `userType`, `status`, `search` |
| GET | `/api/admin/inquiries/stats` | Bearer | Dashboard counts |
| GET | `/api/admin/inquiries/:id` | Bearer | One inquiry |
| PATCH | `/api/admin/inquiries/:id/status` | Bearer | Set `new`, `in_progress` or `resolved` |

## Security decisions

- **SQL injection:** every query uses `$1, $2...` parameters; the `LIKE` search escapes `%` and `_`.
- **Validation twice:** the form validates for instant feedback, the API validates again with Zod, and the database has `CHECK` constraints.
- **Secrets:** read only from environment variables, validated at startup; `.env` is git-ignored.
- **Rate limiting:** 10 submissions per 15 minutes per visitor, and 10 failed logins per 15 minutes.
- **Headers and CORS:** Helmet, and only origins listed in `CLIENT_URL` may call the API from a browser.
- **Errors:** the same JSON shape everywhere; internal error details are hidden in production.

## Troubleshooting

| Problem | Likely cause and fix |
|---|---|
| `password authentication failed for user "postgres"` | Wrong password, or a Direct-connection URI. Use the **Session pooler** URI (username `postgres.<project-ref>`). Reset the password in Supabase -> Project Settings -> Database if unsure. |
| `Invalid environment configuration` on start | A variable in `backend/.env` is missing or too short (for example `JWT_SECRET` under 32 characters). The message names it. |
| Browser shows "Cannot reach the server" | Backend is not running, or `VITE_API_URL` is wrong. Restart the frontend after editing `frontend/.env`. |
| CORS error in the browser console | `CLIENT_URL` in the backend does not match the frontend's address exactly (no trailing slash). |
| `Too many ... attempts` (429) | Rate limit hit. Wait 15 minutes or restart the backend (limits are stored in memory). |
| Login says invalid credentials | Run `npm run seed:admin` again; it resets the password to the value in `.env`. |
