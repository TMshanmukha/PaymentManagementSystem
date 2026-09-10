import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, XCircle, RotateCcw, Calendar } from 'lucide-react';
import { paymentApi } from '../../services/payment.service.js';
import { settingsApi } from '../../services/settings.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { Modal } from '../../components/Modal.jsx';
import { Input } from '../../components/Input.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { ConfirmationModal } from '../../components/ConfirmationModal.jsx';
import { ReceiptPreview } from '../../components/ReceiptPreview.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../config/api.js';
import { ROLES } from '../../config/constants.js';
import { triggerPrint } from '../../utils/print.js';

export default function PaymentDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const isAdmin = user.role === ROLES.ADMIN;

  const [payment, setPayment] = useState(null);
  const [institution, setInstitution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState(null); // 'cancel' | 'reverse'
  const [busy, setBusy] = useState(false);
  const [editDateOpen, setEditDateOpen] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [savingDate, setSavingDate] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [p, s] = await Promise.all([paymentApi.getOne(id), settingsApi.getAll()]);
      setPayment(p.data.data);
      setInstitution(s.data.data);
      if (p.data.data?.payment_date) {
        setNewDate(String(p.data.data.payment_date).slice(0, 10));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load payment.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [id]); // eslint-disable-line

  async function handleAction() {
    setBusy(true);
    try {
      const reason = action === 'cancel' ? 'Cancelled by admin' : 'Reversed by admin';
      if (action === 'cancel') await paymentApi.cancel(id, reason);
      else await paymentApi.reverse(id, reason);
      toast.success(`Payment ${action === 'cancel' ? 'cancelled' : 'reversed'}.`);
      setAction(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveDate(e) {
    e.preventDefault();
    if (!newDate) return;
    setSavingDate(true);
    try {
      await paymentApi.updateDate(id, newDate);
      toast.success('Payment date updated successfully.');
      setEditDateOpen(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not update payment date.'));
    } finally {
      setSavingDate(false);
    }
  }

  if (loading) return <LoadingState label="Loading payment..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!payment) return null;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <PageHeader
        title={`Receipt ${payment.receipt_number}`}
        description={`${payment.student_name} · ${payment.student_code}`}
        actions={
          <>
            <Badge status={payment.status} />
            <div className="relative no-print flex gap-2">
              <Button
                variant="secondary"
                onClick={() => triggerPrint()}
                className="justify-center"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
            </div>
            {isAdmin && payment.status === 'COMPLETED' && (
              <>
                <Button variant="secondary" onClick={() => { setNewDate(String(payment.payment_date).slice(0, 10)); setEditDateOpen(true); }}>
                  <Calendar className="w-4 h-4" /> Change Date
                </Button>
                <Button variant="secondary" onClick={() => setAction('reverse')}><RotateCcw className="w-4 h-4" /> Reverse</Button>
                <Button variant="danger" onClick={() => setAction('cancel')}><XCircle className="w-4 h-4" /> Cancel</Button>
              </>
            )}
          </>
        }
      />

      <Card>
        <div className="print-area">
          <ReceiptPreview receipt={payment} institution={institution} />
        </div>
      </Card>

      <ConfirmationModal
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        loading={busy}
        title={action === 'cancel' ? 'Cancel this payment?' : 'Reverse this payment?'}
        message="This action is recorded in the audit log and cannot be undone. The payment record itself is never deleted."
        confirmLabel={action === 'cancel' ? 'Cancel Payment' : 'Reverse Payment'}
      />

      {isAdmin && (
        <Modal
          open={editDateOpen}
          onClose={() => setEditDateOpen(false)}
          title="Change Payment Date"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEditDateOpen(false)}>Cancel</Button>
              <Button variant="primary" loading={savingDate} onClick={handleSaveDate}>Save Date</Button>
            </>
          }
        >
          <form onSubmit={handleSaveDate} className="space-y-4">
            <p className="text-xs text-slate-500">
              Select the new payment date for Receipt <b>{payment.receipt_number}</b>. This will update the receipt and audit logs.
            </p>
            <Input
              label="New Payment Date"
              type="date"
              required
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}
