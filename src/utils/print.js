/**
 * Dynamically injects @page layout sizes and scaling rules for A4, A5, or Normal
 * formats in the DOM document head, then triggers the native print dialog.
 */
export function triggerPrint(size) {
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
        .print-a4 {
          font-size: 9pt !important;
        }
        .print-a4 .card {
          padding: 0.5rem !important;
          margin-bottom: 0.5rem !important;
        }
        .print-a4 th, .print-a4 td {
          padding: 4px 6px !important;
          font-size: 8.5pt !important;
        }
        .print-a4 .grid {
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
          gap: 0.5rem !important;
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
        .print-a4 {
          font-size: 7.5pt !important;
        }
        .print-a4 .card {
          padding: 0.35rem !important;
          margin-bottom: 0.35rem !important;
          border-radius: 4px !important;
        }
        .print-a4 th, .print-a4 td {
          padding: 2px 4px !important;
          font-size: 7pt !important;
        }
        .print-a4 .grid {
          grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)) !important;
          gap: 0.35rem !important;
        }
        .print-a4 h1, .print-a4 h2, .print-a4 h3, .print-a4 p, .print-a4 span {
          font-size: 90% !important;
        }
        .print-a4 .badge {
          font-size: 6.5pt !important;
          padding: 0.1rem 0.25rem !important;
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
      }
    `;
  }

  document.head.appendChild(style);

  // Tiny delay to allow CSS reflow before browser opens dialog
  setTimeout(() => {
    window.print();
    // Cleanup after user closes dialog
    setTimeout(() => {
      const added = document.getElementById('print-layout-style');
      if (added) added.remove();
    }, 1000);
  }, 150);
}
