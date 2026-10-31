import Button from '../ui/Button.jsx';

// `pagination` is { page, limit, total, totalPages } from the API.
export default function Pagination({ pagination, onPageChange, disabled }) {
  const { page, limit, total, totalPages } = pagination;
  const first = total === 0 ? 0 : (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row"
    >
      <p className="text-sm text-muted">
        Showing <span className="font-semibold text-ink">{first}</span> to{' '}
        <span className="font-semibold text-ink">{last}</span> of{' '}
        <span className="font-semibold text-ink">{total}</span> inquiries
      </p>
      <div className="flex items-center gap-3">
        <Button
          variant="secondary"
          className="px-4 py-2"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          className="px-4 py-2"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </nav>
  );
}
