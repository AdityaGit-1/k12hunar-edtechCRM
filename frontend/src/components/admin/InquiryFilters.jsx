import { CATEGORY_OPTIONS, USER_TYPE_OPTIONS, STATUS_OPTIONS } from '../../lib/constants.js';
import Button from '../ui/Button.jsx';

function FilterSelect({ id, label, value, onChange, options, allLabel }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="control-select block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink hover:border-muted/50 focus:border-brand-600 focus:outline-2 focus:outline-brand-600/30"
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Controlled by DashboardPage. `search` is the text in the box (the page debounces it).
export default function InquiryFilters({ filters, search, onSearchChange, onFilterChange, onClear }) {
  const hasActiveFilters = Boolean(
    search || filters.category || filters.userType || filters.status
  );

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      role="search"
      className="grid gap-4 rounded-xl border border-line bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto] lg:items-end"
    >
      <div className="sm:col-span-2 lg:col-span-1">
        <label htmlFor="filter-search" className="mb-1 block text-xs font-semibold text-muted">
          Search by name or phone
        </label>
        <input
          id="filter-search"
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="e.g. Asha or 98765"
          maxLength={100}
          className="block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink placeholder:text-muted/70 hover:border-muted/50 focus:border-brand-600 focus:outline-2 focus:outline-brand-600/30"
        />
      </div>

      <FilterSelect
        id="filter-category"
        label="Category"
        value={filters.category}
        onChange={(value) => onFilterChange('category', value)}
        options={CATEGORY_OPTIONS}
        allLabel="All categories"
      />
      <FilterSelect
        id="filter-user-type"
        label="User type"
        value={filters.userType}
        onChange={(value) => onFilterChange('userType', value)}
        options={USER_TYPE_OPTIONS}
        allLabel="All user types"
      />
      <FilterSelect
        id="filter-status"
        label="Status"
        value={filters.status}
        onChange={(value) => onFilterChange('status', value)}
        options={STATUS_OPTIONS}
        allLabel="All statuses"
      />

      <Button
        type="button"
        variant="secondary"
        onClick={onClear}
        disabled={!hasActiveFilters}
        className="py-2"
      >
        Clear
      </Button>
    </form>
  );
}
