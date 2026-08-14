import { useEffect, useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { reportApi } from '../../services/report.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Select } from '../../components/Select.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { Badge } from '../../components/Badge.jsx';
import { Button } from '../../components/Button.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../config/constants.js';
import { getErrorMessage } from '../../config/api.js';

export default function DuePage() {
  const { user } = useAuth();
  const isAdmin = user.role === ROLES.ADMIN;

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [search, setSearch] = useState('');
  const [studentType, setStudentType] = useState('');
  const [fullyPaid, setFullyPaid] = useState('false');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await reportApi.due({
        page, pageSize, search: search || undefined, studentType: studentType || undefined, fullyPaid,
      });
      setRows(data.data.items);
      setTotal(data.data.total);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load due report.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page, studentType, fullyPaid]); // eslint-disable-line
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load(); }, 350);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  const columns = [
    { key: 'student_code', header: 'ID' },
    { key: 'student_name', header: 'Student' },
    { key: 'parent_name', header: 'Parent' },
    ...(isAdmin ? [{ key: 'student_type', header: 'Type', render: (r) => <Badge color={r.student_type === 'SCHOOL' ? 'blue' : 'orange'}>{r.student_type}</Badge> }] : []),
    { key: 'total_fee', header: 'Total Fee', render: (r) => formatCurrency(r.total_fee) },
    { key: 'paid_amount', header: 'Paid', render: (r) => formatCurrency(r.paid_amount) },
    { key: 'due_amount', header: 'Due', render: (r) => <span className={`font-semibold ${r.due_amount > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>{formatCurrency(r.due_amount)}</span> },
    { key: 'last_payment_date', header: 'Last Payment', render: (r) => formatDate(r.last_payment_date) },
  ];

  return (
    <div>
      <PageHeader
        title="Due Management"
        description="Students with outstanding fee balances"
        actions={<Button variant="secondary" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</Button>}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 mb-4 no-print">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input className="input pl-9" placeholder="Search student or parent..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {isAdmin && (
            <Select className="w-full sm:w-40" placeholder="All Types" value={studentType} onChange={(e) => { setStudentType(e.target.value); setPage(1); }}
              options={[{ value: 'SCHOOL', label: 'School' }, { value: 'TUITION', label: 'Tuition' }]} />
          )}
          <Select className="w-full sm:w-48" value={fullyPaid} onChange={(e) => { setFullyPaid(e.target.value); setPage(1); }}
            options={[{ value: 'false', label: 'With Due Only' }, { value: 'true', label: 'Fully Paid Only' }, { value: '', label: 'All Students' }]} />
        </div>

        <div className="print-area">
          <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={load} rowKey="student_id" emptyMessage="No students found for this filter." />
        </div>
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
