import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { reportApi } from '../../services/report.service.js';
import { Card } from '../../components/Card.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { Button } from '../../components/Button.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { Badge } from '../../components/Badge.jsx';
import { formatCurrency, formatDateTime, todayISO } from '../../utils/format.js';
import { IndianRupee, Banknote, Smartphone, School, BookOpen, Wallet } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';

export function DailyReportTab() {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.daily(date);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load daily report.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [date]); // eslint-disable-line

  const columns = [
    { key: 'receipt_number', header: 'Receipt' },
    { key: 'student_name', header: 'Student' },
    { key: 'parent_name', header: 'Parent' },
    { key: 'student_type', header: 'Type', render: (r) => <Badge color={r.student_type === 'SCHOOL' ? 'blue' : 'orange'}>{r.student_type}</Badge> },
    { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
    { key: 'payment_method', header: 'Method', render: (r) => <Badge color={r.payment_method === 'CASH' ? 'gray' : 'blue'}>{r.payment_method}</Badge> },
    { key: 'payment_time', header: 'Time', render: (r) => formatDateTime(r.payment_time) },
    { key: 'entered_by', header: 'Entered By' },
    { key: 'status', header: 'Status', render: (r) => <Badge status={r.status} /> },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 no-print">
        <input type="date" className="input w-full sm:w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        <Button variant="secondary" onClick={() => window.print()} className="w-full sm:w-auto justify-center"><Printer className="w-4 h-4" /> Print Daily Report</Button>
      </div>

      {loading && <LoadingState label="Loading report..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <div className="print-area">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <StatCard label="Total Collection" value={formatCurrency(data.summary.total_collection)} icon={IndianRupee} tone="success" />
            <StatCard label="Cash" value={formatCurrency(data.summary.cash_collection)} icon={Banknote} />
            <StatCard label="UPI" value={formatCurrency(data.summary.upi_collection)} icon={Smartphone} />
            <StatCard label="School" value={formatCurrency(data.summary.school_collection)} icon={School} />
            <StatCard label="Tuition" value={formatCurrency(data.summary.tuition_collection)} icon={BookOpen} />
          </div>

          <Card className="mb-4">
            <p className="font-semibold text-navy-900 mb-3">Accountant-wise Breakdown</p>
            {data.accountantBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No transactions recorded for this date.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.accountantBreakdown.map((a) => (
                  <div key={a.received_by} className="border border-slate-100 rounded-lg p-3">
                    <p className="font-medium text-slate-800">{a.accountant_name}</p>
                    <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                      <div><p className="text-slate-400 text-xs">Txns</p><p className="font-semibold">{a.transaction_count}</p></div>
                      <div><p className="text-slate-400 text-xs">Cash</p><p className="font-semibold">{formatCurrency(a.cash_total)}</p></div>
                      <div><p className="text-slate-400 text-xs">UPI</p><p className="font-semibold">{formatCurrency(a.upi_total)}</p></div>
                    </div>
                    <p className="mt-2 text-sm font-bold text-brand-700">Total: {formatCurrency(a.overall_total)}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="mb-4">
            <p className="font-semibold text-navy-900 mb-3">Individual Transactions</p>
            <DataTable columns={columns} rows={data.transactions} loading={false} emptyMessage="No payments recorded for this date." />
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Expenses</p>
                <p className="text-lg font-bold text-red-500">{formatCurrency(data.expenses)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Net Collection</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.netCollection)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
