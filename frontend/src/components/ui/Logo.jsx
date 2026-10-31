export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#0f5a51" />
        <path
          d="M10 8v16M22 8v16M10 16h12"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="22" cy="8" r="2.2" fill="#e0922f" />
      </svg>
      <span className="text-lg font-bold tracking-tight text-ink">HunarDesk</span>
    </span>
  );
}
