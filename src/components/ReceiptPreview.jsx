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
    <div className="bg-white text-black w-full max-w-2xl mx-auto p-5 text-sm print:w-full print:p-0 print:h-full print:flex print:flex-col print:justify-between font-serif border border-black rounded-none shadow-none" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
      <div className="receipt-body-content flex-1 flex flex-col justify-between">
        
        {/* Header Grid */}
        <div className="grid grid-cols-12 items-center border-b border-black pb-3 mb-4">
          <div className="col-span-2">
            <div className="border border-black w-16 h-16 flex items-center justify-center text-[10px] font-bold text-center leading-none text-slate-400">
              LOGO
            </div>
          </div>
          <div className="col-span-8 text-center font-serif">
            <h2 className="text-xl font-bold tracking-widest uppercase text-black" style={{ letterSpacing: '0.15em' }}>R E C E I P T</h2>
            <h1 className="text-base font-bold mt-0.5 text-black">{name}</h1>
            {address && <p className="text-[10px] leading-snug mt-0.5 text-slate-700">{address}</p>}
            {phone && <p className="text-[10px] text-slate-700">Ph: {phone}</p>}
          </div>
          <div className="col-span-2"></div>
        </div>

        {/* Metadata Row */}
        <div className="flex justify-between text-xs mb-5 px-1">
          <span>Receipt No. : <b className="text-sm text-black">{receipt_number}</b></span>
          <span>Receipt Date : <b className="text-sm text-black">{formatDate(payment_date)}</b></span>
        </div>

        {/* Receipt Body Fields */}
        <div className="space-y-4 px-1 flex-1">
          
          {/* Student Name */}
          <div className="flex items-baseline gap-1.5 w-full">
            <span className="shrink-0 text-slate-700 text-xs">Received with thanks from :</span>
            <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm">{student_name}</span>
          </div>

          {/* Class, Section, Code Row */}
          <div className="grid grid-cols-12 gap-3 items-baseline">
            <div className="col-span-4 flex items-baseline gap-1.5">
              <span className="shrink-0 text-slate-700 text-xs">Std :</span>
              <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm">{className || '—'}</span>
            </div>
            <div className="col-span-4 flex items-baseline gap-1.5">
              <span className="shrink-0 text-slate-700 text-xs">of Div :</span>
              <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm">{section || '—'}</span>
            </div>
            <div className="col-span-4 flex items-baseline gap-1.5">
              <span className="shrink-0 text-slate-700 text-xs">GR No. :</span>
              <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm">{student_code}</span>
            </div>
          </div>

          {/* Amount In Words */}
          <div className="flex flex-col gap-1.5 pt-1.5">
            <span className="font-bold text-slate-700 text-xs">A sum of Rupees :</span>
            <div className="border-b border-dotted border-black font-bold pl-2 pb-1 text-black text-sm leading-relaxed">
              Rupees {amountInWords}
            </div>
          </div>

          {/* Payment Method / Remarks */}
          <div className="flex items-baseline gap-1.5 w-full">
            <span className="shrink-0 text-slate-700 text-xs">By :</span>
            <span className="border-b border-dotted border-black flex-1 font-bold pl-2 pb-0.5 text-black text-sm uppercase">{payment_method} {remarks ? `(${remarks})` : ''}</span>
          </div>

        </div>

        {/* Amount Box & Signature Section */}
        <div className="flex justify-between items-end mt-8 pb-3 px-1">
          {/* Net Fees Box */}
          <div>
            <div className="flex border border-black divide-x divide-black w-60">
              <div className="bg-slate-50 px-3 py-1.5 font-bold text-center text-xs flex-1">Net Fees</div>
              <div className="px-4 py-1.5 font-bold text-right text-sm w-28">{Number(amount).toFixed(2)}</div>
            </div>
          </div>

          {/* Signature Box */}
          <div className="text-right flex flex-col items-end gap-1">
            <span className="text-[10px] text-slate-600 font-bold italic mb-1">For, {name}</span>
            <div className="w-28 h-12 flex items-center justify-center border border-dashed border-slate-200">
              {receipt.digital_signature ? (
                receipt.digital_signature.startsWith('data:image/') ? (
                  <img src={receipt.digital_signature} alt="Signature" className="h-10 w-24 object-contain" />
                ) : (
                  <span style={{ fontFamily: "Georgia, serif", fontStyle: "italic" }} className="text-xs text-slate-800 font-bold whitespace-nowrap">
                    {receipt.digital_signature}
                  </span>
                )
              ) : (
                <span className="text-[10px] text-slate-300 italic">Signatory</span>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Note/Terms section at bottom */}
      <div className="receipt-footer-content mt-3 border-t border-black pt-2 text-[9px] text-slate-700 leading-normal px-1">
        <p className="font-bold">Note : (1) Fees once paid are non-refundable. Please keep this receipt safe.</p>
        <p className="pl-9">(2) Receipts are subject to realization of payments.</p>
      </div>
    </div>
  );
}
