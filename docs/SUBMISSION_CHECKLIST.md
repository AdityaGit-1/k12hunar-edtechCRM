# Submission checklist

## Assessment requirements -> where they live

| Requirement | Where |
|---|---|
| React + Vite + Tailwind frontend | `frontend/` |
| Node + Express backend, `pg`, Supabase PostgreSQL | `backend/` |
| Public form: user type, category, name, email, phone, message | `frontend/src/components/inquiry/InquiryForm.jsx` -> `POST /api/inquiries` |
| bcrypt hashing | `backend/src/services/authService.js`, `backend/scripts/seedAdmin.js` |
| JWT generation + middleware | `authService.js` (`signToken`, `verifyToken`), `middleware/requireAuth.js` |
| Invalid credentials rejected | `loginAdmin` returns 401 |
| Dashboard not accessible without auth | `frontend/src/components/auth/ProtectedRoute.jsx` + `requireAuth` on every `/api/admin` route |
| Table: name, phone, email, user type, category, date, status | `frontend/src/components/admin/InquiryTable.jsx` |
| Filter by category and user type | `InquiryFilters.jsx` + `buildFilters` in `inquiryService.js` |
| Search by name or phone | same files |
| Update status | `StatusSelect.jsx` -> `PATCH /api/admin/inquiries/:id/status` |
| Dashboard statistics | `StatsCards.jsx` -> `GET /api/admin/inquiries/stats` |
| `schema.sql` | `backend/schema.sql` |
| `.env.example` | `backend/.env.example`, `frontend/.env.example` |
| README with setup + auth testing | `README.md` |
| Live deployment | Vercel (frontend) + Render (backend), see `docs/DEPLOYMENT.md` |

## Final checks

- [ ] `docs/TESTING.md` fully ticked
- [ ] `npm run test:api` ends with `0 failed`
- [ ] `git status` shows no `.env` and no `node_modules`
- [ ] Supabase password and `JWT_SECRET` were never pasted into chat, code or commits
      (if either ever was, reset the Supabase password and generate a new `JWT_SECRET`)
- [ ] Live URLs added to the top of `README.md`
- [ ] Opened the live API `/api/health` once just before sharing, so it is awake
- [ ] GitHub repository is public (or shared with the reviewer) and the link works in a private window
- [ ] Delete test rows: `DELETE FROM inquiries WHERE name = 'Smoke Tester';`
