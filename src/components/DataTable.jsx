import { LoadingState } from './LoadingState.jsx';
import { EmptyState } from './EmptyState.jsx';
import { ErrorState } from './ErrorState.jsx';

/**
 * Generic responsive table. On small screens it becomes horizontally
 * scrollable (spec section 6) rather than overlapping columns.
 * columns: [{ key, header, render?(row) }]
 */
export function DataTable({ columns, rows, loading, error, onRetry, emptyMessage = 'No records found.', rowKey = 'id' }) {
  if (loading) return <LoadingState label="Loading data..." />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows || rows.length === 0) return <EmptyState message={emptyMessage} />;

  return (
    <div className="overflow-x-auto w-full -mx-4 px-4 sm:-mx-6 sm:px-6">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th key={col.key} className="text-left font-semibold text-slate-500 uppercase tracking-wide text-xs py-2.5 px-3 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="py-3 px-3 text-slate-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
