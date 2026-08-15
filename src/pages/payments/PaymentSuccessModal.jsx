import { Modal } from '../../components/Modal.jsx';
import { Button } from '../../components/Button.jsx';
import { ReceiptPreview } from '../../components/ReceiptPreview.jsx';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { settingsApi } from '../../services/settings.service.js';
import { triggerPrint } from '../../utils/print.js';

/**
 * Shown immediately after a successful payment save. Offers Print / Close
 * per the ideal accountant flow in spec section 59: Save -> Receipt -> Print.
 */
export function PaymentSuccessModal({ receipt, onClose, onNewPayment }) {
  const [institution, setInstitution] = useState(null);
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  useEffect(() => {
    if (receipt) {
      settingsApi.getAll().then(({ data }) => setInstitution(data.data)).catch(() => {});
    }
  }, [receipt]);

  if (!receipt) return null;

  return (
    <Modal
      open={Boolean(receipt)}
      onClose={onClose}
      title="Payment Recorded Successfully"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="secondary" onClick={onNewPayment}>Record Another</Button>
          <div className="relative no-print inline-block">
            <Button
              onClick={() => setPrintMenuOpen((o) => !o)}
              className="justify-center"
            >
              <Printer className="w-4 h-4" /> Print Receipt
            </Button>
            {printMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setPrintMenuOpen(false)} />
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-lg shadow-popover border border-slate-100 py-1 z-20">
                  <button
                    onClick={() => { setPrintMenuOpen(false); triggerPrint('A4'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                  >
                    <p className="font-semibold text-slate-800">Print A4 Size</p>
                    <p className="text-xs text-slate-400">Full-page voucher</p>
                  </button>
                  <button
                    onClick={() => { setPrintMenuOpen(false); triggerPrint('A5'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                  >
                    <p className="font-semibold text-slate-800">Print A5 Size</p>
                    <p className="text-xs text-slate-400">Compact memo size</p>
                  </button>
                  <button
                    onClick={() => { setPrintMenuOpen(false); triggerPrint('NORMAL'); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <p className="font-semibold text-slate-800">Normal / Default</p>
                    <p className="text-xs text-slate-400">Standard print layout</p>
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      }
    >
      <div className="print-area">
        <ReceiptPreview receipt={receipt} institution={institution} />
      </div>
    </Modal>
  );
}
