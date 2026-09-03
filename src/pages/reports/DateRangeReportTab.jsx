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
import { formatCurrency, formatDate, formatDateTime, firstDayOfMonthISO, todayISO } from '../../utils/format.js';
import { IndianRupee, TrendingDown, Wallet } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { triggerPrint } from '../../utils/print.js';
import { exportToExcel } from '../../utils/export.js';

export function DateRangeReportTab({ studentType }) {
  const [fromDate, setFromDate] = useState(firstDayOfMonthISO());
  const [toDate, setToDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const { settings } = useSettings();

  const handleExportBreakdown = () => {
    const headers = [
      { key: 'payment_date', label: 'Date' },
      { key: 'cash_total', label: 'Cash Collection' },
      { key: 'upi_total', label: 'UPI Collection' },
      { key: 'overall_total', label: 'Total Collection' }
    ];
    exportToExcel(data.dailyBreakdown || [], `daterange_report_breakdown_${fromDate}_to_${toDate}`, headers);
  };

  const handleExportExpenses = () => {
    const headers = [
      { key: 'expense_date', label: 'Date' },
      { key: 'category_name', label: 'Category' },
      { key: 'expense_type', label: 'Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'description', label: 'Description' },
      { key: 'created_by_name', label: 'Recorded By' }
    ];
    exportToExcel(data.expensesList || [], `daterange_report_expenses_${fromDate}_to_${toDate}`, headers);
  };

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
            onClick={() => triggerPrint()}
            className="w-full justify-center"
          >
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        </div>
      </div>

      {loading && <LoadingState label="Loading report..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {data && (
        <div className="print-area print-a4">
          {/* Printable A4 Report Header */}
          <div className="hidden print:block mb-6 text-center border-b pb-4">
            <h1 className="text-2xl font-bold text-navy-950">{settings?.institution_name || 'VVSLedger'}</h1>
            {settings?.institution_address && <p className="text-sm text-slate-600 mt-1">{settings.institution_address}</p>}
            {settings?.institution_phone && <p className="text-sm text-slate-600">Ph: {settings.institution_phone}</p>}
            <div className="mt-4 border-t pt-3 flex justify-between text-xs text-slate-500">
              <span className="font-bold uppercase tracking-wider text-sm text-navy-900">Financial Report (Custom Date Range)</span>
              <span>Range: {formatDate(fromDate)} to {formatDate(toDate)}</span>
              <span>Printed on: {formatDateTime(new Date())}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatCard label="Total Collection" value={formatCurrency(data.collection.total_collection)} icon={IndianRupee} tone="success" />
            <StatCard label="Total Expenses" value={formatCurrency(data.expenses)} icon={TrendingDown} tone="warning" />
            <StatCard label="Net Amount" value={formatCurrency(data.netAmount)} icon={Wallet} />
          </div>
          <Card>
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-navy-900">Daily Breakdown</p>
              {data.dailyBreakdown?.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleExportBreakdown} className="no-print">Export to Excel</Button>
              )}
            </div>
            <DataTable columns={columns} rows={data.dailyBreakdown} loading={false} rowKey="payment_date" emptyMessage="No transactions in this date range." />
          </Card>
 
          {data.expensesList && (
            <Card className="mt-4">
              <div className="flex justify-between items-center mb-3">
                <p className="font-semibold text-navy-900">Expenses List</p>
                {data.expensesList.length > 0 && (
                  <Button variant="secondary" size="sm" onClick={handleExportExpenses} className="no-print">Export to Excel</Button>
                )}
              </div>
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
