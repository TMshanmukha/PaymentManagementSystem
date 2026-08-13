const STYLES = {
  green: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-orange-50 text-orange-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-brand-50 text-brand-700',
};

const STATUS_MAP = {
  COMPLETED: { color: 'green', label: 'Completed' },
  PAID: { color: 'green', label: 'Paid' },
  ACTIVE: { color: 'green', label: 'Active' },
  APPROVED: { color: 'green', label: 'Approved' },
  PARTIAL: { color: 'orange', label: 'Partial' },
  DUE: { color: 'orange', label: 'Due' },
  SUBMITTED: { color: 'orange', label: 'Submitted' },
  OPEN: { color: 'gray', label: 'Open' },
  REOPENED: { color: 'orange', label: 'Reopened' },
  CANCELLED: { color: 'red', label: 'Cancelled' },
  REVERSED: { color: 'red', label: 'Reversed' },
  INACTIVE: { color: 'gray', label: 'Inactive' },
};

export function Badge({ status, color, children }) {
  const mapped = status ? STATUS_MAP[status] : null;
  const finalColor = color || mapped?.color || 'gray';
  const label = children ?? mapped?.label ?? status;
  return <span className={`badge ${STYLES[finalColor]}`}>{label}</span>;
}
