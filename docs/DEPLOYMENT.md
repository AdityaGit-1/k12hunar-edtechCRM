# Deployment guide (Supabase + Render + Vercel)

Order matters: **database (already done) -> backend on Render -> frontend on Vercel -> connect them with CORS.**

| Part | Platform | Why |
|---|---|---|
| Database | Supabase | Hosted PostgreSQL (already created) |
| Backend (Express) | Render | Runs a long-lived Node server |
| Frontend (React) | Vercel | Static hosting for the Vite build |

Before you start, make sure `npm run seed:admin` already worked locally. Local and deployed apps use
the **same Supabase database**, so the admin you created is also the admin of the live site.

## 1. Push the project to GitHub

Open a terminal in the project root (the folder that contains `backend` and `frontend`):

```powershell
git init
git add .
git status
```

Read the `git status` list. It must **not** contain `.env` or `node_modules`. If it does, stop and
check that `.gitignore` is in the project root. Then:

```powershell
git commit -m "HunarDesk: inquiry form, admin auth and dashboard"
git branch -M main
```

Create an empty repository on github.com (no README), then:

```powershell
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 2. Deploy the backend on Render

1. render.com -> sign up with GitHub -> **New** -> **Blueprint** -> select your repository.
   Render reads `render.yaml` and proposes the `hunardesk-api` service.
2. When asked for the secret values, enter:
   - `DATABASE_URL`: your Supabase **Session pooler** URI (same value as in `backend/.env`).
   - `CLIENT_URL`: put `http://localhost:5173` for now. You change it in step 4.
3. Click **Apply**. Wait for the deploy to finish (a few minutes). The log should show
   `Connected to PostgreSQL` and `HunarDesk API running`.
4. Open `https://YOUR-SERVICE.onrender.com/api/health` in the browser. You should see `"status":"ok"`.

Manual alternative (without the blueprint): **New -> Web Service**, Root Directory `backend`,
Build Command `npm install`, Start Command `npm start`, Health Check Path `/api/health`,
and add the same environment variables as in `render.yaml` (`JWT_SECRET` must be 32+ random characters).

## 3. Deploy the frontend on Vercel

1. vercel.com -> sign up with GitHub -> **Add New -> Project** -> import the repository.
2. Set **Root Directory** to `frontend`. Framework Preset should be detected as **Vite**.
3. Under **Environment Variables** add:
   - `VITE_API_URL` = `https://YOUR-SERVICE.onrender.com` (your Render URL, **no trailing slash**)
4. Click **Deploy**. Vite reads `VITE_API_URL` while building, so if you change it later you must **redeploy**.
5. `frontend/vercel.json` makes paths like `/admin` and `/admin/login` work when opened directly or refreshed.

## 4. Allow the frontend in the backend's CORS list

1. Copy your Vercel address, for example `https://hunardesk.vercel.app` (no trailing slash).
2. Render -> your service -> **Environment** -> set `CLIENT_URL` to that address.
   To keep local development working too, use a comma-separated list:
   `https://hunardesk.vercel.app,http://localhost:5173`
3. Save. Render restarts the service automatically.

## 5. Test the live site

- [ ] Submit an inquiry on the live form; the row appears in Supabase
- [ ] `/admin` while logged out redirects to login; wrong password is rejected
- [ ] Log in, see the dashboard, filter, search, and change a status
- [ ] Refresh `/admin` directly (tests `vercel.json`)

Then put the two live URLs at the top of `README.md` and push again.

## Good to know

- **Cold starts:** on Render's free plan the API usually goes to sleep after about 15 minutes without traffic,
  and the first request afterwards can take around a minute. Open `/api/health` a minute before a demo.
  (Check Render's current free-plan limits, as they can change.)
- **Vercel preview URLs** (the ones for branches) are different origins. They will not pass CORS unless added to `CLIENT_URL`.
- **Rate limits** are stored in memory, so they reset whenever the service restarts. That is fine for one instance.
- **Never** put `DATABASE_URL`, `JWT_SECRET` or admin passwords in the repository. Only in the Render dashboard.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Render deploy fails with `Invalid environment configuration` | The log names the missing variable. Add it in Render -> Environment. |
| Render log: `Could not connect to the database` | `DATABASE_URL` is wrong. Use the Session pooler URI with your current password. |
| Live site: "Cannot reach the server" | `VITE_API_URL` wrong or missing (redeploy Vercel after fixing), or the API is waking up. |
| Browser console: CORS error | `CLIENT_URL` on Render does not exactly equal the Vercel origin. |
| `/admin` shows a Vercel 404 on refresh | `frontend/vercel.json` is missing or Root Directory is not `frontend`. |
| Login fails on the live site only | Run `npm run seed:admin` locally again (it writes to the same Supabase database). |
