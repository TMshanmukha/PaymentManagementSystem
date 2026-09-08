import { formatCurrency, formatDate } from '../utils/format.js';
import { useSettings } from '../context/SettingsContext.jsx';

// Function to convert number to words (Indian Rupees format)
function numberToWords(amount) {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function numToWords(num) {
    if (num < 20) return ones[num];
    const digit = num % 10;
    if (num < 100) return tens[Math.floor(num / 10)] + (digit ? ' ' + ones[digit] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 === 0 ? '' : ' and ' + numToWords(num % 100));
    if (num < 100000) return numToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 === 0 ? '' : ' ' + numToWords(num % 1000));
    if (num < 10000000) return numToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 === 0 ? '' : ' ' + numToWords(num % 100000));
    return numToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 === 0 ? '' : ' ' + numToWords(num % 10000000));
  }

  const num = Math.floor(Number(amount || 0));
  if (num === 0) return 'Zero';
  return numToWords(num) + ' Only';
}

export function ReceiptPreview({ receipt, institution: propInstitution }) {
  const { settings } = useSettings();
  if (!receipt) return null;

  const institution = propInstitution || settings;
  const name = institution?.institution_name || settings?.institution_name || 'VVSLedger Institution';
  const address = institution?.institution_address || settings?.institution_address;
  const phone = institution?.institution_phone || settings?.institution_phone;

  const {
    receipt_number, payment_date, student_name, student_code,
    class: className, section, amount, payment_method, remarks,
  } = receipt;

  const amountInWords = numberToWords(amount);

  return (
    <div
      className="receipt-card bg-white text-slate-900 w-full max-w-2xl mx-auto p-5 sm:p-6 text-xs sm:text-sm font-serif border-[1.5px] border-slate-900 rounded-none shadow-none box-border relative"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      {/* Header Section */}
      <div className="border-b-[1.5px] border-slate-900 pb-3 mb-3 relative">
        {/* Top Right Original Copy Tag */}
        <div className="absolute right-0 top-0">
          <span className="text-[9px] uppercase tracking-widest font-bold border border-slate-900 px-2 py-0.5 text-slate-900">
            Original
          </span>
        </div>

        {/* Center Institution Info */}
        <div className="text-center px-8">
          <h2 className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-slate-700 mb-0.5">R E C E I P T</h2>
          <h1 className="text-base sm:text-lg font-bold uppercase text-slate-950 leading-snug">{name}</h1>
          {address && <p className="text-[11px] leading-tight text-slate-600 mt-0.5">{address}</p>}
          {phone && <p className="text-[11px] text-slate-600 leading-tight">Ph: {phone}</p>}
        </div>
      </div>

      {/* Metadata Row: Receipt No. and Date */}
      <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-300 pb-2 mb-3 px-0.5">
        <div>
          <span className="text-slate-600 font-medium">Receipt No. : </span>
          <b className="text-sm text-slate-950 font-bold tracking-wide">{receipt_number}</b>
        </div>
        <div>
          <span className="text-slate-600 font-medium">Date : </span>
          <b className="text-sm text-slate-950 font-bold">{formatDate(payment_date)}</b>
        </div>
      </div>

      {/* Student & Fee Fields */}
      <div className="space-y-3 px-0.5 mb-4">
        {/* Student Name */}
        <div className="flex items-baseline gap-2 w-full">
          <span className="shrink-0 text-slate-700 text-xs font-medium">Received with thanks from :</span>
          <span className="border-b border-dotted border-slate-400 flex-1 font-bold pl-2 pb-0.5 text-slate-950 text-sm uppercase tracking-wide">
            {student_name}
          </span>
        </div>

        {/* Class, Section, Admission No */}
        <div className="grid grid-cols-12 gap-3 items-baseline">
          <div className="col-span-4 flex items-baseline gap-1.5">
            <span className="shrink-0 text-slate-700 text-xs font-medium">Std / Class :</span>
            <span className="border-b border-dotted border-slate-400 flex-1 font-bold pl-1.5 pb-0.5 text-slate-950 text-sm">
              {className || '—'}
            </span>
          </div>
          <div className="col-span-3 flex items-baseline gap-1.5">
            <span className="shrink-0 text-slate-700 text-xs font-medium">Div / Section :</span>
            <span className="border-b border-dotted border-slate-400 flex-1 font-bold pl-1.5 pb-0.5 text-slate-950 text-sm">
              {section || '—'}
            </span>
          </div>
          <div className="col-span-5 flex items-baseline gap-1.5">
            <span className="shrink-0 text-slate-700 text-xs font-medium">Admission No. :</span>
            <span className="border-b border-dotted border-slate-400 flex-1 font-bold pl-1.5 pb-0.5 text-slate-950 text-sm">
              {student_code}
            </span>
          </div>
        </div>

        {/* Amount In Words */}
        <div className="flex items-baseline gap-2 w-full">
          <span className="shrink-0 text-slate-700 text-xs font-medium">A sum of Rupees :</span>
          <span className="border-b border-dotted border-slate-400 flex-1 font-bold pl-2 pb-0.5 text-slate-950 text-xs sm:text-sm">
            Rupees {amountInWords}
          </span>
        </div>

        {/* Payment Method / Towards */}
        <div className="flex items-baseline gap-2 w-full">
          <span className="shrink-0 text-slate-700 text-xs font-medium">Payment Mode / Towards :</span>
          <span className="border-b border-dotted border-slate-400 flex-1 font-bold pl-2 pb-0.5 text-slate-950 text-xs sm:text-sm uppercase">
            {payment_method} {remarks ? `— ${remarks}` : ''}
          </span>
        </div>
      </div>

      {/* Amount Box & Signature Section */}
      <div className="flex justify-between items-end mt-4 pt-1 px-0.5 gap-4">
        {/* Net Fees Box */}
        <div className="shrink-0">
          <div className="flex border-[1.5px] border-slate-900 divide-x-[1.5px] divide-slate-900 w-52 sm:w-60">
            <div className="bg-slate-100 px-3 py-1.5 font-bold text-center text-xs uppercase tracking-wider text-slate-800 flex items-center justify-center">
              Net Fees
            </div>
            <div className="px-3 py-1.5 font-bold text-right text-sm sm:text-base text-slate-950 bg-white flex-1 whitespace-nowrap">
              ₹ {Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Signature Box */}
        <div className="text-right flex flex-col items-end shrink-0">
          <span className="text-[10px] text-slate-700 font-semibold italic mb-0.5">For, {name}</span>
          <div className="min-h-[32px] flex items-center justify-end px-1">
            {receipt.digital_signature ? (
              receipt.digital_signature.startsWith('data:image/') ? (
                <img src={receipt.digital_signature} alt="Signature" className="h-7 max-w-[120px] object-contain" />
              ) : (
                <span className="text-xs text-slate-900 font-bold italic whitespace-nowrap">
                  {receipt.digital_signature}
                </span>
              )
            ) : (
              <span className="text-[10px] text-slate-400 italic">Signature</span>
            )}
          </div>
          <div className="w-32 border-t border-slate-700 mt-1"></div>
          <span className="text-[9px] text-slate-700 font-bold uppercase tracking-wider mt-0.5">Authorized Signatory</span>
        </div>
      </div>

      {/* Note/Terms section at bottom */}
      <div className="mt-3.5 border-t border-dashed border-slate-300 pt-2 text-[9px] text-slate-600 leading-tight px-0.5">
        <div className="flex justify-between items-center">
          <p className="font-medium">Note : (1) Fees once paid are non-refundable. Please keep this receipt safe. (2) Receipts are subject to realization of payments.</p>
        </div>
      </div>
    </div>
  );
}
