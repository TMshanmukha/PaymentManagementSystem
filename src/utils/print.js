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

  const isReceipt = printArea.querySelector('.receipt-body-content') !== null;
  portal.className = isReceipt ? 'portal-receipt' : 'portal-report';

  const existing = document.getElementById('print-layout-style');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'print-layout-style';

  if (isReceipt) {
    // A5 Landscape Layout for Fee Receipts (Wide width, low height)
    style.innerHTML = `
      @media print {
        @page {
          size: A5 landscape !important;
          margin: 0 !important;
        }
        *, *:before, *:after {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body, html {
          background: #ffffff !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 210mm !important;
          height: 148mm !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        #root {
          display: none !important;
        }
        #print-portal {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 210mm !important;
          height: 148mm !important;
          margin: 0 auto !important;
          padding: 0 !important;
          overflow: hidden !important;
        }
        
        /* Receipt Specific Styles */
        #print-portal.portal-receipt > div {
          max-width: none !important;
          width: 198mm !important;
          height: 136mm !important;
          max-height: 136mm !important;
          margin: auto !important;
          padding: 5mm 7mm !important;
          border: 1.5px solid #000000 !important;
          border-radius: 0px !important;
          box-shadow: none !important;
          background: #ffffff !important;
          font-family: Georgia, 'Times New Roman', serif !important;
          font-size: 9.5pt !important;
          box-sizing: border-box !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
        }
        #print-portal.portal-receipt > div > div.receipt-body-content {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
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

