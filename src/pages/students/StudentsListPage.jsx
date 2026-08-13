import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil } from 'lucide-react';
import { studentApi } from '../../services/student.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Button } from '../../components/Button.jsx';
import { Input } from '../../components/Input.jsx';
import { Select } from '../../components/Select.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatCurrency } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../config/constants.js';
import { StudentFormModal } from './StudentFormModal.jsx';

export default function StudentsListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const base = user.role === ROLES.ADMIN ? '/admin' : user.role === ROLES.SCHOOL_ACCOUNTANT ? '/school' : '/tuition';
  const isAdmin = user.role === ROLES.ADMIN;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [search, setSearch] = useState('');
  const [studentType, setStudentType] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await studentApi.list({
        page, pageSize, search: search || undefined, studentType: studentType || undefined, status: status || undefined,
      });
      setRows(data.data.items);
      setTotal(data.data.total);
    } catch {
      setError('Could not load students.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, studentType, status]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const columns = [
    { key: 'student_code', header: 'ID' },
    { key: 'student_name', header: 'Student' },
    { key: 'parent_name', header: 'Parent' },
    { key: 'parent_phone', header: 'Phone' },
    { key: 'class', header: 'Class', render: (r) => r.class || '—' },
    ...(isAdmin ? [{ key: 'student_type', header: 'Type', render: (r) => <Badge color={r.student_type === 'SCHOOL' ? 'blue' : 'orange'}>{r.student_type}</Badge> }] : []),
    { key: 'total_fee', header: 'Total Fee', render: (r) => formatCurrency(r.total_fee) },
    { key: 'paid_amount', header: 'Paid', render: (r) => formatCurrency(r.paid_amount) },
    { key: 'due_amount', header: 'Due', render: (r) => <span className={r.due_amount > 0 ? 'text-orange-600 font-medium' : 'text-emerald-600'}>{formatCurrency(r.due_amount)}</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
    {
      key: 'actions', header: 'Actions', render: (r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`${base}/students/${r.student_id}`)} className="btn-ghost !px-2"><Eye className="w-4 h-4" /></button>
        </div>
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        description="Manage school and tuition students"
        actions={<Button onClick={() => setFormOpen(true)}><Plus className="w-4 h-4" /> Add Student</Button>}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Search name, parent, ID, or phone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isAdmin && (
            <Select className="w-full sm:w-48" placeholder="All Types" value={studentType} onChange={(e) => { setStudentType(e.target.value); setPage(1); }}
              options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]} />
          )}
          <Select className="w-full sm:w-48" placeholder="All Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} />
        </div>

        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={load} rowKey="student_id" emptyMessage="No students found." />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      <StudentFormModal open={formOpen} onClose={() => setFormOpen(false)} onSuccess={() => { setFormOpen(false); load(); }} />
    </div>
  );
}
