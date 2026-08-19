import { Modal } from '../../components/Modal.jsx';
import { Button } from '../../components/Button.jsx';
import { ReceiptPreview } from '../../components/ReceiptPreview.jsx';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { settingsApi } from '../../services/settings.service.js';
import { triggerPrint } from '../../utils/print.js';

/**
 * Shown immediately after a successful payment save. Prompts the user with
 * clear receipt printing options (A4, A5, Thermal Slip) directly at the top
 * of the modal body.
 */
export function PaymentSuccessModal({ receipt, onClose, onNewPayment }) {
  const [institution, setInstitution] = useState(null);

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
          <Button variant="primary" onClick={onNewPayment}>Record Another</Button>
        </>
      }
    >
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 no-print">
        <p className="text-sm font-semibold text-brand-900 mb-2.5 text-center flex items-center justify-center gap-1.5">
          <Printer className="w-4 h-4 text-brand-650" /> Choose Paper Size to Print Receipt
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => triggerPrint('A4')}
            className="flex flex-col items-center justify-center p-3 bg-white border border-brand-200 rounded-lg hover:border-brand-500 hover:bg-brand-50/55 transition-all outline-none"
          >
            <span className="font-bold text-sm text-slate-800">A4 Sheet</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Full Page</span>
          </button>
          <button
            onClick={() => triggerPrint('A5')}
            className="flex flex-col items-center justify-center p-3 bg-white border border-brand-200 rounded-lg hover:border-brand-500 hover:bg-brand-50/55 transition-all outline-none"
          >
            <span className="font-bold text-sm text-slate-800">A5 Sheet</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Half Page</span>
          </button>
        </div>
      </div>

      <div className="print-area">
        <ReceiptPreview receipt={receipt} institution={institution} />
      </div>
    </Modal>
  );
}
