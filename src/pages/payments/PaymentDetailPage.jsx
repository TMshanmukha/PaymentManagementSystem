import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, XCircle, RotateCcw } from 'lucide-react';
import { paymentApi } from '../../services/payment.service.js';
import { settingsApi } from '../../services/settings.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
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
  const [printMenuOpen, setPrintMenuOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [p, s] = await Promise.all([paymentApi.getOne(id), settingsApi.getAll()]);
      setPayment(p.data.data);
      setInstitution(s.data.data);
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
            <div className="relative no-print">
              <Button
                variant="secondary"
                onClick={() => setPrintMenuOpen((o) => !o)}
                className="justify-center"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </Button>
              {printMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setPrintMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-popover border border-slate-100 py-1 z-20">
                    <button
                      onClick={() => { setPrintMenuOpen(false); triggerPrint('A4'); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                    >
                      <p className="font-semibold text-slate-800">Print A4 Size</p>
                      <p className="text-xs text-slate-400">Optimized voucher scaling</p>
                    </button>
                    <button
                      onClick={() => { setPrintMenuOpen(false); triggerPrint('A5'); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <p className="font-semibold text-slate-800">Print A5 Size</p>
                      <p className="text-xs text-slate-400">Voucher memo scale</p>
                    </button>
                  </div>
                </>
              )}
            </div>
            {isAdmin && payment.status === 'COMPLETED' && (
              <>
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
    </div>
  );
}
