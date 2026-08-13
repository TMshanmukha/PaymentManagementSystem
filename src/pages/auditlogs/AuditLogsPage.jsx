import { useEffect, useState } from 'react';
import { auditLogApi } from '../../services/auditLog.service.js';
import { Card } from '../../components/Card.jsx';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Select } from '../../components/Select.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Pagination } from '../../components/Pagination.jsx';
import { formatDateTime, firstDayOfMonthISO, todayISO } from '../../utils/format.js';

const ACTIONS = [
  'LOGIN', 'LOGOUT', 'STUDENT_CREATED', 'STUDENT_UPDATED', 'STUDENT_DEACTIVATED', 'STUDENT_ACTIVATED',
  'PAYMENT_CREATED', 'PAYMENT_CANCELLED', 'PAYMENT_REVERSED', 'EXPENSE_CREATED', 'EXPENSE_UPDATED',
  'DAY_CLOSING_SUBMITTED', 'DAY_CLOSING_APPROVED', 'DAY_CLOSING_REOPENED',
  'USER_CREATED', 'USER_ACTIVATED', 'USER_DEACTIVATED', 'USER_PASSWORD_RESET',
];

export default function AuditLogsPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [action, setAction] = useState('');
  const [fromDate, setFromDate] = useState(firstDayOfMonthISO());
  const [toDate, setToDate] = useState(todayISO());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data } = await auditLogApi.list({ page, pageSize, action: action || undefined, fromDate, toDate });
      setRows(data.data.items);
      setTotal(data.data.total);
    } catch {
      setError('Could not load audit logs.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [page, action, fromDate, toDate]); // eslint-disable-line

  const columns = [
    { key: 'created_at', header: 'Time', render: (r) => formatDateTime(r.created_at) },
    { key: 'user_name', header: 'User', render: (r) => r.user_name || 'System' },
    { key: 'action', header: 'Action', render: (r) => r.action.replaceAll('_', ' ') },
    { key: 'entity', header: 'Entity', render: (r) => `${r.entity}${r.entity_id ? ' #' + r.entity_id : ''}` },
    { key: 'description', header: 'Description' },
  ];

  return (
    <div>
      <PageHeader title="Audit Logs" description="Every important financial and system action, in order" />

      <Card>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <Select className="w-full sm:w-56" placeholder="All Actions" value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
            options={ACTIONS.map((a) => ({ value: a, label: a.replaceAll('_', ' ') }))} />
          <div className="flex items-center gap-2 flex-1">
            <input type="date" className="input w-full sm:w-auto" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            <span className="text-slate-400 text-sm shrink-0">to</span>
            <input type="date" className="input w-full sm:w-auto" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        <DataTable columns={columns} rows={rows} loading={loading} error={error} onRetry={load} emptyMessage="No audit events found for this filter." />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>
    </div>
  );
}
