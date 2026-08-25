import { useEffect, useState } from 'react';
import { reportApi } from '../../services/report.service.js';
import { userApi } from '../../services/user.service.js';
import { triggerPrint } from '../../utils/print.js';
import { Card } from '../../components/Card.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { Select } from '../../components/Select.jsx';
import { Button } from '../../components/Button.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Badge } from '../../components/Badge.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { formatCurrency, formatDate, firstDayOfMonthISO, todayISO } from '../../utils/format.js';
import { useAuth } from '../../hooks/useAuth.js';
import { ROLES } from '../../config/constants.js';
import { IndianRupee, Banknote, Smartphone, Printer } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';

export function AccountantReportTab() {
  const { user } = useAuth();
  const isAdmin = user.role === ROLES.ADMIN;

  const [accountants, setAccountants] = useState([]);
  const [accountantId, setAccountantId] = useState('');
  const [fromDate, setFromDate] = useState(firstDayOfMonthISO());
  const [toDate, setToDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { if (isAdmin) userApi.list().then(({ data }) => setAccountants(data.data)); }, [isAdmin]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.accountant({ accountantId: accountantId || undefined, fromDate, toDate });
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load accountant report.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [accountantId, fromDate, toDate]); // eslint-disable-line

  const columns = [
    { key: 'closing_date', header: 'Date', render: (r) => formatDate(r.closing_date) },
    { key: 'overall_total', header: 'Collection', render: (r) => formatCurrency(r.overall_total) },
    { key: 'status', header: 'Day Closing', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 no-print">
        {isAdmin && (
          <Select className="w-full sm:w-56" placeholder="Select accountant" value={accountantId} onChange={(e) => setAccountantId(e.target.value)}
            options={accountants.map((a) => ({ value: a.id, label: a.full_name }))} />
        )}
        <div className="flex items-center gap-2 flex-1">
          <input type="date" className="input w-full sm:w-auto" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span className="text-slate-400 text-sm shrink-0">to</span>
          <input type="date" className="input w-full sm:w-auto" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <Button variant="secondary" className="sm:ml-auto w-full sm:w-auto justify-center" onClick={() => triggerPrint('A4')}><Printer className="w-4 h-4" /> Print</Button>
      </div>

      {loading && <LoadingState label="Loading report..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <div className="print-area print-a4">
          <Card className="mb-4">
            <p className="font-semibold text-navy-900 mb-1">{data.summary.full_name || 'Accountant'}</p>
            <p className="text-sm text-slate-400 mb-4">{data.summary.role}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Collection" value={formatCurrency(data.summary.total_collection)} icon={IndianRupee} tone="success" />
              <StatCard label="Cash Collected" value={formatCurrency(data.summary.cash_collected)} icon={Banknote} />
              <StatCard label="UPI Collected" value={formatCurrency(data.summary.upi_collected)} icon={Smartphone} />
              <StatCard label="Transactions" value={data.summary.total_transactions} />
            </div>
          </Card>
          <Card>
            <p className="font-semibold text-navy-900 mb-3">Day Closing History</p>
            <DataTable columns={columns} rows={data.dayClosings} loading={false} rowKey="closing_date" emptyMessage="No day closings in this range." />
          </Card>
        </div>
      )}
    </div>
  );
}
