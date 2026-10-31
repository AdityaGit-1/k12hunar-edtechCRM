import { query } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { toInquiryDto } from '../utils/formatters.js';
import { USER_TYPES, CATEGORIES, STATUSES } from '../constants/inquiry.js';

const INQUIRY_COLUMNS =
  'id, name, email, phone, user_type, category, message, status, created_at, updated_at';

// A search made only of digits, spaces, +, - and brackets looks like a phone number.
const LOOKS_LIKE_PHONE = /^[\d\s+\-()]+$/;

// % and _ are wildcards in LIKE. Escape them (and the escape character itself)
// so that a search for "50%" matches the text "50%" and nothing else.
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function createInquiry({ userType, category, name, email, phone, message }) {
  const { rows } = await query(
    `INSERT INTO inquiries (user_type, category, name, email, phone, message)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING ${INQUIRY_COLUMNS}`,
    [userType, category, name, email, phone, message]
  );
  return toInquiryDto(rows[0]);
}

// Builds the WHERE clause for the dashboard filters.
// Values are always passed as $n parameters; only fixed SQL text is concatenated.
function buildFilters({ category, userType, status, search }) {
  const conditions = [];
  const params = [];

  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (category) conditions.push(`category = ${addParam(category)}`);
  if (userType) conditions.push(`user_type = ${addParam(userType)}`);
  if (status) conditions.push(`status = ${addParam(status)}`);

  if (search) {
    const matches = [];
    const textPattern = addParam(`%${escapeLike(search)}%`);
    matches.push(`name ILIKE ${textPattern}`, `phone ILIKE ${textPattern}`);

    // Phones are stored as typed ("+91 98765-43210"). For phone-like searches
    // also compare digits only, so "9876543210" still finds that record.
    if (LOOKS_LIKE_PHONE.test(search)) {
      const digits = search.replace(/\D/g, '');
      if (digits) {
        matches.push(`regexp_replace(phone, '\\D', '', 'g') LIKE ${addParam(`%${digits}%`)}`);
      }
    }

    conditions.push(`(${matches.join(' OR ')})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

export async function listInquiries({ page, limit, ...filters }) {
  const { where, params } = buildFilters(filters);
  const offset = (page - 1) * limit;

  const [countResult, rowsResult] = await Promise.all([
    query(`SELECT COUNT(*)::int AS total FROM inquiries ${where}`, params),
    query(
      `SELECT ${INQUIRY_COLUMNS}
       FROM inquiries
       ${where}
       ORDER BY created_at DESC, id
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    ),
  ]);

  const total = countResult.rows[0].total;

  return {
    inquiries: rowsResult.rows.map(toInquiryDto),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

// Counts rows per value of one column, with 0 for values that have no rows yet.
// `column` is always a fixed string from this file, never request input.
async function countBy(column, allowedValues) {
  const { rows } = await query(
    `SELECT ${column} AS value, COUNT(*)::int AS count FROM inquiries GROUP BY ${column}`
  );
  const counts = Object.fromEntries(allowedValues.map((value) => [value, 0]));
  for (const row of rows) {
    counts[row.value] = row.count;
  }
  return counts;
}

export async function getInquiryStats() {
  const [totals, byStatus, byCategory, byUserType] = await Promise.all([
    query(
      `SELECT
         COUNT(*)::int AS total,
         COUNT(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS last_7_days
       FROM inquiries`
    ),
    countBy('status', STATUSES),
    countBy('category', CATEGORIES),
    countBy('user_type', USER_TYPES),
  ]);

  return {
    total: totals.rows[0].total,
    last7Days: totals.rows[0].last_7_days,
    byStatus,
    byCategory,
    byUserType,
  };
}

export async function getInquiryById(id) {
  const { rows } = await query(`SELECT ${INQUIRY_COLUMNS} FROM inquiries WHERE id = $1`, [id]);

  if (rows.length === 0) {
    throw new AppError('Inquiry not found', 404);
  }
  return toInquiryDto(rows[0]);
}

export async function updateInquiryStatus(id, status) {
  const { rows } = await query(
    `UPDATE inquiries
     SET status = $1, updated_at = now()
     WHERE id = $2
     RETURNING ${INQUIRY_COLUMNS}`,
    [status, id]
  );

  if (rows.length === 0) {
    throw new AppError('Inquiry not found', 404);
  }
  return toInquiryDto(rows[0]);
}
