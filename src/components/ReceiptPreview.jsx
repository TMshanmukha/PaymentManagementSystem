import { formatCurrency, formatDate, formatDateTime } from '../utils/format.js';
import { useSettings } from '../context/SettingsContext.jsx';

/**
 * Renders a printable receipt. Wrapped by the parent page in a `.print-area`
 * div so the browser's native print (Ctrl+P) only outputs this content —
 * sidebar/navbar/buttons are hidden via the `.no-print` / `@media print`
 * rules in index.css. Works for standard A4 and narrows down cleanly for
 * 58mm/80mm thermal rolls because it's a single-column, minimal-margin layout.
 */
export function ReceiptPreview({ receipt, institution: propInstitution }) {
  const { settings } = useSettings();
  if (!receipt) return null;

  const institution = propInstitution || settings;
  const name = institution?.institution_name || settings?.institution_name || 'EduLedger Institution';
  const address = institution?.institution_address || settings?.institution_address;
  const phone = institution?.institution_phone || settings?.institution_phone;

  const {
    receipt_number, payment_date, payment_time, student_name, student_code, parent_name,
    class: className, section, student_type, total_fee, previous_paid, amount,
    total_paid_to_date, remaining_due, payment_method, received_by_name, remarks,
  } = receipt;

  return (
    <div className="bg-white text-navy-900 max-w-sm mx-auto p-6 text-sm" style={{ fontFamily: 'ui-monospace, monospace' }}>
      <div className="text-center mb-4">
        <p className="font-bold text-base">{name}</p>
        {address && <p className="text-xs text-slate-500">{address}</p>}
        {phone && <p className="text-xs text-slate-500">Ph: {phone}</p>}
      </div>
      <div className="border-t border-b border-dashed border-slate-300 py-2 mb-2 flex justify-between text-xs">
        <span>Receipt: <b>{receipt_number}</b></span>
        <span>{formatDate(payment_date)}</span>
      </div>
      <p className="text-xs text-slate-500 mb-2">Time: {formatDateTime(payment_time)}</p>

      <div className="space-y-1 mb-3">
        <Row label="Student" value={`${student_name} (${student_code})`} />
        <Row label="Parent" value={parent_name} />
        {className && <Row label="Class" value={`${className}${section ? ' - ' + section : ''}`} />}
        <Row label="Type" value={student_type} />
      </div>

      <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 mb-3">
        <Row label="Total Fee" value={formatCurrency(total_fee)} />
        {previous_paid != null && <Row label="Previously Paid" value={formatCurrency(previous_paid)} />}
        <Row label="This Payment" value={formatCurrency(amount)} bold />
        {total_paid_to_date != null && <Row label="Total Paid" value={formatCurrency(total_paid_to_date)} />}
        {remaining_due != null && <Row label="Remaining Due" value={formatCurrency(remaining_due)} bold />}
      </div>

      <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 mb-4">
        <Row label="Payment Method" value={payment_method} />
        <Row label="Received By" value={received_by_name} />
        {remarks && <Row label="Remarks" value={remarks} />}
      </div>

      <div className="flex justify-between items-end mt-8 mb-2">
        <div className="text-center">
          <div className="border-t border-slate-400 w-24 pt-1 text-xs text-slate-500">Signature</div>
        </div>
      </div>

      <p className="text-center text-[10px] text-slate-400 mt-4">This is a system-generated receipt. Thank you.</p>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-slate-500">{label}</span>
      <span className={bold ? 'font-bold' : ''}>{value}</span>
    </div>
  );
}
