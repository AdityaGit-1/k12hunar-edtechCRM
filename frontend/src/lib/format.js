const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

export function formatDate(isoString) {
  return dateFormatter.format(new Date(isoString));
}

export function formatDateTime(isoString) {
  return dateTimeFormatter.format(new Date(isoString));
}
