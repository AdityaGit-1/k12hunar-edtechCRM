import StatusBadge from './StatusBadge.jsx';
import StatusSelect from './StatusSelect.jsx';
import { CATEGORY_OPTIONS, USER_TYPE_OPTIONS, labelFor } from '../../lib/constants.js';
import { formatDate, formatDateTime } from '../../lib/format.js';

const HEADERS = ['Name', 'Phone', 'Email', 'User type', 'Category', 'Date', 'Status', ''];

// Shows one page of inquiries. Wide tables scroll sideways inside their own box on phones.
export default function InquiryTable({ inquiries, updatingId, onStatusChange, onView }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line text-left text-sm">
        <thead className="bg-canvas">
          <tr>
            {HEADERS.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted"
              >
                {header || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {inquiries.map((inquiry) => (
            <tr key={inquiry.id} className="hover:bg-canvas/60">
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">{inquiry.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">{inquiry.phone}</td>
              <td className="px-4 py-3 text-muted">{inquiry.email}</td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">
                {labelFor(USER_TYPE_OPTIONS, inquiry.userType)}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink">
                {labelFor(CATEGORY_OPTIONS, inquiry.category)}
              </td>
              <td
                className="whitespace-nowrap px-4 py-3 text-muted"
                title={formatDateTime(inquiry.createdAt)}
              >
                {formatDate(inquiry.createdAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-3">
                  <StatusBadge status={inquiry.status} />
                </div>
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <div className="flex items-center gap-8">
                  <StatusSelect
                    inquiry={inquiry}
                    onChange={onStatusChange}
                    updating={updatingId === inquiry.id}
                  />
                  <button
                    type="button"
                    onClick={() => onView(inquiry)}
                    className="text-sm font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                  >
                    View
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
