import { LoadingState } from './LoadingState.jsx';
import { EmptyState } from './EmptyState.jsx';
import { ErrorState } from './ErrorState.jsx';

/**
 * Responsive table. Fits all columns neatly on laptop/computer screens
 * while maintaining smooth readability without forcing horizontal column scrolling.
 * columns: [{ key, header, render?(row), wrap?: boolean, nowrap?: boolean, className?: string, headerClassName?: string, width?: string }]
 */
export function DataTable({
  columns,
  rows,
  loading,
  error,
  onRetry,
  emptyMessage = 'No records found.',
  rowKey = 'id',
  dense = false,
  className = '',
}) {
  if (loading) return <LoadingState label="Loading data..." />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!rows || rows.length === 0) return <EmptyState message={emptyMessage} />;

  const tableTextSize = dense ? 'text-xs' : 'text-sm';
  const thText = dense ? 'text-[11px] py-2 px-1 sm:px-1.5' : 'text-xs py-3 px-3';
  const tdPadding = dense ? 'py-2 px-1 sm:px-1.5' : 'py-3 px-3';
  const tdText = dense ? 'text-xs' : 'text-sm';

  return (
    <div className={`overflow-x-auto w-full ${className}`}>
      <table className={`w-full text-left ${tableTextSize}`}>
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left font-semibold text-slate-500 uppercase tracking-wider leading-tight ${thText} ${
                  col.headerClassName || ''
                } ${col.nowrap ? 'whitespace-nowrap' : 'whitespace-normal'}`}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[rowKey]} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`${tdPadding} text-slate-700 ${tdText} ${col.className || ''} ${
                    col.wrap ? 'whitespace-normal break-words' : 'whitespace-nowrap'
                  }`}
                >
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
