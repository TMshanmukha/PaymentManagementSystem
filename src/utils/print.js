/**
 * Dynamically clones the active print container, mounts it directly under the
 * body (outside of any scrollable container wrappers), applies page-size styles,
 * and triggers the native browser print.
 */
export function triggerPrint() {
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

  const isReceipt = printArea.querySelector('.receipt-card') !== null || printArea.querySelector('.receipt-body-content') !== null;
  portal.className = isReceipt ? 'portal-receipt' : 'portal-report';

  const existing = document.getElementById('print-layout-style');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'print-layout-style';

  if (isReceipt) {
    // 100% Width Layout on Portrait Page (Single clean border, natural auto-height)
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 6mm 8mm !important;
        }
        *, *:before, *:after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body, html {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          height: auto !important;
          display: block !important;
          overflow: visible !important;
        }
        #root {
          display: none !important;
        }
        #print-portal {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: visible !important;
        }
        
        /* Remove wrapper borders to prevent double borders */
        #print-portal.portal-receipt > div,
        #print-portal.portal-receipt .print-area {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        
        /* Receipt Card: Full width, compact top-half page length, single crisp border */
        #print-portal.portal-receipt .receipt-card {
          max-width: 100% !important;
          width: 100% !important;
          height: auto !important;
          max-height: none !important;
          margin: 0 auto !important;
          padding: 12px 16px !important;
          border: 1.5px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: Georgia, 'Times New Roman', serif !important;
          font-size: 8.5pt !important;
          box-sizing: border-box !important;
          display: block !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        #print-portal.portal-receipt .no-print {
          display: none !important;
        }
      }
    `;
  } else {
    // A4 Portrait Layout for Financial Reports & Statements
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 8mm 8mm 8mm 8mm !important;
        }
        *, *:before, *:after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body, html {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }
        #root {
          display: none !important;
        }
        #print-portal {
          display: block !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
        }
        #print-portal.portal-report > div {
          max-width: none !important;
          width: 100% !important;
          margin: 0 auto !important;
          padding: 0 !important;
          border: none !important;
          border-radius: 0px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: ui-sans-serif, system-ui, sans-serif !important;
          font-size: 8.5pt !important;
          page-break-inside: auto !important;
        }
        #print-portal .text-center {
          text-align: center !important;
          margin-bottom: 0.5rem !important;
        }
        #print-portal .font-bold.text-lg, #print-portal .text-2xl {
          font-size: 14pt !important;
          font-weight: 700 !important;
          color: #0f172a !important;
        }
        #print-portal .text-xs.font-bold {
          font-size: 9.5pt !important;
          color: #475569 !important;
          margin-top: 0.25rem !important;
        }
        #print-portal th, #print-portal td {
          white-space: nowrap !important;
          text-overflow: ellipsis !important;
          overflow: hidden !important;
          padding: 3px 5px !important;
          font-size: 8pt !important;
        }
        #print-portal .print-only, 
        #print-portal .hidden.print\\:block,
        #print-portal .print\\:block {
          display: block !important;
        }
        #print-portal .print-only-flex,
        #print-portal .hidden.print\\:flex,
        #print-portal .print\\:flex {
          display: flex !important;
        }
        #print-portal .print-hidden, 
        #print-portal .print\\:hidden, 
        #print-portal .no-print,
        #print-portal .no-print * {
          display: none !important;
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

