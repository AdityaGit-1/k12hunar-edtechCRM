import { STATUS_OPTIONS, labelFor } from '../../lib/constants.js';

const STYLES = {
  new: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  in_progress: 'bg-sky-50 text-sky-800 ring-sky-600/20',
  resolved: 'bg-emerald-50 text-emerald-800 ring-emerald-600/20',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${STYLES[status] ?? ''}`}
    >
      {labelFor(STATUS_OPTIONS, status)}
    </span>
  );
}
