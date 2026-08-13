import { useEffect, useState } from 'react';
import { ClipboardCheck, CheckCircle2, RotateCcw } from 'lucide-react';
import { dayClosingApi } from '../../services/dayClosing.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Badge } from '../../components/Badge.jsx';
import { ConfirmationModal } from '../../components/ConfirmationModal.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { formatCurrency, formatDate, formatDateTime, todayISO } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../services/api.js';
import { ROLES } from '../../config/constants.js';
import { IndianRupee, Banknote, Smartphone } from 'lucide-react';

export default function DayClosingPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user.role === ROLES.ADMIN;

  const [date, setDate] = useState(todayISO());
  const [expected, setExpected] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [approveTarget, setApproveTarget] = useState(null);
  const [reopenTarget, setReopenTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [exp, hist] = await Promise.all([
        !isAdmin ? dayClosingApi.expected(date) : Promise.resolve({ data: { data: null } }),
        dayClosingApi.list({}),
      ]);
      setExpected(exp.data.data);
      setHistory(hist.data.data);
    } catch {
      toast.error('Could not load day closing data.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [date]); // eslint-disable-line

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await dayClosingApi.submit({ closingDate: date });
      toast.success('Day closing submitted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove() {
    setBusy(true);
    try {
      await dayClosingApi.approve(approveTarget.id);
      toast.success('Day closing approved.');
      setApproveTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleReopen() {
    setBusy(true);
    try {
      await dayClosingApi.reopen(reopenTarget.id, 'Reopened by admin for correction');
      toast.success('Day closing reopened.');
      setReopenTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    { key: 'closing_date', header: 'Date', render: (r) => formatDate(r.closing_date) },
    ...(isAdmin ? [{ key: 'accountant_name', header: 'Accountant' }] : []),
    { key: 'transaction_count', header: 'Txns' },
    { key: 'cash_total', header: 'Cash', render: (r) => formatCurrency(r.cash_total) },
    { key: 'upi_total', header: 'UPI', render: (r) => formatCurrency(r.upi_total) },
    { key: 'overall_total', header: 'Total', render: (r) => formatCurrency(r.overall_total) },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
    ...(isAdmin ? [{
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex gap-1">
          {r.status === 'SUBMITTED' && (
            <button onClick={() => setApproveTarget(r)} className="btn-ghost !px-2 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></button>
          )}
          {(r.status === 'APPROVED' || r.status === 'SUBMITTED') && (
            <button onClick={() => setReopenTarget(r)} className="btn-ghost !px-2 text-orange-600"><RotateCcw className="w-4 h-4" /></button>
          )}
        </div>
      )
    }] : []),
  ];

  if (loading) return <LoadingState label="Loading day closing..." />;

  return (
    <div>
      <PageHeader title="Day Closing" description={isAdmin ? 'Review and approve accountant closings' : 'Review your collection and submit for the day'} />

      {!isAdmin && (
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <input type="date" className="input w-full sm:w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
            <Button onClick={handleSubmit} loading={submitting} className="w-full sm:w-auto justify-center"><ClipboardCheck className="w-4 h-4" /> Submit Day Closing</Button>
          </div>
          {expected && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Expected Collection" value={formatCurrency(expected.overall_total)} icon={IndianRupee} tone="success" />
              <StatCard label="Cash" value={formatCurrency(expected.cash_total)} icon={Banknote} />
              <StatCard label="UPI" value={formatCurrency(expected.upi_total)} icon={Smartphone} />
              <StatCard label="Transactions" value={expected.transaction_count} />
            </div>
          )}
        </Card>
      )}

      <Card>
        <p className="font-semibold text-navy-900 mb-3">Day Closing History</p>
        <DataTable columns={columns} rows={history} loading={false} emptyMessage="No day closings submitted yet." />
      </Card>

      <ConfirmationModal
        open={Boolean(approveTarget)} onClose={() => setApproveTarget(null)} onConfirm={handleApprove} loading={busy}
        title="Approve this day closing?" message={`Approve ${approveTarget?.accountant_name}'s closing for ${formatDate(approveTarget?.closing_date)}?`}
        confirmLabel="Approve" confirmVariant="primary"
      />
      <ConfirmationModal
        open={Boolean(reopenTarget)} onClose={() => setReopenTarget(null)} onConfirm={handleReopen} loading={busy}
        title="Reopen this day closing?" message="This allows corrections to be made for this date. The reason will be recorded in the audit log."
        confirmLabel="Reopen"
      />
    </div>
  );
}
