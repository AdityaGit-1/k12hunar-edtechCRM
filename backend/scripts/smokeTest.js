// End-to-end check of the running API. It talks to the real server (and therefore the
// real database), so START THE BACKEND FIRST (npm run dev in another terminal).
//
// Usage (from the backend folder):
//   npm run test:api
//
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from backend/.env (the same ones used by
// "npm run seed:admin"). Override the server address with API_URL if needed.
//
// It creates ONE inquiry named "Smoke Tester" each run. Delete the leftovers with:
//   DELETE FROM inquiries WHERE name = 'Smoke Tester';   (Supabase SQL Editor)

import 'dotenv/config';

const API_URL = (process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 5000}`).replace(/\/+$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${name}${detail ? `  -> ${detail}` : ''}`);
  }
}

async function call(method, path, { body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try {
    json = await response.json();
  } catch {
    json = null;
  }
  return { status: response.status, json };
}

function section(title) {
  console.log(`\n${title}`);
}

async function run() {
  console.log(`HunarDesk API smoke test against ${API_URL}`);

  // ---------- health ----------
  section('Health');
  let health;
  try {
    health = await call('GET', '/api/health');
  } catch (error) {
    console.error(`\nCannot reach ${API_URL}: ${error.message}`);
    console.error('Start the backend first (npm run dev) and try again.');
    process.exit(1);
  }
  check('GET /api/health returns 200', health.status === 200 && health.json?.success === true);

  // ---------- public inquiry form ----------
  section('Public inquiry submission');
  const empty = await call('POST', '/api/inquiries', { body: {} });
  check('empty body is rejected with 400', empty.status === 400, `got ${empty.status}`);
  check('400 response lists field errors', Array.isArray(empty.json?.errors) && empty.json.errors.length > 0);

  const badCategory = await call('POST', '/api/inquiries', {
    body: {
      userType: 'parent',
      category: 'not_a_category',
      name: 'Smoke Tester',
      email: 'smoke@example.com',
      phone: '+91 98765 43210',
      message: 'This category does not exist.',
    },
  });
  check('invalid category is rejected with 400', badCategory.status === 400, `got ${badCategory.status}`);

  const created = await call('POST', '/api/inquiries', {
    body: {
      userType: 'student',
      category: 'concert',
      name: 'Smoke Tester',
      email: 'Smoke.Tester@Example.com',
      phone: '+91 98765 43210',
      message: `Automated smoke test inquiry created at ${new Date().toISOString()}.`,
    },
  });
  check('valid inquiry returns 201', created.status === 201, `got ${created.status}: ${created.json?.message}`);
  const inquiryId = created.json?.data?.id;
  check('response contains the new inquiry id (UUID)', UUID.test(inquiryId ?? ''));

  // ---------- authentication ----------
  section('Authentication');
  const noToken = await call('GET', '/api/admin/inquiries');
  check('protected route without token -> 401', noToken.status === 401, `got ${noToken.status}`);

  const garbage = await call('GET', '/api/admin/inquiries', { token: 'not.a.real.token' });
  check('protected route with invalid token -> 401', garbage.status === 401, `got ${garbage.status}`);

  const wrongPassword = await call('POST', '/api/auth/login', {
    body: { email: ADMIN_EMAIL ?? 'admin@example.com', password: 'definitely-the-wrong-password' },
  });
  check('wrong password -> 401', wrongPassword.status === 401, `got ${wrongPassword.status}`);
  check(
    'wrong password message is generic',
    wrongPassword.json?.message === 'Invalid email or password',
    wrongPassword.json?.message
  );

  const unknownEmail = await call('POST', '/api/auth/login', {
    body: { email: 'nobody-here@example.com', password: 'whatever-password' },
  });
  check('unknown email -> 401', unknownEmail.status === 401, `got ${unknownEmail.status}`);

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('\nADMIN_EMAIL / ADMIN_PASSWORD are not set in backend/.env, so the admin tests are skipped.');
    return;
  }

  const login = await call('POST', '/api/auth/login', { body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD } });
  check('login with correct credentials -> 200', login.status === 200, `got ${login.status}: ${login.json?.message}`);
  const token = login.json?.data?.token;
  check('login returns a JWT (3 dot-separated parts)', typeof token === 'string' && token.split('.').length === 3);
  check('login response does not leak password_hash', !JSON.stringify(login.json).includes('password_hash'));

  if (!token) {
    console.log('\nNo token, so the remaining admin tests are skipped. Did you run "npm run seed:admin"?');
    return;
  }

  const me = await call('GET', '/api/auth/me', { token });
  check('GET /api/auth/me returns the admin', me.status === 200 && me.json?.data?.admin?.email === ADMIN_EMAIL.toLowerCase());

  // ---------- dashboard data ----------
  section('Admin: list, filter, search');
  const list = await call('GET', '/api/admin/inquiries?limit=50&search=Smoke%20Tester', { token });
  check('list inquiries -> 200', list.status === 200, `got ${list.status}`);
  const found = list.json?.data?.inquiries?.find((item) => item.id === inquiryId);
  check('new inquiry appears in the list (saved in the database)', Boolean(found));
  check('email was stored lowercase', found?.email === 'smoke.tester@example.com', found?.email);
  check('list has pagination info', typeof list.json?.data?.pagination?.total === 'number');

  const filtered = await call('GET', '/api/admin/inquiries?category=concert&userType=student&limit=50', { token });
  const filteredRows = filtered.json?.data?.inquiries ?? [];
  check(
    'category + user type filters only return matching rows',
    filtered.status === 200 && filteredRows.length > 0 &&
      filteredRows.every((item) => item.category === 'concert' && item.userType === 'student')
  );

  const byPhone = await call('GET', '/api/admin/inquiries?search=9876543210&limit=50', { token });
  check(
    'search by phone digits finds the inquiry',
    Boolean(byPhone.json?.data?.inquiries?.some((item) => item.id === inquiryId))
  );

  const badFilter = await call('GET', '/api/admin/inquiries?category=nope', { token });
  check('invalid filter value -> 400', badFilter.status === 400, `got ${badFilter.status}`);

  section('Admin: statistics');
  const stats = await call('GET', '/api/admin/inquiries/stats', { token });
  const s = stats.json?.data?.stats;
  check('stats -> 200', stats.status === 200, `got ${stats.status}`);
  check('stats include total, last7Days and breakdowns', Boolean(s) && s.total >= 1 && typeof s.last7Days === 'number' && s.byStatus && s.byCategory && s.byUserType);

  section('Admin: single inquiry and status update');
  const single = await call('GET', `/api/admin/inquiries/${inquiryId}`, { token });
  check('GET inquiry by id -> 200', single.status === 200 && single.json?.data?.inquiry?.id === inquiryId);
  check('new inquiries start as "new"', single.json?.data?.inquiry?.status === 'new', single.json?.data?.inquiry?.status);

  const notUuid = await call('GET', '/api/admin/inquiries/123', { token });
  check('non-UUID id -> 400', notUuid.status === 400, `got ${notUuid.status}`);

  const missing = await call('GET', '/api/admin/inquiries/00000000-0000-4000-8000-000000000000', { token });
  check('unknown id -> 404', missing.status === 404, `got ${missing.status}`);

  const invalidStatus = await call('PATCH', `/api/admin/inquiries/${inquiryId}/status`, { token, body: { status: 'done' } });
  check('invalid status value -> 400', invalidStatus.status === 400, `got ${invalidStatus.status}`);

  const noAuthPatch = await call('PATCH', `/api/admin/inquiries/${inquiryId}/status`, { body: { status: 'resolved' } });
  check('status update without token -> 401', noAuthPatch.status === 401, `got ${noAuthPatch.status}`);

  const updated = await call('PATCH', `/api/admin/inquiries/${inquiryId}/status`, { token, body: { status: 'in_progress' } });
  check('status update -> 200 with new status', updated.status === 200 && updated.json?.data?.inquiry?.status === 'in_progress', `got ${updated.status}`);

  const reread = await call('GET', `/api/admin/inquiries/${inquiryId}`, { token });
  check('new status is persisted in the database', reread.json?.data?.inquiry?.status === 'in_progress');

  console.log(`\nTest inquiry id: ${inquiryId} (name "Smoke Tester")`);
}

run()
  .catch((error) => {
    failed += 1;
    console.error('\nUnexpected error:', error);
  })
  .finally(() => {
    console.log(`\n${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
  });
