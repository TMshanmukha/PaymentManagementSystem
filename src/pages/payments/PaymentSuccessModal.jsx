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
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 mb-4 no-print flex flex-col items-center justify-center">
        <Button variant="primary" onClick={() => triggerPrint()} className="w-full justify-center">
          <Printer className="w-4 h-4" /> Print Receipt
        </Button>
      </div>

      <div className="print-area">
        <ReceiptPreview receipt={receipt} institution={institution} />
      </div>
    </Modal>
  );
}
