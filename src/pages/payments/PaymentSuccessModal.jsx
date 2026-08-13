import { Modal } from '../../components/Modal.jsx';
import { Button } from '../../components/Button.jsx';
import { ReceiptPreview } from '../../components/ReceiptPreview.jsx';
import { Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { settingsApi } from '../../services/settings.service.js';

/**
 * Shown immediately after a successful payment save. Offers Print / Close
 * per the ideal accountant flow in spec section 59: Save -> Receipt -> Print.
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
          <Button variant="secondary" onClick={onNewPayment}>Record Another</Button>
          <Button onClick={() => window.print()}><Printer className="w-4 h-4" /> Print Receipt</Button>
        </>
      }
    >
      <div className="print-area">
        <ReceiptPreview receipt={receipt} institution={institution} />
      </div>
    </Modal>
  );
}
