// Dropdown options. The `value` strings must match the values the backend
// accepts (backend/src/constants/inquiry.js and the CHECK constraints in schema.sql).

export const USER_TYPE_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'student', label: 'Student' },
  { value: 'school', label: 'School' },
];

export const CATEGORY_OPTIONS = [
  {
    value: 'scholarship',
    label: 'Scholarship',
    description: 'Eligibility, applications and deadlines',
  },
  {
    value: 'concert',
    label: 'Concert',
    description: 'Performances, participation and event details',
  },
  {
    value: 'admission',
    label: 'Admission',
    description: 'Enrolment, available seats and documents',
  },
  {
    value: 'general_query',
    label: 'General Query',
    description: 'Anything else you would like to ask',
  },
];

// Must match STATUSES in backend/src/constants/inquiry.js.
export const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

// Turns an API value such as "general_query" into its label "General Query".
export function labelFor(options, value) {
  return options.find((option) => option.value === value)?.label ?? value;
}
