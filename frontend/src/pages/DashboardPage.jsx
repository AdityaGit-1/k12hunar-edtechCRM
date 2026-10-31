import { useCallback, useEffect, useState } from 'react';
import StatsCards from '../components/admin/StatsCards.jsx';
import InquiryFilters from '../components/admin/InquiryFilters.jsx';
import InquiryTable from '../components/admin/InquiryTable.jsx';
import Pagination from '../components/admin/Pagination.jsx';
import InquiryDetailModal from '../components/admin/InquiryDetailModal.jsx';
import Notice from '../components/admin/Notice.jsx';
import Button from '../components/ui/Button.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import useDebounce from '../hooks/useDebounce.js';
import { fetchInquiries, fetchInquiryStats, updateInquiryStatus } from '../api/adminApi.js';
import { STATUS_OPTIONS, labelFor } from '../lib/constants.js';

const PAGE_SIZE = 10;
const NO_FILTERS = { category: '', userType: '', status: '' };

export default function DashboardPage() {
  // Filters the admin picks from dropdowns, plus the current page.
  const [filters, setFilters] = useState(NO_FILTERS);
  const [page, setPage] = useState(1);

  // The search box updates `search` on every keystroke; the API is only called
  // once typing pauses (`debouncedSearch`).
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search.trim(), 400);

  const [list, setList] = useState(null); // { inquiries, pagination }
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [reloadKey, setReloadKey] = useState(0); // bump to force a refetch

  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');

  const [updatingId, setUpdatingId] = useState(null);
  const [selected, setSelected] = useState(null); // inquiry shown in the modal
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    document.title = 'HunarDesk | Dashboard';
  }, []);

  // Load the inquiry list whenever a filter, the search text, or the page changes.
  useEffect(() => {
    let cancelled = false; // ignore answers that arrive after a newer request was made
    setListLoading(true);
    setListError('');

    fetchInquiries({ ...filters, search: debouncedSearch, page, limit: PAGE_SIZE })
      .then((data) => {
        if (!cancelled) setList(data);
      })
      .catch((error) => {
        // A 401 is handled globally (AuthContext logs out and redirects to login).
        if (!cancelled && error.status !== 401) setListError(error.message);
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [filters, debouncedSearch, page, reloadKey]);

  const loadStats = useCallback(() => {
    fetchInquiryStats()
      .then((data) => {
        setStats(data.stats);
        setStatsError('');
      })
      .catch((error) => {
        if (error.status !== 401) setStatsError(error.message);
      });
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Changing a filter always goes back to page 1.
  function handleFilterChange(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function handleSearchChange(value) {
    setSearch(value);
    setPage(1);
  }

  function handleClear() {
    setFilters(NO_FILTERS);
    setSearch('');
    setPage(1);
  }

  async function handleStatusChange(inquiry, newStatus) {
    if (newStatus === inquiry.status) return;

    setUpdatingId(inquiry.id);
    try {
      const { inquiry: updated } = await updateInquiryStatus(inquiry.id, newStatus);

      // Update the row in place, and the modal if it is showing this inquiry.
      setList((current) =>
        current
          ? {
              ...current,
              inquiries: current.inquiries.map((item) => (item.id === updated.id ? updated : item)),
            }
          : current
      );
      setSelected((current) => (current?.id === updated.id ? updated : current));

      loadStats(); // the counters changed
      // With a status filter on, the row may no longer belong in the list: reload it.
      if (filters.status) setReloadKey((key) => key + 1);

      setNotice({
        type: 'success',
        message: `${updated.name} marked as ${labelFor(STATUS_OPTIONS, updated.status)}.`,
      });
    } catch (error) {
      if (error.status !== 401) {
        setNotice({ type: 'error', message: `Could not update status: ${error.message}` });
      }
    } finally {
      setUpdatingId(null);
    }
  }

  const closeModal = useCallback(() => setSelected(null), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const inquiries = list?.inquiries ?? [];
  const hasFilters = Boolean(debouncedSearch || filters.category || filters.userType || filters.status);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Inquiries</h1>
        <p className="mt-1 text-sm text-muted">
          Review incoming inquiries, search and filter them, and update their status.
        </p>
      </div>

      <Notice notice={notice} onDismiss={dismissNotice} />

      <StatsCards stats={stats} error={statsError} />

      <InquiryFilters
        filters={filters}
        search={search}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onClear={handleClear}
      />

      <section
        aria-label="Inquiry list"
        aria-busy={listLoading}
        className="overflow-hidden rounded-xl border border-line bg-white shadow-sm"
      >
        {listError ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-semibold text-danger">Could not load inquiries</p>
            <p className="mt-1 text-sm text-muted">{listError}</p>
            <Button variant="secondary" className="mt-5" onClick={() => setReloadKey((key) => key + 1)}>
              Try again
            </Button>
          </div>
        ) : !list ? (
          <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted" role="status">
            <Spinner className="h-5 w-5 text-brand-700" />
            Loading inquiries...
          </div>
        ) : inquiries.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-semibold text-ink">
              {hasFilters ? 'No inquiries match your filters' : 'No inquiries yet'}
            </p>
            <p className="mt-1 text-sm text-muted">
              {hasFilters
                ? 'Try a different search or clear the filters.'
                : 'New submissions from the public form will appear here.'}
            </p>
            {hasFilters && (
              <Button variant="secondary" className="mt-5" onClick={handleClear}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className={listLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
            <InquiryTable
              inquiries={inquiries}
              updatingId={updatingId}
              onStatusChange={handleStatusChange}
              onView={setSelected}
            />
            <Pagination pagination={list.pagination} onPageChange={setPage} disabled={listLoading} />
          </div>
        )}
      </section>

      {selected && (
        <InquiryDetailModal
          inquiry={selected}
          updating={updatingId === selected.id}
          onStatusChange={handleStatusChange}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
