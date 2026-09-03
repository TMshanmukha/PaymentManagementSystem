import { formatCurrency, formatDate, formatDateTime } from '../utils/format.js';
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
      className="bg-white text-black w-full max-w-3xl mx-auto p-4 sm:p-5 text-sm print:w-full print:p-0 print:h-full print:flex print:flex-col print:justify-between font-serif border-[1.5px] border-black rounded-none shadow-none box-border"
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <div className="receipt-body-content flex-1 flex flex-col justify-between h-full">
        
        {/* Header Grid */}
        <div className="border-b-[1.5px] border-black pb-2 mb-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Left Emblem / Logo Box */}
            <div className="w-14 h-14 border border-black flex flex-col items-center justify-center text-center shrink-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-black">LOGO</span>
            </div>

            {/* Center Institution Details */}
            <div className="flex-1 text-center font-serif px-2">
              <h2 className="text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-black mb-0.5">R E C E I P T</h2>
              <h1 className="text-base sm:text-lg font-bold uppercase text-black leading-tight">{name}</h1>
              {address && <p className="text-[10px] leading-tight text-slate-800 mt-0.5">{address}</p>}
              {phone && <p className="text-[10px] text-slate-800 leading-tight">Ph: {phone}</p>}
            </div>

            {/* Right Meta / Copy tag */}
            <div className="w-14 shrink-0 flex flex-col items-end justify-start">
              <span className="text-[9px] uppercase tracking-wider font-semibold border border-black px-1 py-0.5 text-center">
                Original
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Row */}
        <div className="flex justify-between items-center text-xs border-b border-dashed border-slate-400 pb-1.5 mb-3 px-1">
          <div>
            <span className="text-slate-800">Receipt No. : </span>
            <b className="text-sm text-black font-bold tracking-wide">{receipt_number}</b>
          </div>
          <div>
            <span className="text-slate-800">Date : </span>
            <b className="text-sm text-black font-bold">{formatDate(payment_date)}</b>
          </div>
        </div>

        {/* Receipt Body Fields (Horizontal Wide Fill-in-the-blank style) */}
        <div className="space-y-2.5 px-1 flex-1">
          
          {/* Student Name */}
          <div className="flex items-baseline gap-2 w-full">
            <span className="shrink-0 text-slate-800 text-xs font-medium">Received with thanks from :</span>
            <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm uppercase tracking-wide">
              {student_name}
            </span>
          </div>

          {/* Class, Section, Code Row */}
          <div className="grid grid-cols-12 gap-3 items-baseline">
            <div className="col-span-4 flex items-baseline gap-1.5">
              <span className="shrink-0 text-slate-800 text-xs font-medium">Std / Class :</span>
              <span className="border-b border-dotted border-black flex-1 font-bold pl-1.5 pb-0.5 text-black text-sm">
                {className || '—'}
              </span>
            </div>
            <div className="col-span-4 flex items-baseline gap-1.5">
              <span className="shrink-0 text-slate-800 text-xs font-medium">Div / Section :</span>
              <span className="border-b border-dotted border-black flex-1 font-bold pl-1.5 pb-0.5 text-black text-sm">
                {section || '—'}
              </span>
            </div>
            <div className="col-span-4 flex items-baseline gap-1.5">
              <span className="shrink-0 text-slate-800 text-xs font-medium">GR No. :</span>
              <span className="border-b border-dotted border-black flex-1 font-bold pl-1.5 pb-0.5 text-black text-sm">
                {student_code}
              </span>
            </div>
          </div>

          {/* Amount In Words */}
          <div className="flex items-baseline gap-2 w-full">
            <span className="shrink-0 text-slate-800 text-xs font-medium">A sum of Rupees :</span>
            <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm leading-relaxed">
              Rupees {amountInWords}
            </span>
          </div>

          {/* Payment Method / Remarks */}
          <div className="flex items-baseline gap-2 w-full">
            <span className="shrink-0 text-slate-800 text-xs font-medium">Payment Mode / Towards :</span>
            <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm uppercase">
              {payment_method} {remarks ? `— ${remarks}` : ''}
            </span>
          </div>

        </div>

        {/* Amount Box & Signature Section */}
        <div className="flex justify-between items-end mt-3 pt-1 px-1">
          {/* Net Fees Box */}
          <div className="flex flex-col gap-1">
            <div className="flex border-[1.5px] border-black divide-x-[1.5px] divide-black w-56 sm:w-64">
              <div className="bg-slate-100 px-3 py-1 font-bold text-center text-xs flex-1 uppercase tracking-wider">
                Net Fees
              </div>
              <div className="px-3 py-1 font-bold text-right text-sm sm:text-base w-32 sm:w-36 bg-white">
                ₹ {Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Signature Box */}
          <div className="text-right flex flex-col items-end">
            <span className="text-[10px] text-slate-700 font-bold italic mb-0.5">For, {name}</span>
            <div className="w-28 h-10 flex items-center justify-center border border-dashed border-slate-300">
              {receipt.digital_signature ? (
                receipt.digital_signature.startsWith('data:image/') ? (
                  <img src={receipt.digital_signature} alt="Signature" className="h-8 w-24 object-contain" />
                ) : (
                  <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }} className="text-xs text-slate-900 font-bold whitespace-nowrap">
                    {receipt.digital_signature}
                  </span>
                )
              ) : (
                <span className="text-[9px] text-slate-300 italic">Signatory</span>
              )}
            </div>
            <span className="text-[9px] text-slate-600 font-semibold mt-0.5">Authorized Signatory</span>
          </div>
        </div>

      </div>

      {/* Note/Terms section at bottom */}
      <div className="receipt-footer-content mt-2 border-t border-black pt-1.5 text-[8.5px] text-slate-700 leading-tight px-1">
        <div className="flex justify-between items-center">
          <p className="font-semibold">Note : (1) Fees once paid are non-refundable. Please keep this receipt safe. (2) Receipts are subject to realization of payments.</p>
        </div>
      </div>
    </div>
  );
}
