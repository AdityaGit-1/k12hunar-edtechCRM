import { CATEGORY_OPTIONS, USER_TYPE_OPTIONS, labelFor } from '../../lib/constants.js';

function StatCard({ label, value, tone = 'text-ink' }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-2 text-3xl font-bold tracking-tight ${tone}`}>{value}</p>
    </div>
  );
}

// A small list of "label ... count" rows with a bar showing the share of the total.
function Breakdown({ title, counts, options, total }) {
  return (
    <div className="rounded-xl border border-line bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2.5">
        {Object.entries(counts).map(([value, count]) => (
          <li key={value}>
            <div className="flex justify-between text-sm">
              <span className="text-muted">{labelFor(options, value)}</span>
              <span className="font-semibold text-ink">{count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-canvas" aria-hidden="true">
              <div
                className="h-1.5 rounded-full bg-brand-600"
                style={{ width: total ? `${(count / total) * 100}%` : '0%' }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// `stats` is the object from GET /api/admin/inquiries/stats, or null while loading.
export default function StatsCards({ stats, loading, error }) {
  if (error) {
    return (
      <p className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-muted">
        Could not load statistics: {error}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="grid animate-pulse gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-busy={loading}>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="h-24 rounded-xl border border-line bg-white" />
        ))}
      </div>
    );
  }

  return (
    <section aria-label="Dashboard statistics" className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total inquiries" value={stats.total} />
        <StatCard label="Last 7 days" value={stats.last7Days} />
        <StatCard label="New" value={stats.byStatus.new} tone="text-amber-700" />
        <StatCard label="In progress" value={stats.byStatus.in_progress} tone="text-sky-700" />
        <StatCard label="Resolved" value={stats.byStatus.resolved} tone="text-emerald-700" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Breakdown title="By category" counts={stats.byCategory} options={CATEGORY_OPTIONS} total={stats.total} />
        <Breakdown title="By user type" counts={stats.byUserType} options={USER_TYPE_OPTIONS} total={stats.total} />
      </div>
    </section>
  );
}
