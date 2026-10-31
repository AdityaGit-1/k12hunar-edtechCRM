// The database uses snake_case columns; the API returns camelCase JSON.
// These functions are the single place where that conversion happens.

export function toInquiryDto(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    userType: row.user_type,
    category: row.category,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// password_hash is deliberately not included.
export function toAdminDto(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
  };
}
