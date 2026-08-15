import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { reportApi } from '../../services/report.service.js';
import { Card } from '../../components/Card.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { Button } from '../../components/Button.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { formatCurrency, formatDate, firstDayOfMonthISO, todayISO } from '../../utils/format.js';
import { IndianRupee, TrendingDown, Wallet } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';

export function DateRangeReportTab() {
  const [fromDate, setFromDate] = useState(firstDayOfMonthISO());
  const [toDate, setToDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.dateRange(fromDate, toDate);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load report.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [fromDate, toDate]); // eslint-disable-line

  const columns = [
    { key: 'payment_date', header: 'Date', render: (r) => formatDate(r.payment_date) },
    { key: 'transaction_count', header: 'Transactions' },
    { key: 'cash', header: 'Cash', render: (r) => formatCurrency(r.cash) },
    { key: 'upi', header: 'UPI', render: (r) => formatCurrency(r.upi) },
    { key: 'total', header: 'Total', render: (r) => formatCurrency(r.total) },
  ];

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 no-print">
        <div className="flex items-center gap-2 flex-1">
          <input type="date" className="input w-full sm:w-auto" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span className="text-slate-400 text-sm shrink-0">to</span>
          <input type="date" className="input w-full sm:w-auto" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <Button variant="secondary" className="sm:ml-auto w-full sm:w-auto justify-center" onClick={() => window.print()}><Printer className="w-4 h-4" /> Print</Button>
      </div>

      {loading && <LoadingState label="Loading report..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <div className="print-area print-a4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatCard label="Total Collection" value={formatCurrency(data.collection.total_collection)} icon={IndianRupee} tone="success" />
            <StatCard label="Total Expenses" value={formatCurrency(data.expenses)} icon={TrendingDown} tone="warning" />
            <StatCard label="Net Amount" value={formatCurrency(data.netAmount)} icon={Wallet} />
          </div>
          <Card>
            <p className="font-semibold text-navy-900 mb-3">Daily Breakdown</p>
            <DataTable columns={columns} rows={data.dailyBreakdown} loading={false} rowKey="payment_date" emptyMessage="No transactions in this date range." />
          </Card>
        </div>
      )}
    </div>
  );
}
