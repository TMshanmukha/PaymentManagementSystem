import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, XCircle, RotateCcw } from 'lucide-react';
import { paymentApi } from '../../services/payment.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Select } from '../../components/Select.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Badge } from '../../components/Badge.jsx';
import { ConfirmationModal } from '../../components/ConfirmationModal.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';
import { getErrorMessage } from '../../config/api.js';
import { ROLES } from '../../config/constants.js';
import { exportToExcel } from '../../utils/export.js';

export default function PaymentsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const base = user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.SCHOOL_ACCOUNTANT ? '/school' : '/tuition';
  const isAdmin = user.role === ROLES.ADMIN;

  const [rows, setRows] = useState([]);

  const handleExport = () => {
    const headers = [
      { key: 'receipt_number', label: 'Receipt No' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'parent_name', label: 'Parent Name' },
      { key: 'student_type', label: 'Student Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'payment_date', label: 'Payment Date' },
      { key: 'received_by_name', label: 'Received By' },
      { key: 'status', label: 'Status' }
    ];
    exportToExcel(rows, 'payments_transactions_list', headers);
  };
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [search, setSearch] = useState('');
  const [studentType, setStudentType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await paymentApi.list({
        page, pageSize, search: search || undefined, studentType: studentType || undefined,
        paymentMethod: paymentMethod || undefined, status: status || undefined, date: date || undefined,
      });
      setRows(data.data.items);
      setTotal(data.data.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load payments.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, studentType, paymentMethod, status, date]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  async function handleCancel() {
    setCancelling(true);
    try {
      await paymentApi.cancel(cancelTarget.id, 'Cancelled by admin from payments list');
      toast.success('Payment cancelled.');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not cancel payment.'));
    } finally {
      setCancelling(false);
    }
  }

  const columns = [
    { key: 'receipt_number', header: 'Receipt' },
    { key: 'student_name', header: 'Student' },
    { key: 'parent_name', header: 'Parent' },
    ...(isAdmin ? [{ key: 'student_type', header: 'Type', render: (r) => <Badge color={r.student_type === 'SCHOOL' ? 'blue' : 'orange'}>{r.student_type}</Badge> }] : []),
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'payment_method', header: 'Method', render: (r) => <Badge color={r.payment_method === 'CASH' ? 'gray' : 'blue'}>{r.payment_method}</Badge> },
    { key: 'payment_date', header: 'Date', render: (r) => formatDate(r.payment_date) },
    { key: 'received_by_name', header: 'Accountant' },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`${base}/payments/${r.id}`)} className="btn-ghost !px-2"><Eye className="w-4 h-4" /></button>
          {isAdmin && r.status === 'COMPLETED' && (
            <button onClick={() => setCancelTarget(r)} className="btn-ghost !px-2 text-red-500"><XCircle className="w-4 h-4" /></button>
          )}
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payments"
        description="All recorded fee payments"
        actions={
          <div className="flex gap-2">
            {rows.length > 0 && (
              <Button variant="secondary" onClick={handleExport} className="no-print">
                Export to Excel
              </Button>
            )}
            <Button onClick={() => navigate(`${base}/payments/new`)}><Plus className="w-4 h-4" /> New Payment</Button>
          </div>
        }
      />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Search receipt, student..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <input type="date" className="input w-full" value={date} onChange={(e) => { setDate(e.target.value); setPage(1); }} />
          {isAdmin && (
            <Select className="w-full" placeholder="All Types" value={studentType} onChange={(e) => { setStudentType(e.target.value); setPage(1); }}
              options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]} />
          )}
          <Select className="w-full" placeholder="Cash/UPI" value={paymentMethod} onChange={(e) => { setPaymentMethod(e.target.value); setPage(1); }}
            options={[{ value: 'CASH', label: 'Cash' }, { value: 'UPI', label: 'UPI' }]} />
          <Select className="w-full" placeholder="All Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={[{ value: 'COMPLETED', label: 'Completed' }, { value: 'CANCELLED', label: 'Cancelled' }, { value: 'REVERSED', label: 'Reversed' }]} />
        </div>

        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={load} emptyMessage="No payments recorded for this date." />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      <ConfirmationModal
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this payment?"
        message={`This will cancel receipt ${cancelTarget?.receipt_number}. The record stays in the system for audit purposes but no longer counts toward the student's paid amount.`}
        confirmLabel="Cancel Payment"
      />
    </div>
  );
}
