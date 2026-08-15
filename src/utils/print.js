/**
 * Dynamically clones the active report container, mounts it directly under the
 * body (outside of any scrollable container wrappers), and triggers print.
 * This ensures clean multi-page pagination without scrollbars or clipped contents.
 */
export function triggerPrint(size) {
  // Find the printable area inside the current page view
  const printArea = document.querySelector('.print-area');
  if (!printArea) {
    // Fallback if no specific print area is defined
    window.print();
    return;
  }

  // Find or create the print portal outside of React root
  let portal = document.getElementById('print-portal');
  if (!portal) {
    portal = document.createElement('div');
    portal.id = 'print-portal';
    document.body.appendChild(portal);
  }

  // Clear previous clone and clone the active print container
  portal.innerHTML = '';
  const clone = printArea.cloneNode(true);
  portal.appendChild(clone);

  // Remove any stale overrides
  const existing = document.getElementById('print-layout-style');
  if (existing) existing.remove();

  const style = document.createElement('style');
  style.id = 'print-layout-style';

  if (size === 'A4') {
    style.innerHTML = `
      @media print {
        @page {
          size: A4 portrait !important;
          margin: 8mm 8mm 8mm 8mm !important;
        }
        #print-portal {
          font-size: 9pt !important;
          color: #0f172a !important;
        }
        #print-portal .card {
          padding: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
          page-break-inside: avoid !important;
          background: #fff !important;
        }
        #print-portal th, #print-portal td {
          padding: 4px 6px !important;
          font-size: 8.5pt !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        #print-portal table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        #print-portal .grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
          gap: 0.5rem !important;
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
          margin: 4mm 4mm 4mm 4mm !important;
        }
        #print-portal {
          font-size: 7.5pt !important;
          color: #0f172a !important;
        }
        #print-portal .card {
          padding: 0.35rem !important;
          margin-bottom: 0.35rem !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: none !important;
          border-radius: 4px !important;
          page-break-inside: avoid !important;
          background: #fff !important;
        }
        #print-portal th, #print-portal td {
          padding: 2px 4px !important;
          font-size: 7pt !important;
          border-bottom: 1px solid #e2e8f0 !important;
        }
        #print-portal table {
          width: 100% !important;
          border-collapse: collapse !important;
        }
        #print-portal .grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)) !important;
          gap: 0.35rem !important;
        }
        #print-portal h1, #print-portal h2, #print-portal h3, #print-portal p, #print-portal span {
          font-size: 90% !important;
        }
        #print-portal .badge {
          font-size: 6.5pt !important;
          padding: 0.1rem 0.25rem !important;
        }
        #print-portal .no-print {
          display: none !important;
        }
      }
    `;
  } else {
    // Normal / Browser default size
    style.innerHTML = `
      @media print {
        @page {
          size: auto !important;
          margin: 15mm 15mm 15mm 15mm !important;
        }
        #print-portal .no-print {
          display: none !important;
        }
      }
    `;
  }

  document.head.appendChild(style);
  document.body.classList.add('printing-active');

  // Short delay to allow CSS reflow and cloning layout before browser loads print dialog
  setTimeout(() => {
    window.print();
    // Reset classes and empty the portal after dialog resolves
    setTimeout(() => {
      document.body.classList.remove('printing-active');
      const added = document.getElementById('print-layout-style');
      if (added) added.remove();
      portal.innerHTML = '';
    }, 1000);
  }, 150);
}
