import { STATUS_OPTIONS } from '../../lib/constants.js';
import Spinner from '../ui/Spinner.jsx';

// Dropdown that changes an inquiry's status. The parent does the API call in `onChange`.
export default function StatusSelect({ inquiry, onChange, updating, className = '' }) {
  return (
    <span className="relative inline-flex items-center">
      <select
        value={inquiry.status}
        disabled={updating}
        onChange={(event) => onChange(inquiry, event.target.value)}
        aria-label={`Status for ${inquiry.name}`}
        className={`control-select rounded-lg border border-line bg-white py-1.5 pl-3 text-sm font-medium text-ink hover:border-muted/50 focus:border-brand-600 focus:outline-2 focus:outline-brand-600/30 disabled:cursor-wait disabled:opacity-60 ${className}`}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {updating && <Spinner className="absolute -right-6 h-4 w-4 text-brand-700" />}
    </span>
  );
}
