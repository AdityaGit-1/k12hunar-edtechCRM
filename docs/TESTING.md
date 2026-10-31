# Manual test checklist

Run this before submitting. Start the backend (`npm run dev` in `backend`) and the frontend
(`npm run dev` in `frontend`) first. Tick each box only after you have seen the result yourself.

## 0. Automated API check

```powershell
cd backend
npm run test:api
```

- [ ] Ends with `N passed, 0 failed`

## 1. Public form (http://localhost:5173)

- [ ] Page loads, all six fields are visible, layout is fine on a narrow window (phone size)
- [ ] Clicking **Submit** with an empty form shows an error under every field and focuses the first one
- [ ] Bad email (`abc`) shows "Enter a valid email address"
- [ ] Phone with letters, or fewer than 10 digits, is rejected
- [ ] Message shorter than 10 characters is rejected; the counter shows `n/2000`
- [ ] A valid submission shows "Inquiry received" with a reference code
- [ ] Supabase -> **Table Editor** -> `inquiries` shows the new row, with `status = new`
- [ ] Stop the backend and submit again: a "Cannot reach the server" message appears (form data is kept)

## 2. Admin login (http://localhost:5173/admin/login)

- [ ] Opening `/admin` while logged out redirects to `/admin/login`
- [ ] Empty form shows required messages
- [ ] Wrong password shows "Invalid email or password"
- [ ] Correct login opens the dashboard and shows your name in the header
- [ ] Refreshing the dashboard keeps you logged in
- [ ] **Log out**, then browser Back: you land on the login page, not the dashboard
- [ ] In DevTools -> Application -> Local Storage, delete `hunardesk_token` and refresh `/admin`: redirected to login

## 3. Dashboard

- [ ] Stat cards show the correct totals (compare with the Supabase table)
- [ ] Table shows Name, Phone, Email, User type, Category, Date, Status
- [ ] Category filter, User type filter and Status filter each narrow the table
- [ ] Search by part of a name works; search by part of a phone number works
- [ ] Filters can be combined; **Clear** resets everything
- [ ] A search with no matches shows "No inquiries match your filters"
- [ ] Changing a status shows a green confirmation, and the stat cards update
- [ ] In Supabase, the row's `status` and `updated_at` changed
- [ ] **View** opens the full message; Escape closes it
- [ ] With more than 10 inquiries, Previous/Next work (submit extra inquiries to test)

## 4. Before pushing to GitHub

- [ ] `git status` does not list any `.env` file or `node_modules`
- [ ] `.env.example` files contain placeholders only, no real secrets
