/**
 * Dynamically clones the active print container, mounts it directly under the
 * body (outside of any scrollable container wrappers), applies page-size styles,
 * and triggers the native browser print.
 */
export function triggerPrint(size) {
  const printArea = document.querySelector('.print-area');
  if (!printArea) {
    window.print();
    return;
  }

  let portal = document.getElementById('print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'print-portal';
    document.body.appendChild(portal);
  }

  portal.innerHTML = '';
  const clone = printArea.cloneNode(true);
  portal.appendChild(clone);

  const isReceipt = printArea.querySelector('.receipt-body-content') !== null;
  portal.className = isReceipt ? 'portal-receipt' : 'portal-report';

  const existing = document.getElementById('print-layout-style');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'print-layout-style';

  if (size === 'A4') {
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 15mm 15mm 15mm 15mm !important;
        }
        body {
          background: #ffffff !important;
        }
        #root {
          display: none !important;
        }
        #print-portal {
          display: block !important;
          width: 100% !important;
        }
        
        /* Receipt Specific Styles */
        #print-portal.portal-receipt > div {
          max-width: none !important;
          width: 180mm !important;
          height: 267mm !important;
          margin: 0 auto !important;
          padding: 20mm !important;
          border: 2px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 10.5pt !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }
        #print-portal.portal-receipt > div > div {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }

        /* Report Specific Styles */
        #print-portal.portal-report > div {
          max-width: 680px !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding: 2rem !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 8px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 10pt !important;
        }

        #print-portal .text-center {
          text-align: center !important;
          margin-bottom: 1.5rem !important;
        }
        #print-portal .font-bold.text-lg {
          font-size: 20pt !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        #print-portal .text-xs.font-bold {
          font-size: 11pt !important;
          color: #475569 !important;
          margin-top: 0.5rem !important;
        }
        #print-portal div[class*="print:py-"] {
          padding-top: 6px !important;
          padding-bottom: 6px !important;
        }
        #print-portal div[class*="mb-"] {
          margin-bottom: 0.75rem !important;
        }
        #print-portal div[class*="mt-"] {
          margin-top: 0.75rem !important;
        }
        #print-portal th, #print-portal td {
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
          overflow: hidden !important;
        }
        #print-portal .text-slate-500 {
          color: #475569 !important;
          font-size: 10.5pt !important;
        }
        #print-portal .text-slate-800, #print-portal .font-bold {
          color: #0f172a !important;
          font-size: 10.5pt !important;
        }
        #print-portal .text-xs {
          font-size: 9.5pt !important;
        }
        #print-portal .no-print {
          display: none !important;
        }
      }
    `;
  } else if (size === 'A5') {
    style.innerHTML = `
      @media print {
        @page {
          size: A5 portrait !important;
          margin: 10mm 10mm 10mm 10mm !important;
        }
        body {
          background: #ffffff !important;
        }
        #root {
          display: none !important;
        }
        #print-portal {
          display: block !important;
          width: 100% !important;
        }
        
        /* Receipt Specific Styles */
        #print-portal.portal-receipt > div {
          max-width: none !important;
          width: 128mm !important;
          height: 190mm !important;
          margin: 0 auto !important;
          padding: 10mm !important;
          border: 2px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 8.5pt !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }
        #print-portal.portal-receipt > div > div {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
        }

        /* Report Specific Styles */
        #print-portal.portal-report > div {
          max-width: 460px !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding: 1.25rem !important;
          border: 1px solid #cbd5e1 !important;
          border-radius: 6px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 8.5pt !important;
        }

        #print-portal .text-center {
          text-align: center !important;
          margin-bottom: 0.75rem !important;
        }
        #print-portal .font-bold.text-lg {
          font-size: 13pt !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        #print-portal .text-xs.font-bold {
          font-size: 9pt !important;
          color: #475569 !important;
        }
        #print-portal div[class*="print:py-"] {
          padding-top: 3px !important;
          padding-bottom: 3px !important;
        }
        #print-portal div[class*="mb-"] {
          margin-bottom: 0.5rem !important;
        }
        #print-portal div[class*="mt-"] {
          margin-top: 0.5rem !important;
        }
        #print-portal th, #print-portal td {
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
          overflow: hidden !important;
        }
        #print-portal .text-slate-500 {
          color: #475569 !important;
          font-size: 8.5pt !important;
        }
        #print-portal .text-slate-800, #print-portal .font-bold {
          color: #0f172a !important;
          font-size: 8.5pt !important;
        }
        #print-portal .text-xs {
          font-size: 8pt !important;
        }
        #print-portal .no-print {
          display: none !important;
        }
      }
    `;
  } else {
    // Normal / Browser default thermal layout (Narrow Slip)
    style.innerHTML = `
      @media print {
        @page {
          size: auto !important;
          margin: 5mm 5mm 5mm 5mm !important;
        }
        body {
          background: #ffffff !important;
        }
        #root {
          display: none !important;
        }
        #print-portal {
          display: block !important;
          width: 100% !important;
        }
        #print-portal > div {
          max-width: 320px !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding: 0.5rem 0.25rem !important;
          border: none !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace !important;
          font-size: 8pt !important;
        }
        #print-portal .text-center {
          text-align: center !important;
          margin-bottom: 1rem !important;
        }
        #print-portal .font-bold.text-lg {
          font-size: 11pt !important;
          font-weight: 700 !important;
        }
        #print-portal .text-xs.font-bold {
          font-size: 8.5pt !important;
        }
        #print-portal .py-1 {
          padding: 4px 0 !important;
          border-bottom: 1px dashed #cbd5e1 !important;
        }
        #print-portal th, #print-portal td {
          white-space: nowrap !important;
        }
        #print-portal .text-slate-500, #print-portal .text-slate-800, #print-portal .font-bold {
          font-size: 8pt !important;
        }
        #print-portal .text-xs {
          font-size: 7.5pt !important;
        }
        #print-portal .no-print {
          display: none !important;
        }
      }
    `;
  }

  document.head.appendChild(style);
  document.body.classList.add('printing-active');

  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-active');
      const added = document.getElementById('print-layout-style');
      if (added) added.remove();
      portal.innerHTML = '';
    }, 1000);
  }, 150);
}
