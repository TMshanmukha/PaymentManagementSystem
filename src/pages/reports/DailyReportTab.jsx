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
import { formatCurrency, formatDate, formatDateTime, todayISO } from '../../utils/format.js';
import { IndianRupee, Banknote, Smartphone, School, BookOpen, Wallet } from 'lucide-react';
import { getErrorMessage } from '../../config/api.js';
import { useSettings } from '../../context/SettingsContext.jsx';
import { triggerPrint } from '../../utils/print.js';
import { exportToExcel } from '../../utils/export.js';

export function DailyReportTab({ studentType }) {
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [printMenuOpen, setPrintMenuOpen] = useState(false);
  const { settings } = useSettings();

  const handleExportTransactions = () => {
    const headers = [
      { key: 'receipt_number', label: 'Receipt No' },
      { key: 'student_name', label: 'Student Name' },
      { key: 'student_code', label: 'Student Code' },
      { key: 'amount', label: 'Amount' },
      { key: 'payment_method', label: 'Payment Method' },
      { key: 'payment_time', label: 'Payment Time' },
      { key: 'entered_by', label: 'Entered By' },
      { key: 'status', label: 'Status' }
    ];
    exportToExcel(data.transactions, `daily_report_payments_${date}`, headers);
  };

  const handleExportExpenses = () => {
    const headers = [
      { key: 'category_name', label: 'Category' },
      { key: 'expense_type', label: 'Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'description', label: 'Description' },
      { key: 'created_by_name', label: 'Recorded By' }
    ];
    exportToExcel(data.expensesList || [], `daily_report_expenses_${date}`, headers);
  };

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await reportApi.daily(date, studentType);
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load daily report.'));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, [date, studentType]); // eslint-disable-line

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
        
        <div className="relative sm:ml-auto w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={() => setPrintMenuOpen((o) => !o)}
            className="w-full justify-center"
          >
            <Printer className="w-4 h-4" /> Print Daily Report
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
              <span className="font-bold uppercase tracking-wider text-sm text-navy-900">Daily Financial Report</span>
              <span>Report Date: {formatDate(date)}</span>
              <span>Printed on: {new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 ${studentType ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-3 mb-4`}>
            <StatCard label="Total Collection" value={formatCurrency(data.summary.total_collection)} icon={IndianRupee} tone="success" />
            <StatCard label="Cash" value={formatCurrency(data.summary.cash_collection)} icon={Banknote} />
            <StatCard label="UPI" value={formatCurrency(data.summary.upi_collection)} icon={Smartphone} />
            {studentType !== 'TUITION' && <StatCard label="School" value={formatCurrency(data.summary.school_collection)} icon={School} />}
            {studentType !== 'SCHOOL' && <StatCard label="Tuition" value={formatCurrency(data.summary.tuition_collection)} icon={BookOpen} />}
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
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-navy-900">Individual Transactions</p>
              {data.transactions?.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleExportTransactions} className="no-print">Export to Excel</Button>
              )}
            </div>
            <DataTable columns={columns} rows={data.transactions} loading={false} emptyMessage="No payments recorded for this date." />
          </Card>

          <Card className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <p className="font-semibold text-navy-900">Individual Expenses</p>
              {data.expensesList?.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleExportExpenses} className="no-print">Export to Excel</Button>
              )}
            </div>
            <DataTable
              columns={[
                { key: 'category_name', header: 'Category' },
                { key: 'expense_type', header: 'Type', render: (r) => <Badge color={r.expense_type === 'SCHOOL' ? 'blue' : r.expense_type === 'TUITION' ? 'orange' : 'gray'}>{r.expense_type}</Badge> },
                { key: 'amount', header: 'Amount', render: (r) => formatCurrency(r.amount) },
                { key: 'description', header: 'Description', render: (r) => r.description || '—' },
                { key: 'created_by_name', header: 'Recorded By' },
              ]}
              rows={data.expensesList || []}
              loading={false}
              rowKey="id"
              emptyMessage="No expenses recorded for this date."
            />
          </Card>

          <Card className="bg-slate-50 border border-slate-200 mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-600 font-medium">
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Total Collection</span>
                  <span className="text-slate-800 text-lg font-bold block mt-0.5">{formatCurrency(data.summary.total_collection)}</span>
                </div>
                <div className="text-slate-350 hidden sm:block text-2xl font-light">-</div>
                <div>
                  <span className="text-slate-400 block text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
                  <span className="text-red-600 text-lg font-bold block mt-0.5">{formatCurrency(data.expenses)}</span>
                </div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-6 text-left sm:text-right">
                <span className="text-slate-500 block text-xs font-bold uppercase tracking-wider">Net Day Collection</span>
                <span className="text-2xl font-black text-emerald-600 block mt-0.5">{formatCurrency(data.netCollection)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
