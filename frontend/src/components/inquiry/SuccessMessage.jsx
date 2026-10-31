import Button from '../ui/Button.jsx';

// Shown in place of the form after a successful submission.
export default function SuccessMessage({ submission, onReset }) {
  const firstName = submission.name.split(' ')[0];
  const reference = submission.id.slice(0, 8).toUpperCase();

  return (
    <div className="py-6 text-center" role="status">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </div>

      <h2 className="mt-5 text-xl font-bold tracking-tight text-ink">Inquiry received</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        Thank you, {firstName}. Our team will review your message and reach out using the email or
        phone number you shared.
      </p>

      <p className="mt-5 text-sm text-muted">
        Reference{' '}
        <span className="rounded bg-canvas px-2 py-1 font-mono text-xs font-medium text-ink">
          {reference}
        </span>
      </p>

      <Button variant="secondary" onClick={onReset} className="mt-6">
        Submit another inquiry
      </Button>
    </div>
  );
}
