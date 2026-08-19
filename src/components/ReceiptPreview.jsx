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
    <div className="bg-white text-navy-900 max-w-sm mx-auto p-6 text-sm print:max-w-none print:w-full print:p-0 print:h-full print:flex print:flex-col print:justify-between" style={{ fontFamily: 'ui-monospace, monospace' }}>
      <div className="receipt-body-content">
        <div className="text-center mb-6 border-b print:border-b-2 pb-4">
          <p className="font-bold text-lg print:text-2xl text-navy-950">{name}</p>
          <p className="text-xs font-bold tracking-wider uppercase text-slate-500 mt-0.5 print:text-sm">VVS-{receipt.id}</p>
          {address && <p className="text-xs text-slate-500 mt-1 print:text-sm">{address}</p>}
          {phone && <p className="text-xs text-slate-500 print:text-sm">Ph: {phone}</p>}
        </div>
        
        <div className="border-b border-dashed border-slate-300 pb-3 mb-4 flex justify-between text-xs print:text-sm">
          <span>Receipt No: <b className="text-sm print:text-base">{receipt_number}</b></span>
          <span>Date: <b>{formatDate(payment_date)}</b></span>
        </div>
        <p className="text-xs text-slate-500 mb-4 print:text-sm">Time: {formatDateTime(payment_time)}</p>

        <div className="space-y-0.5 mb-6">
          <Row label="Student Name" value={`${student_name} (${student_code})`} />
          <Row label="Parent Name" value={parent_name} />
          {className && <Row label="Class / Section" value={`${className}${section ? ' - ' + section : ''}`} />}
          <Row label="Student Segment Type" value={student_type} />
        </div>

        <div className="border-t border-dashed border-slate-300 pt-3 space-y-0.5 mb-6">
          <Row label="Total Academic Fee" value={formatCurrency(total_fee)} />
          {previous_paid != null && <Row label="Previously Paid" value={formatCurrency(previous_paid)} />}
          <Row label="This Transaction Payment" value={formatCurrency(amount)} bold />
          {total_paid_to_date != null && <Row label="Cumulative Paid to Date" value={formatCurrency(total_paid_to_date)} />}
          {remaining_due != null && <Row label="Balance Outstanding Due" value={formatCurrency(remaining_due)} bold />}
        </div>

        <div className="border-t border-dashed border-slate-300 pt-3 space-y-0.5 mb-6">
          <Row label="Payment Mode" value={payment_method} />
          <Row label="Authorized Receiver" value={received_by_name} />
          {remarks && <Row label="Remarks / Notes" value={remarks} />}
        </div>
      </div>

      <div className="receipt-footer-content">
        <div className="flex justify-between items-end mt-8 mb-4 print:mt-12">
          <div className="flex flex-col items-center">
            {receipt.digital_signature ? (
              receipt.digital_signature.startsWith('data:image/') ? (
                <img src={receipt.digital_signature} alt="Digital Signature" className="h-16 w-36 object-contain mb-1" />
              ) : (
                <div className="h-16 flex items-center justify-center mb-1 w-36 select-none">
                  <span style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" }} className="text-2xl text-slate-800 font-semibold">
                    {receipt.digital_signature}
                  </span>
                </div>
              )
            ) : (
              <div className="h-16"></div>
            )}
            <div className="border-t border-slate-400 w-36 pt-1 text-xs text-slate-500 print:text-sm text-center">
              Authorized Signature
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] print:text-xs text-slate-400 mt-6 border-t pt-3">This is a system-generated receipt. Thank you.</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between gap-2 py-1 print:py-2 border-b border-transparent print:border-slate-100 items-baseline">
      <span className="text-slate-500 print:text-slate-600 shrink-0">{label}</span>
      <span className={`${bold ? 'font-bold text-navy-950' : 'text-slate-800'} print:text-sm truncate max-w-[200px] text-right`} title={value}>{value}</span>
    </div>
  );
}
