// Inline error banner. role="alert" makes screen readers announce it when it appears.
export default function Alert({ children, className = '' }) {
  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-lg border border-danger/25 bg-danger-50 px-4 py-3 text-sm text-danger ${className}`}
    >
      <svg
        viewBox="0 0 20 20"
        className="mt-0.5 h-4 w-4 shrink-0"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM9 6h2v5H9V6Zm0 6.5h2v2H9v-2Z"
          clipRule="evenodd"
        />
      </svg>
      <div>{children}</div>
    </div>
  );
}
