import { useEffect } from 'react';
import Alert from '../ui/Alert.jsx';

// Message banner at the top of the dashboard. Success messages fade away after 3 seconds;
// errors stay until dismissed. `notice` is { type: 'success' | 'error', message } or null.
export default function Notice({ notice, onDismiss }) {
  useEffect(() => {
    if (notice?.type !== 'success') return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [notice, onDismiss]);

  if (!notice) return null;

  if (notice.type === 'error') {
    return (
      <div className="flex items-start gap-2">
        <Alert className="flex-1">{notice.message}</Alert>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-lg px-3 py-3 text-sm font-semibold text-muted hover:text-ink"
        >
          Dismiss
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      className="rounded-lg border border-emerald-600/25 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      {notice.message}
    </div>
  );
}
