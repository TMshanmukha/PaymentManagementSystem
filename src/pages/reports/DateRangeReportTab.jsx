import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import { reportApi } from '../../services/report.service.js';
import { Card } from '../../components/Card.jsx';
import { StatCard } from '../../components/StatCard.jsx';
import { Button } from '../../components/Button.jsx';
import { DataTable } from '../../components/DataTable.jsx';
import { Badge } from '../../components/Badge.jsx';
import { LoadingState } from '../../components/LoadingState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { formatCurrency, formatDate, firstDayOfMonthISO, todayISO } from '../../utils/format.js';
import { IndianRupee, TrendingDown, Wallet } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { triggerPrint } from '../../utils/print.js';

export function DateRangeReportTab({ studentType }) {
  const [fromDate, setFromDate] = useState(firstDayOfMonthISO());
  const [toDate, setToDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const { settings } = useSettings();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.dateRange(fromDate, toDate, studentType);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load report.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [fromDate, toDate, studentType]); // eslint-disable-line

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
        <div className="relative sm:ml-auto w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => setPrintMenuOpen((o) => !o)}
            className="w-full justify-center"
          >
            <Printer className="w-4 h-4" /> Print Report
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
                  <p className="text-xs text-slate-400">Optimized report scaling</p>
                </button>
                <button
                  onClick={() => { setPrintMenuOpen(false); triggerPrint('A5'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 border-b border-slate-100"
                >
                  <p className="font-semibold text-slate-800">Print A5 Size</p>
                  <p className="text-xs text-slate-400">Compact scale</p>
                </button>
                <button
                  onClick={() => { setPrintMenuOpen(false); triggerPrint('NORMAL'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <p className="font-semibold text-slate-800">Normal / Default</p>
                  <p className="text-xs text-slate-400">Browser standard</p>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {loading && <LoadingState label="Loading report..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <div className="print-area print-a4">
          {/* Printable A4 Report Header */}
          <div className="hidden print:block mb-6 text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-navy-950">{settings?.institution_name || 'EduLedger'}</h1>
            {settings?.institution_address && <p className="text-sm text-slate-600 mt-1">{settings.institution_address}</p>}
            {settings?.institution_phone && <p className="text-sm text-slate-600">Ph: {settings.institution_phone}</p>}
            <div className="mt-4 border-t pt-3 flex justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-sm text-navy-900">Financial Report (Custom Date Range)</span>
              <span>Range: {formatDate(fromDate)} to {formatDate(toDate)}</span>
              <span>Printed on: {new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatCard label="Total Collection" value={formatCurrency(data.collection.total_collection)} icon={IndianRupee} tone="success" />
            <StatCard label="Total Expenses" value={formatCurrency(data.expenses)} icon={TrendingDown} tone="warning" />
            <StatCard label="Net Amount" value={formatCurrency(data.netAmount)} icon={Wallet} />
          </div>
          <Card>
            <p className="font-semibold text-navy-900 mb-3">Daily Breakdown</p>
            <DataTable columns={columns} rows={data.dailyBreakdown} loading={false} rowKey="payment_date" emptyMessage="No transactions in this date range." />
          </Card>

          {data.expensesList && (
            <Card className="mt-4">
              <p className="font-semibold text-navy-900 mb-3">Expenses List</p>
              <DataTable
                columns={[
                  { key: 'expense_date', header: 'Date', render: (r) => formatDate(r.expense_date) },
                  { key: 'category_name', header: 'Category' },
                  { key: 'expense_type', header: 'Type', render: (r) => <Badge color={r.expense_type === 'SCHOOL' ? 'blue' : r.expense_type === 'TUITION' ? 'orange' : 'gray'}>{r.expense_type}</Badge> },
                  { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
                  { key: 'description', header: 'Description', render: (r) => r.description || '—' },
                  { key: 'created_by_name', header: 'Recorded By' },
                ]}
                rows={data.expensesList}
                loading={false}
                rowKey="id"
                emptyMessage="No expenses recorded for this date range."
              />
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
