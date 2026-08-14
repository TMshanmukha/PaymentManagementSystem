import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Printer, Wallet } from 'lucide-react';
import { studentApi } from '../../services/student.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Badge } from '../../components/Badge.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/format.js';
import { StudentFormModal } from './StudentFormModal.jsx';
import { IndianRupee, CheckCircle2, AlertCircle, Receipt } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';

export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [s, h] = await Promise.all([studentApi.getOne(id), studentApi.paymentHistory(id)]);
      setStudent(s.data.data);
      setHistory(h.data.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load student details.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]); // eslint-disable-line

  if (loading) return <LoadingState label="Loading student..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!student) return null;

  const columns = [
    { key: 'receipt_number', header: 'Receipt' },
    { key: 'payment_date', header: 'Date', render: (r) => formatDate(r.payment_date) },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'payment_method', header: 'Method', render: (r) => <Badge color={r.payment_method === 'CASH' ? 'gray' : 'blue'}>{r.payment_method}</Badge> },
    { key: 'received_by_name', header: 'Accountant' },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <PageHeader
        title={student.student_name}
        description={`${student.student_code} · ${student.class || '—'} ${student.section || ''} · ${student.student_type}`}
        actions={
          <>
            <Badge status={student.status} />
            <Button variant="secondary" onClick={() => setEditOpen(true)}><Pencil className="w-4 h-4" /> Edit</Button>
            <Button variant="secondary" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print Statement</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Fee" value={formatCurrency(student.total_fee)} icon={IndianRupee} />
        <StatCard label="Total Paid" value={formatCurrency(student.paid_amount)} icon={CheckCircle2} tone="success" />
        <StatCard label="Remaining Due" value={formatCurrency(student.due_amount)} icon={AlertCircle} tone={student.due_amount > 0 ? 'danger' : 'success'} />
        <StatCard label="Payment Count" value={student.payment_count} icon={Receipt} />
      </div>

      <Card className="mb-4">
        <p className="font-semibold text-navy-900 mb-3">Parent / Contact Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div><p className="text-slate-400">Parent Name</p><p className="text-slate-800 font-medium">{student.parent_name}</p></div>
          <div><p className="text-slate-400">Parent Phone</p><p className="text-slate-800 font-medium">{student.parent_phone}</p></div>
          <div><p className="text-slate-400">Last Payment</p><p className="text-slate-800 font-medium">{formatDate(student.last_payment_date)}</p></div>
        </div>
      </Card>

      <Card>
        <p className="font-semibold text-navy-900 mb-3">Payment History</p>
        <DataTable columns={columns} rows={history} loading={false} emptyMessage="No payments recorded for this student yet." />
      </Card>

      <StudentFormModal open={editOpen} onClose={() => setEditOpen(false)} student={student} onSuccess={() => { setEditOpen(false); load(); }} />
    </div>
  );
}
