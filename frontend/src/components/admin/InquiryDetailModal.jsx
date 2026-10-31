import { useEffect, useRef } from 'react';
import StatusSelect from './StatusSelect.jsx';
import { CATEGORY_OPTIONS, USER_TYPE_OPTIONS, labelFor } from '../../lib/constants.js';
import { formatDateTime } from '../../lib/format.js';

function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm text-ink">{children}</dd>
    </div>
  );
}

// Shows the full message of one inquiry. Closes with the X button, the Escape key,
// or a click on the dark backdrop.
export default function InquiryDetailModal({ inquiry, updating, onStatusChange, onClose }) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    // Stop the page behind the modal from scrolling.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-detail-title"
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="inquiry-detail-title" className="text-lg font-bold tracking-tight text-ink">
              {inquiry.name}
            </h2>
            <p className="text-sm text-muted">Received {formatDateTime(inquiry.createdAt)}</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-canvas hover:text-ink focus-visible:outline-2 focus-visible:outline-brand-700"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <Detail label="Email">{inquiry.email}</Detail>
          <Detail label="Phone">{inquiry.phone}</Detail>
          <Detail label="User type">{labelFor(USER_TYPE_OPTIONS, inquiry.userType)}</Detail>
          <Detail label="Category">{labelFor(CATEGORY_OPTIONS, inquiry.category)}</Detail>
          <div className="sm:col-span-2">
            <Detail label="Message">
              <p className="whitespace-pre-wrap rounded-lg bg-canvas p-3 leading-relaxed">
                {inquiry.message}
              </p>
            </Detail>
          </div>
        </dl>

        <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
          <span className="text-sm font-medium text-ink">Status</span>
          <StatusSelect inquiry={inquiry} onChange={onStatusChange} updating={updating} />
        </div>
      </div>
    </div>
  );
}
